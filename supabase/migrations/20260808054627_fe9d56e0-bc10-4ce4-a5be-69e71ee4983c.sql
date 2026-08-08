
-- ========== roles ==========
create type public.app_role as enum ('admin','customer');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(auth.uid(), 'admin')
$$;

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
          new.email,
          new.raw_user_meta_data->>'phone')
  on conflict (id) do nothing;

  if lower(coalesce(new.email,'')) = 'yerasimanjunath@gmail.com' then
    insert into public.user_roles (user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;
  insert into public.user_roles (user_id, role) values (new.id, 'customer') on conflict do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "own profile write" on public.profiles for update to authenticated using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());

create policy "roles read" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "admins manage roles" on public.user_roles for all to authenticated using (public.is_admin()) with check (public.is_admin());

create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();

-- ========== categories ==========
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.categories to anon;
grant select, insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "public read categories" on public.categories for select to anon, authenticated using (is_active or public.is_admin());
create policy "admins manage categories" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger categories_updated before update on public.categories for each row execute function public.set_updated_at();

-- ========== products ==========
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sku text unique,
  description text,
  short_description text,
  category_id uuid references public.categories(id) on delete set null,
  subcategory text,
  fabric text,
  saree_type text,
  occasion text,
  color text,
  pattern text,
  border_type text,
  blouse_included boolean not null default true,
  saree_length text,
  blouse_length text,
  mrp numeric(10,2) not null default 0 check (mrp >= 0),
  selling_price numeric(10,2) not null default 0 check (selling_price >= 0),
  discount_percentage int not null default 0,
  stock_quantity int not null default 0 check (stock_quantity >= 0),
  low_stock_threshold int not null default 3,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  is_bestseller boolean not null default false,
  is_new boolean not null default false,
  is_demo boolean not null default false,
  tags text[] not null default '{}',
  rating numeric(2,1) not null default 0,
  review_count int not null default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_idx on public.products(category_id);
create index products_active_idx on public.products(is_active);
grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "public read products" on public.products for select to anon, authenticated using (is_active or public.is_admin());
create policy "admins manage products" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace function public.products_compute()
returns trigger language plpgsql set search_path = public as $$
begin
  new.discount_percentage = case when new.mrp > 0 and new.mrp > new.selling_price
    then round(((new.mrp - new.selling_price) / new.mrp) * 100)::int else 0 end;
  new.updated_at = now();
  return new;
end; $$;
create trigger products_compute_trg before insert or update on public.products for each row execute function public.products_compute();

-- ========== product images ==========
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  storage_path text,
  alt_text text,
  display_order int not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);
create index product_images_product_idx on public.product_images(product_id);
grant select on public.product_images to anon;
grant select, insert, update, delete on public.product_images to authenticated;
grant all on public.product_images to service_role;
alter table public.product_images enable row level security;
create policy "public read product images" on public.product_images for select to anon, authenticated using (true);
create policy "admins manage product images" on public.product_images for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ========== orders ==========
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default 'MS' || to_char(now(),'YYMMDD') || lpad((floor(random()*100000))::text,5,'0'),
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  address_line text not null,
  city text not null,
  state text not null,
  pincode text not null,
  subtotal numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  shipping_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  coupon_code text,
  payment_method text not null default 'upi',
  payment_status text not null default 'pending',
  order_status text not null default 'payment_verification_pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_user_idx on public.orders(user_id);
grant select, insert on public.orders to anon;
grant select, insert, update on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "own orders read" on public.orders for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "create own order" on public.orders for insert to authenticated with check (user_id = auth.uid());
create policy "admins update orders" on public.orders for update to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger orders_updated before update on public.orders for each row execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_image text,
  unit_price numeric(10,2) not null default 0,
  quantity int not null default 1 check (quantity > 0),
  line_total numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);
create index order_items_order_idx on public.order_items(order_id);
grant select, insert on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;
create policy "own order items read" on public.order_items for select to authenticated
  using (public.is_admin() or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "own order items insert" on public.order_items for insert to authenticated
  with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

-- ========== payments ==========
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  payment_method text not null default 'upi',
  amount numeric(10,2) not null default 0,
  upi_id text,
  utr_number text,
  payer_name text,
  payer_phone text,
  payment_screenshot_url text,
  payment_status text not null default 'pending',
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index payments_order_idx on public.payments(order_id);
grant select, insert on public.payments to authenticated;
grant update on public.payments to authenticated;
grant all on public.payments to service_role;
alter table public.payments enable row level security;
create policy "own payments read" on public.payments for select to authenticated
  using (public.is_admin() or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "own payments insert" on public.payments for insert to authenticated
  with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
              and payment_status in ('pending','verification_pending'));
create policy "admins update payments" on public.payments for update to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger payments_updated before update on public.payments for each row execute function public.set_updated_at();

-- ========== wishlists ==========
create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);
grant select, insert, delete on public.wishlists to authenticated;
grant all on public.wishlists to service_role;
alter table public.wishlists enable row level security;
create policy "own wishlist" on public.wishlists for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ========== reviews ==========
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text,
  rating int not null check (rating between 1 and 5),
  title text,
  body text,
  is_approved boolean not null default false,
  is_verified_purchase boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index reviews_product_idx on public.reviews(product_id);
grant select on public.reviews to anon;
grant select, insert, update, delete on public.reviews to authenticated;
grant all on public.reviews to service_role;
alter table public.reviews enable row level security;
create policy "public read approved reviews" on public.reviews for select to anon, authenticated
  using (is_approved or user_id = auth.uid() or public.is_admin());
create policy "customers write own review" on public.reviews for insert to authenticated with check (user_id = auth.uid());
create policy "admins manage reviews" on public.reviews for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger reviews_updated before update on public.reviews for each row execute function public.set_updated_at();

-- ========== store settings ==========
create table public.store_settings (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null default true unique,
  store_name text not null default 'MS Silks Dharmavaram',
  logo_url text,
  phone text,
  whatsapp_number text,
  email text,
  address text,
  instagram_url text,
  facebook_url text,
  free_shipping_threshold numeric(10,2) not null default 0,
  default_shipping_fee numeric(10,2) not null default 0,
  announcement text,
  return_policy text,
  privacy_policy text,
  terms text,
  upi_id text,
  upi_payee_name text,
  upi_qr_url text,
  payment_instructions text,
  upi_enabled boolean not null default true,
  cod_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.store_settings to anon;
grant select, insert, update on public.store_settings to authenticated;
grant all on public.store_settings to service_role;
alter table public.store_settings enable row level security;
create policy "public read settings" on public.store_settings for select to anon, authenticated using (true);
create policy "admins manage settings" on public.store_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger store_settings_updated before update on public.store_settings for each row execute function public.set_updated_at();

insert into public.store_settings (singleton, phone, whatsapp_number, address, instagram_url, upi_payee_name)
values (true, '+91 90599 88913', '919059988913',
  '11/282, Near Ramalayam Temple, Thogata Street, Dharmavaram, Andhra Pradesh 515671',
  'https://www.instagram.com/ms_silks.dharmavaram', 'MS Silks Dharmavaram');

-- ========== stock decrement helper ==========
create or replace function public.decrement_stock(_product_id uuid, _qty int)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.products set stock_quantity = greatest(stock_quantity - _qty, 0) where id = _product_id;
end; $$;

-- ========== seed categories + demo products ==========
insert into public.categories (name, slug, sort_order) values
  ('Dharmavaram Silk','dharmavaram-silk',1),
  ('Kanjivaram Silk','kanjivaram-silk',2),
  ('Banarasi Silk','banarasi-silk',3),
  ('Soft Silk','soft-silk',4),
  ('Bridal Sarees','bridal-sarees',5),
  ('Festival Sarees','festival-sarees',6),
  ('Designer Sarees','designer-sarees',7),
  ('Cotton Sarees','cotton-sarees',8);

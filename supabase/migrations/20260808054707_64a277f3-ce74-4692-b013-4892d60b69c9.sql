
-- lock down internal helpers
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.products_compute() from public, anon, authenticated;
drop function if exists public.decrement_stock(uuid, int);

-- stock decrement via trigger instead of callable RPC
create or replace function public.order_item_decrement_stock()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.product_id is not null then
    update public.products
      set stock_quantity = greatest(stock_quantity - new.quantity, 0)
    where id = new.product_id;
  end if;
  return new;
end; $$;
revoke all on function public.order_item_decrement_stock() from public, anon, authenticated;
create trigger order_items_stock after insert on public.order_items
  for each row execute function public.order_item_decrement_stock();

-- split anon/authenticated policies so anon never needs is_admin()
drop policy "public read categories" on public.categories;
create policy "anon read categories" on public.categories for select to anon using (is_active);
create policy "auth read categories" on public.categories for select to authenticated using (is_active or public.is_admin());

drop policy "public read products" on public.products;
create policy "anon read products" on public.products for select to anon using (is_active);
create policy "auth read products" on public.products for select to authenticated using (is_active or public.is_admin());

drop policy "public read approved reviews" on public.reviews;
create policy "anon read reviews" on public.reviews for select to anon using (is_approved);
create policy "auth read reviews" on public.reviews for select to authenticated
  using (is_approved or user_id = auth.uid() or public.is_admin());

revoke all on function public.has_role(uuid, public.app_role) from public, anon;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;
grant execute on function public.is_admin() to authenticated;

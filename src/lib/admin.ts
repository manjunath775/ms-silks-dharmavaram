import { supabase } from "@/integrations/supabase/client";
import { mapProduct, slugify, type Product } from "./db";

const BUCKET = "product-images";
const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export function validateImage(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type.toLowerCase()))
    return `${file.name}: only JPG, PNG or WEBP images are allowed.`;
  if (file.size > MAX_IMAGE_BYTES) return `${file.name}: image must be smaller than 8 MB.`;
  return null;
}

export type UploadedImage = { url: string; path: string };

/** Uploads to private storage and returns a long-lived signed URL. */
export async function uploadProductImage(file: File): Promise<UploadedImage> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `products/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  const { data, error: signErr } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, TEN_YEARS);
  if (signErr || !data) throw signErr ?? new Error("Could not create image URL");
  return { url: data.signedUrl, path };
}

export async function removeStorageObjects(paths: string[]) {
  const clean = paths.filter(Boolean);
  if (!clean.length) return;
  await supabase.storage.from(BUCKET).remove(clean);
}

export async function fetchAdminProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(*), categories(name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => mapProduct(r as never));
}

export type ProductImageInput = { url: string; path: string | null; isPrimary: boolean };

export type ProductInput = {
  id?: string;
  sku: string;
  name: string;
  description: string;
  categoryId: string | null;
  price: number;
  mrp: number;
  available: boolean;
  featured: boolean;
  newArrival: boolean;
  stock: number;
  images: ProductImageInput[];
};

export async function saveProduct(input: ProductInput) {
  const payload = {
    name: input.name,
    slug: `${slugify(input.name)}-${input.sku.toLowerCase()}`,
    sku: input.sku,
    description: input.description,
    short_description: input.description.slice(0, 160),
    category_id: input.categoryId,
    mrp: input.mrp > 0 ? input.mrp : input.price,
    selling_price: input.price,
    stock_quantity: input.available ? Math.max(input.stock, 1) : 0,
    is_active: true,
    is_featured: input.featured,
    is_new: input.newArrival,
    is_demo: false,
  };

  let productId = input.id;
  if (productId) {
    const { error } = await supabase.from("products").update(payload).eq("id", productId);
    if (error) throw error;
  } else {
    const { data, error } = await supabase.from("products").insert(payload).select("id").single();
    if (error) throw error;
    productId = data.id;
  }

  // Sync images: remove rows (and storage objects) that are gone, insert new ones.
  const { data: existing } = await supabase
    .from("product_images")
    .select("id, image_url, storage_path")
    .eq("product_id", productId!);

  const keepUrls = new Set(input.images.map((i) => i.url));
  const stale = (existing ?? []).filter((r) => !keepUrls.has(r.image_url));
  if (stale.length) {
    await supabase
      .from("product_images")
      .delete()
      .in(
        "id",
        stale.map((s) => s.id),
      );
    await removeStorageObjects(stale.map((s) => s.storage_path).filter(Boolean) as string[]);
  }

  const existingUrls = new Set((existing ?? []).map((r) => r.image_url));
  const toInsert = input.images
    .map((img, i) => ({
      product_id: productId!,
      image_url: img.url,
      storage_path: img.path,
      alt_text: `${input.name} — MS Silks Dharmavaram saree photo ${i + 1}`,
      display_order: i,
      is_primary: img.isPrimary,
    }))
    .filter((r) => !existingUrls.has(r.image_url));
  if (toInsert.length) {
    const { error } = await supabase.from("product_images").insert(toInsert);
    if (error) throw error;
  }

  // Keep ordering / primary flag in sync for images that already existed.
  for (const [i, img] of input.images.entries()) {
    if (!existingUrls.has(img.url)) continue;
    await supabase
      .from("product_images")
      .update({ display_order: i, is_primary: img.isPrimary })
      .eq("product_id", productId!)
      .eq("image_url", img.url);
  }

  return productId!;
}

export async function setProductAvailability(id: string, available: boolean) {
  const { error } = await supabase
    .from("products")
    .update({ stock_quantity: available ? 5 : 0 })
    .eq("id", id);
  if (error) throw error;
}

export async function setProductFeatured(id: string, featured: boolean) {
  const { error } = await supabase.from("products").update({ is_featured: featured }).eq("id", id);
  if (error) throw error;
}

export async function deleteProduct(id: string) {
  const { data: imgs } = await supabase
    .from("product_images")
    .select("storage_path")
    .eq("product_id", id);
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
  await removeStorageObjects((imgs ?? []).map((i) => i.storage_path).filter(Boolean) as string[]);
}

export async function saveStoreSettings(patch: {
  store_name?: string;
  phone?: string;
  whatsapp_number?: string;
  instagram_url?: string;
  address?: string;
  announcement?: string;
}) {
  const { data: row } = await supabase.from("store_settings").select("id").limit(1).maybeSingle();
  if (row) {
    const { error } = await supabase.from("store_settings").update(patch).eq("id", row.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("store_settings").insert(patch);
    if (error) throw error;
  }
}

export async function isCurrentUserAdmin() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return false;
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userData.user.id,
    _role: "admin",
  });
  if (error) return false;
  return Boolean(data);
}

/* ---------------- Orders ---------------- */

export type AdminOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  city: string;
  state: string;
  address_line: string;
  pincode: string;
  total: number;
  order_status: string;
  payment_status: string;
  created_at: string;
  order_items: { id: string; product_name: string; quantity: number; line_total: number }[];
  payments: {
    id: string;
    utr_number: string | null;
    payer_name: string | null;
    payer_phone: string | null;
    payment_screenshot_url: string | null;
    payment_status: string;
    amount: number;
  }[];
};

export async function fetchAdminOrders(): Promise<AdminOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(id, product_name, quantity, line_total), payments(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as AdminOrder[];
}

export async function updateOrderStatus(id: string, order_status: string) {
  const { error } = await supabase.from("orders").update({ order_status }).eq("id", id);
  if (error) throw error;
}

export async function setPaymentVerdict(
  orderId: string,
  paymentId: string,
  verdict: "confirmed" | "rejected",
  adminNote?: string,
) {
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("payments")
    .update({
      payment_status: verdict,
      verified_by: userData.user?.id ?? null,
      verified_at: new Date().toISOString(),
      admin_note: adminNote ?? null,
    })
    .eq("id", paymentId);
  if (error) throw error;
  const { error: oErr } = await supabase
    .from("orders")
    .update({
      payment_status: verdict,
      order_status: verdict === "confirmed" ? "confirmed" : "cancelled",
    })
    .eq("id", orderId);
  if (oErr) throw oErr;
}

/* ---------------- Admin users ---------------- */

export async function fetchAdmins() {
  const { data, error } = await supabase
    .from("user_roles")
    .select("id, user_id, role, created_at")
    .eq("role", "admin");
  if (error) throw error;
  const ids = (data ?? []).map((r) => r.user_id);
  if (!ids.length) return [];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .in("id", ids);
  return (data ?? []).map((r) => ({
    ...r,
    email: profiles?.find((p) => p.id === r.user_id)?.email ?? "—",
    full_name: profiles?.find((p) => p.id === r.user_id)?.full_name ?? "",
  }));
}

export async function addAdminByEmail(email: string) {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();
  if (error) throw error;
  if (!profile) throw new Error("No account found with that email. Ask them to sign up first.");
  const { error: insErr } = await supabase
    .from("user_roles")
    .insert({ user_id: profile.id, role: "admin" });
  if (insErr) throw insErr;
}

export async function removeAdmin(roleRowId: string) {
  const { error } = await supabase.from("user_roles").delete().eq("id", roleRowId);
  if (error) throw error;
}

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type ProductRow = Database["public"]["Tables"]["products"]["Row"];
export type ProductImageRow = Database["public"]["Tables"]["product_images"]["Row"];
export type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
export type StoreSettingsRow = Database["public"]["Tables"]["store_settings"]["Row"];
export type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];
export type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];
export type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];

/** App-wide view model for a saree. */
export type Product = {
  id: string;
  slug: string;
  sku: string | null;
  name: string;
  description: string;
  shortDescription: string;
  categoryId: string | null;
  category: string;
  subcategory: string | null;
  fabric: string;
  sareeType: string | null;
  occasion: string;
  color: string;
  pattern: string | null;
  borderType: string | null;
  blouseIncluded: boolean;
  sareeLength: string;
  blouseLength: string | null;
  price: number;
  offerPrice: number;
  discount: number;
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  isDemo: boolean;
  tags: string[];
  rating: number;
  reviews: number;
  seoTitle: string | null;
  seoDescription: string | null;
  images: string[];
  imageRows: Pick<ProductImageRow, "id" | "image_url" | "storage_path" | "alt_text" | "display_order" | "is_primary">[];
  createdAt: string;
};

const PLACEHOLDER = "/demo/placeholder-saree.jpg";

type RowWithImages = ProductRow & {
  product_images?: ProductImageRow[] | null;
  categories?: { name: string } | null;
};

export function mapProduct(row: RowWithImages): Product {
  const imgs = [...(row.product_images ?? [])].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.display_order - b.display_order,
  );
  return {
    id: row.id,
    slug: row.slug,
    sku: row.sku,
    name: row.name,
    description: row.description ?? "",
    shortDescription: row.short_description ?? "",
    categoryId: row.category_id,
    category: row.categories?.name ?? row.subcategory ?? "Sarees",
    subcategory: row.subcategory,
    fabric: row.fabric ?? "",
    sareeType: row.saree_type,
    occasion: row.occasion ?? "",
    color: row.color ?? "",
    pattern: row.pattern,
    borderType: row.border_type,
    blouseIncluded: row.blouse_included,
    sareeLength: row.saree_length ?? "",
    blouseLength: row.blouse_length,
    price: Number(row.mrp),
    offerPrice: Number(row.selling_price),
    discount: row.discount_percentage,
    stock: row.stock_quantity,
    lowStockThreshold: row.low_stock_threshold,
    isActive: row.is_active,
    featured: row.is_featured,
    bestseller: row.is_bestseller,
    newArrival: row.is_new,
    isDemo: row.is_demo,
    tags: row.tags ?? [],
    rating: Number(row.rating),
    reviews: row.review_count,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    images: imgs.length ? imgs.map((i) => i.image_url) : [PLACEHOLDER],
    imageRows: imgs,
    createdAt: row.created_at,
  };
}

const SELECT = "*, product_images(*), categories(name)";

export async function fetchProducts(opts?: { activeOnly?: boolean; limit?: number }) {
  let q = supabase.from("products").select(SELECT).order("created_at", { ascending: false });
  if (opts?.activeOnly !== false) q = q.eq("is_active", true);
  if (opts?.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw error;
  return (data as RowWithImages[]).map(mapProduct);
}

export async function fetchProductBySlug(slug: string) {
  const byUuid = /^[0-9a-f-]{36}$/i.test(slug);
  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .eq(byUuid ? "id" : "slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProduct(data as RowWithImages) : null;
}

export async function fetchCategories(activeOnly = true) {
  let q = supabase.from("categories").select("*").order("sort_order");
  if (activeOnly) q = q.eq("is_active", true);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function fetchSettings(): Promise<StoreSettingsRow | null> {
  const { data, error } = await supabase.from("store_settings").select("*").limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchApprovedReviews(productId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function upiLink(opts: { vpa: string; name: string; amount: number; note: string }) {
  const p = new URLSearchParams({
    pa: opts.vpa,
    pn: opts.name,
    am: opts.amount.toFixed(2),
    cu: "INR",
    tn: opts.note,
  });
  return `upi://pay?${p.toString()}`;
}

export const ORDER_STATUSES = [
  "payment_verification_pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
] as const;

export const ORDER_STATUS_LABEL: Record<string, string> = {
  payment_verification_pending: "Payment Verification Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  verification_pending: "Awaiting Verification",
  confirmed: "Confirmed",
  rejected: "Rejected",
  refunded: "Refunded",
};

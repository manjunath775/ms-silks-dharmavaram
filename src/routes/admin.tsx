import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Boxes,
  IndianRupee,
  ImagePlus,
  Loader2,
  LayoutDashboard,
  Pencil,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Settings as SettingsIcon,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatINR, fetchCategories, fetchSettings, ORDER_STATUSES, ORDER_STATUS_LABEL, type Product } from "@/lib/db";
import {
  addAdminByEmail,
  deleteProduct,
  fetchAdminOrders,
  fetchAdmins,
  fetchAdminProducts,
  isCurrentUserAdmin,
  removeAdmin,
  saveProduct,
  saveStoreSettings,
  setPaymentVerdict,
  setProductAvailability,
  setProductFeatured,
  updateOrderStatus,
  uploadProductImage,
  validateImage,
  type ProductImageInput,
} from "@/lib/admin";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Portal — MS Silks Dharmavaram" },
      { name: "description", content: "Manage sarees, orders, payments and store settings for MS Silks Dharmavaram." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Admin,
});

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Boxes },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "settings", label: "Store Settings", icon: SettingsIcon },
  { id: "admins", label: "Admins", icon: ShieldCheck },
] as const;

function Admin() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("overview");
  const { data: allowed, isLoading } = useQuery({
    queryKey: ["is-admin"],
    queryFn: isCurrentUserAdmin,
    staleTime: 60_000,
  });

  if (isLoading)
    return (
      <div className="container-luxe grid place-items-center py-24 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );

  if (!allowed)
    return (
      <div className="container-luxe py-24 text-center">
        <h1 className="font-display text-3xl font-semibold">Admin access required</h1>
        <p className="mt-3 text-muted-foreground">
          Sign in with an authorised MS Silks admin account to manage the store.
        </p>
        <Button asChild variant="hero" className="mt-6">
          <Link to="/auth">Sign in</Link>
        </Button>
      </div>
    );

  return (
    <div className="container-luxe py-8">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">Admin Portal</h1>
      <p className="mt-1 text-sm text-muted-foreground">MS Silks Dharmavaram store management</p>

      <div className="mt-6 flex gap-2 overflow-x-auto border-b border-border pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-sm transition-colors",
              tab === t.id ? "bg-primary text-primary-foreground" : "hover:bg-accent",
            )}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "overview" && <Overview />}
        {tab === "products" && <ProductsPanel />}
        {tab === "orders" && <OrdersPanel />}
        {tab === "settings" && <SettingsPanel />}
        {tab === "admins" && <AdminsPanel />}
      </div>
    </div>
  );
}

/* ------------------------- Overview ------------------------- */

function Overview() {
  const { data: products = [] } = useQuery({ queryKey: ["admin-products"], queryFn: fetchAdminProducts });
  const { data: orders = [] } = useQuery({ queryKey: ["admin-orders"], queryFn: fetchAdminOrders });

  const revenue = orders
    .filter((o) => o.payment_status === "confirmed")
    .reduce((s, o) => s + Number(o.total), 0);
  const pending = orders.filter((o) => o.payment_status !== "confirmed").length;

  const stats = [
    { label: "Products", value: String(products.length), icon: Boxes },
    { label: "Orders", value: String(orders.length), icon: ShoppingCart },
    { label: "Confirmed Revenue", value: formatINR(revenue), icon: IndianRupee },
    { label: "Awaiting Verification", value: String(pending), icon: ShieldCheck },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <s.icon className="h-4 w-4 text-gold" />
          </div>
          <p className="mt-3 font-display text-2xl font-semibold">{s.value}</p>
        </div>
      ))}
    </div>
  );
}

/* ------------------------- Products ------------------------- */

type Draft = {
  id?: string;
  sku: string;
  name: string;
  description: string;
  categoryId: string | null;
  price: string;
  mrp: string;
  stock: string;
  available: boolean;
  featured: boolean;
  newArrival: boolean;
  images: ProductImageInput[];
};

const emptyDraft = (): Draft => ({
  sku: "",
  name: "",
  description: "",
  categoryId: null,
  price: "",
  mrp: "",
  stock: "1",
  available: true,
  featured: false,
  newArrival: true,
  images: [],
});

function ProductsPanel() {
  const qc = useQueryClient();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: fetchAdminProducts,
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => fetchCategories(false),
  });
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  const openNew = () => {
    setDraft(emptyDraft());
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setDraft({
      id: p.id,
      sku: p.sku ?? "",
      name: p.name,
      description: p.description,
      categoryId: p.categoryId,
      price: String(p.offerPrice),
      mrp: String(p.price),
      stock: String(p.stock),
      available: p.stock > 0,
      featured: p.featured,
      newArrival: p.newArrival,
      images: p.imageRows.map((r) => ({
        url: r.image_url,
        path: r.storage_path,
        isPrimary: r.is_primary,
      })),
    });
    setOpen(true);
  };

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const next: ProductImageInput[] = [];
      for (const file of Array.from(files)) {
        const err = validateImage(file);
        if (err) {
          toast.error(err);
          continue;
        }
        const up = await uploadProductImage(file);
        next.push({ url: up.url, path: up.path, isPrimary: false });
      }
      setDraft((d) => {
        const images = [...d.images, ...next];
        if (!images.some((i) => i.isPrimary) && images.length) images[0].isPrimary = true;
        return { ...d, images };
      });
      if (next.length) toast.success(`${next.length} image(s) uploaded`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const save = useMutation({
    mutationFn: async () => {
      if (!draft.name.trim()) throw new Error("Product name is required");
      if (!draft.sku.trim()) throw new Error("SKU is required");
      const price = Number(draft.price);
      if (!price || price <= 0) throw new Error("Enter a valid selling price");
      if (!draft.images.length) throw new Error("Add at least one product photo");
      return saveProduct({
        id: draft.id,
        sku: draft.sku.trim(),
        name: draft.name.trim(),
        description: draft.description.trim(),
        categoryId: draft.categoryId,
        price,
        mrp: Number(draft.mrp) || price,
        available: draft.available,
        featured: draft.featured,
        newArrival: draft.newArrival,
        stock: Number(draft.stock) || 1,
        images: draft.images,
      });
    },
    onSuccess: () => {
      toast.success(draft.id ? "Product updated" : "Product added");
      setOpen(false);
      invalidate();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save product"),
  });

  const del = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success("Product deleted");
      invalidate();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{products.length} products</p>
        <Button variant="hero" onClick={openNew}>
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          No products yet. Add your first saree.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3">Saree</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">In stock</th>
                <th className="p-3">Featured</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border/60 last:border-0">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        loading="lazy"
                        className="h-12 w-10 rounded object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.sku ?? "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">{formatINR(p.offerPrice)}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3">
                    <Switch
                      checked={p.stock > 0}
                      onCheckedChange={async (v) => {
                        await setProductAvailability(p.id, v);
                        invalidate();
                      }}
                    />
                  </td>
                  <td className="p-3">
                    <button
                      onClick={async () => {
                        await setProductFeatured(p.id, !p.featured);
                        invalidate();
                      }}
                      aria-label="Toggle featured"
                    >
                      <Star className={cn("h-5 w-5", p.featured ? "fill-gold text-gold" : "text-muted-foreground")} />
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)} aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete"
                        onClick={() => {
                          if (confirm(`Delete "${p.name}"? This cannot be undone.`)) del.mutate(p.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{draft.id ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Product name">
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </Field>
            <Field label="SKU / Code">
              <Input value={draft.sku} onChange={(e) => setDraft({ ...draft, sku: e.target.value })} />
            </Field>
            <Field label="Selling price (₹)">
              <Input
                inputMode="numeric"
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: e.target.value })}
              />
            </Field>
            <Field label="MRP (₹)">
              <Input
                inputMode="numeric"
                value={draft.mrp}
                onChange={(e) => setDraft({ ...draft, mrp: e.target.value })}
              />
            </Field>
            <Field label="Stock quantity">
              <Input
                inputMode="numeric"
                value={draft.stock}
                onChange={(e) => setDraft({ ...draft, stock: e.target.value })}
              />
            </Field>
            <Field label="Category">
              <Select
                value={draft.categoryId ?? "none"}
                onValueChange={(v) => setDraft({ ...draft, categoryId: v === "none" ? null : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Uncategorised</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Description">
                <Textarea
                  rows={4}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </Field>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 rounded-lg border border-border p-4">
            <Toggle label="Available" checked={draft.available} onChange={(v) => setDraft({ ...draft, available: v })} />
            <Toggle label="Featured" checked={draft.featured} onChange={(v) => setDraft({ ...draft, featured: v })} />
            <Toggle label="New arrival" checked={draft.newArrival} onChange={(v) => setDraft({ ...draft, newArrival: v })} />
          </div>

          <div>
            <Label className="mb-2 block text-sm">Photos</Label>
            <div className="flex flex-wrap gap-3">
              {draft.images.map((img, i) => (
                <div key={img.url} className="relative h-24 w-20 overflow-hidden rounded-lg border border-border">
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((d) => ({ ...d, images: d.images.filter((_, x) => x !== i) }))
                    }
                    className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-background/90"
                    aria-label="Remove photo"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        images: d.images.map((x, xi) => ({ ...x, isPrimary: xi === i })),
                      }))
                    }
                    className={cn(
                      "absolute bottom-0 w-full py-0.5 text-[10px]",
                      img.isPrimary ? "bg-gold text-gold-foreground" : "bg-background/80",
                    )}
                  >
                    {img.isPrimary ? "Main" : "Set main"}
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="grid h-24 w-20 place-items-center rounded-lg border border-dashed border-border text-muted-foreground hover:border-gold hover:text-primary"
              >
                {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                hidden
                onChange={(e) => onFiles(e.target.files)}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">JPG, PNG or WEBP · up to 8 MB each</p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="hero" onClick={() => save.mutate()} disabled={save.isPending || uploading}>
              {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------- Orders ------------------------- */

function OrdersPanel() {
  const qc = useQueryClient();
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: fetchAdminOrders,
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-orders"] });

  if (isLoading)
    return (
      <div className="grid place-items-center py-16 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );

  if (!orders.length)
    return (
      <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
        No orders yet.
      </div>
    );

  return (
    <div className="space-y-4">
      {orders.map((o) => {
        const payment = o.payments?.[0];
        return (
          <div key={o.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">#{o.order_number}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(o.created_at).toLocaleString("en-IN")} · {o.customer_name} · {o.customer_phone}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {o.address_line}, {o.city}, {o.state} {o.pincode}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-lg font-semibold text-primary">{formatINR(Number(o.total))}</p>
                <p className="text-xs capitalize text-muted-foreground">Payment: {o.payment_status}</p>
              </div>
            </div>

            <ul className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
              {o.order_items?.map((it) => (
                <li key={it.id} className="flex justify-between">
                  <span>
                    {it.product_name} × {it.quantity}
                  </span>
                  <span>{formatINR(Number(it.line_total))}</span>
                </li>
              ))}
            </ul>

            {payment && (
              <div className="mt-3 rounded-lg bg-secondary/50 p-3 text-sm">
                <p className="font-medium">UPI payment details</p>
                <p className="text-xs text-muted-foreground">
                  UTR: {payment.utr_number || "—"} · Payer: {payment.payer_name || "—"} ·{" "}
                  {payment.payer_phone || "—"}
                </p>
                {payment.payment_screenshot_url && (
                  <a
                    href={payment.payment_screenshot_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    View payment screenshot
                  </a>
                )}
                {payment.payment_status !== "confirmed" && (
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="hero"
                      onClick={async () => {
                        await setPaymentVerdict(o.id, payment.id, "confirmed");
                        toast.success("Payment confirmed");
                        refresh();
                      }}
                    >
                      Confirm payment
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        await setPaymentVerdict(o.id, payment.id, "rejected");
                        toast.success("Payment rejected");
                        refresh();
                      }}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 flex items-center gap-3">
              <Label className="text-xs text-muted-foreground">Order status</Label>
              <Select
                value={o.order_status}
                onValueChange={async (v) => {
                  await updateOrderStatus(o.id, v);
                  toast.success("Order updated");
                  refresh();
                }}
              >
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {ORDER_STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------- Settings ------------------------- */

function SettingsPanel() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["store-settings"], queryFn: fetchSettings });
  const [form, setForm] = useState({
    store_name: "",
    phone: "",
    whatsapp_number: "",
    instagram_url: "",
    address: "",
    announcement: "",
  });

  useEffect(() => {
    if (!data) return;
    setForm({
      store_name: data.store_name ?? "",
      phone: data.phone ?? "",
      whatsapp_number: data.whatsapp_number ?? "",
      instagram_url: data.instagram_url ?? "",
      address: data.address ?? "",
      announcement: data.announcement ?? "",
    });
  }, [data]);

  const save = useMutation({
    mutationFn: () => saveStoreSettings(form),
    onSuccess: () => {
      toast.success("Store settings saved");
      qc.invalidateQueries({ queryKey: ["store-settings"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save"),
  });

  return (
    <div className="max-w-2xl rounded-xl border border-border bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Store name">
          <Input value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} />
        </Field>
        <Field label="Phone">
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </Field>
        <Field label="WhatsApp number">
          <Input
            value={form.whatsapp_number}
            onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
          />
        </Field>
        <Field label="Instagram URL">
          <Input value={form.instagram_url} onChange={(e) => setForm({ ...form, instagram_url: e.target.value })} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Store address">
            <Textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Announcement bar text">
            <Input value={form.announcement} onChange={(e) => setForm({ ...form, announcement: e.target.value })} />
          </Field>
        </div>
      </div>
      <Button variant="hero" className="mt-6" onClick={() => save.mutate()} disabled={save.isPending}>
        {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save Settings
      </Button>
    </div>
  );
}

/* ------------------------- Admins ------------------------- */

function AdminsPanel() {
  const qc = useQueryClient();
  const { data: admins = [] } = useQuery({ queryKey: ["admins"], queryFn: fetchAdmins });
  const [email, setEmail] = useState("");

  const add = useMutation({
    mutationFn: () => addAdminByEmail(email),
    onSuccess: () => {
      toast.success("Admin added");
      setEmail("");
      qc.invalidateQueries({ queryKey: ["admins"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not add admin"),
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <Label className="mb-2 block text-sm">Add an admin by account email</Label>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="person@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button variant="hero" onClick={() => add.mutate()} disabled={!email || add.isPending}>
            {add.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Add
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          The person must already have an MS Silks account.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        {admins.map((a) => (
          <div key={a.id} className="flex items-center justify-between border-b border-border/60 p-4 last:border-0">
            <div>
              <p className="text-sm font-medium">{a.full_name || a.email}</p>
              <p className="text-xs text-muted-foreground">{a.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Remove admin"
              onClick={async () => {
                if (!confirm(`Remove admin access for ${a.email}?`)) return;
                await removeAdmin(a.id);
                toast.success("Admin removed");
                qc.invalidateQueries({ queryKey: ["admins"] });
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------- Small bits ------------------------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <Switch checked={checked} onCheckedChange={onChange} />
      {label}
    </label>
  );
}

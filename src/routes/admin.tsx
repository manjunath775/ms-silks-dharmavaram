import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import {
  BarChart3,
  Boxes,
  IndianRupee,
  LayoutDashboard,
  Package,
  Pencil,
  Plus,
  ShoppingCart,
  Tag,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { products as seed, formatINR, type Product } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — MS Silks Dharmavaram" }, { name: "robots", content: "noindex" }] }),
  component: Admin,
});

const salesData = [
  { m: "Jan", sales: 240000 },
  { m: "Feb", sales: 310000 },
  { m: "Mar", sales: 280000 },
  { m: "Apr", sales: 390000 },
  { m: "May", sales: 460000 },
  { m: "Jun", sales: 520000 },
  { m: "Jul", sales: 610000 },
];

const catData = [
  { c: "Bridal", v: 42 },
  { c: "Festival", v: 33 },
  { c: "Designer", v: 25 },
];

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "customers", label: "Customers", icon: Users },
  { id: "coupons", label: "Coupons", icon: Tag },
  { id: "inventory", label: "Inventory", icon: Boxes },
  { id: "reports", label: "Reports", icon: BarChart3 },
] as const;

function Admin() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<(typeof navItems)[number]["id"]>("dashboard");

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;

  return (
    <div className="container-luxe py-8">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">Admin Dashboard</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-xl border border-border bg-card p-2 lg:sticky lg:top-40">
          <nav className="flex gap-1 overflow-x-auto lg:flex-col">
            {navItems.map((n) => (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  tab === n.id ? "bg-primary text-primary-foreground" : "hover:bg-accent",
                )}
              >
                <n.icon className="h-4 w-4" /> {n.label}
              </button>
            ))}
          </nav>
        </aside>

        <div>
          {tab === "dashboard" && <DashboardTab />}
          {tab === "products" && <ProductsTab />}
          {tab === "orders" && <OrdersTab />}
          {tab === "customers" && <CustomersTab />}
          {tab === "coupons" && <CouponsTab />}
          {tab === "inventory" && <InventoryTab />}
          {tab === "reports" && <ReportsTab />}
        </div>
      </div>
    </div>
  );
}

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="container-luxe grid min-h-[70vh] place-items-center py-12">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={(e) => {
          e.preventDefault();
          onLogin();
          toast.success("Welcome, Admin");
        }}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-soft"
      >
        <div className="text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-semibold">Admin Login</h1>
          <p className="mt-1 text-sm text-muted-foreground">Secure access for store administrators</p>
        </div>
        <div className="mt-6 space-y-4">
          <div>
            <Label className="mb-1.5 block text-sm">Email</Label>
            <Input type="email" required defaultValue="admin@mssilks.in" />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Password</Label>
            <Input type="password" required defaultValue="admin123" />
          </div>
          <Button type="submit" variant="hero" size="lg" className="w-full">
            Sign In
          </Button>
        </div>
      </motion.form>
    </div>
  );
}

function Stat({ icon: Icon, label, value, trend }: { icon: typeof Users; label: string; value: string; trend: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <span className="flex items-center gap-1 text-xs font-medium text-green-600">
          <TrendingUp className="h-3.5 w-3.5" /> {trend}
        </span>
      </div>
      <p className="mt-3 font-display text-2xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function DashboardTab() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={IndianRupee} label="Total Revenue" value="₹28.1L" trend="+18%" />
        <Stat icon={ShoppingCart} label="Orders" value="1,284" trend="+12%" />
        <Stat icon={Users} label="Customers" value="3,042" trend="+9%" />
        <Stat icon={Package} label="Products" value={String(seed.length)} trend="+4%" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <h3 className="font-display text-lg font-semibold">Sales Overview</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={salesData} margin={{ top: 16, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="m" stroke="var(--color-muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickFormatter={(v) => `${v / 100000}L`} />
              <Tooltip formatter={(v: number) => formatINR(v)} />
              <Area type="monotone" dataKey="sales" stroke="var(--color-primary)" fill="url(#g)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-display text-lg font-semibold">By Category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={catData} margin={{ top: 16, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="c" stroke="var(--color-muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
              <Tooltip />
              <Bar dataKey="v" fill="var(--color-gold)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function ProductsTab() {
  const [list, setList] = useState<Product[]>(seed);
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);

  const remove = (id: string) => {
    setList((l) => l.filter((p) => p.id !== id));
    toast.success("Product deleted");
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">Products ({list.length})</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" onClick={() => setEditing(null)}>
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
          <ProductDialog
            product={editing}
            onSave={(p) => {
              if (editing) {
                setList((l) => l.map((x) => (x.id === p.id ? p : x)));
                toast.success("Product updated");
              } else {
                setList((l) => [{ ...p, id: `saree-${Date.now()}` }, ...l]);
                toast.success("Product added");
              }
              setOpen(false);
            }}
          />
        </Dialog>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="pb-2 font-medium">Product</th>
              <th className="pb-2 font-medium">Category</th>
              <th className="pb-2 font-medium">Price</th>
              <th className="pb-2 font-medium">Stock</th>
              <th className="pb-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-b border-border/60">
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.images[0]} alt={p.name} className="h-12 w-10 rounded object-cover" />
                    <span className="line-clamp-1 max-w-40 font-medium">{p.name}</span>
                  </div>
                </td>
                <td>{p.category}</td>
                <td>{formatINR(p.offerPrice)}</td>
                <td>
                  <span className={cn(p.stock === 0 ? "text-destructive" : "text-foreground")}>{p.stock}</span>
                </td>
                <td>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditing(p);
                        setOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(p.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductDialog({ product, onSave }: { product: Product | null; onSave: (p: Product) => void }) {
  const [name, setName] = useState(product?.name ?? "");
  const [category, setCategory] = useState(product?.category ?? "Designer Sarees");
  const [price, setPrice] = useState(product?.price ?? 0);
  const [offer, setOffer] = useState(product?.offerPrice ?? 0);
  const [stock, setStock] = useState(product?.stock ?? 0);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{product ? "Edit Product" : "Add Product"}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label className="mb-1.5 block text-sm">Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label className="mb-1.5 block text-sm">Category</Label>
          <Input value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="mb-1.5 block text-sm">Price</Label>
            <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Offer</Label>
            <Input type="number" value={offer} onChange={(e) => setOffer(Number(e.target.value))} />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Stock</Label>
            <Input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} />
          </div>
        </div>
        <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
          Drag & drop images here (multiple uploads supported)
        </div>
      </div>
      <DialogFooter>
        <Button
          variant="hero"
          onClick={() =>
            onSave({
              ...(product ?? (seed[0] as Product)),
              id: product?.id ?? "",
              name,
              category,
              price,
              offerPrice: offer,
              stock,
            })
          }
        >
          Save Product
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function OrdersTab() {
  const orders = [
    { id: "MS10234", customer: "Aarohi Sharma", total: 18999, status: "Delivered" },
    { id: "MS10233", customer: "Ravi Kumar", total: 14499, status: "Shipped" },
    { id: "MS10232", customer: "Divya Rao", total: 21999, status: "Processing" },
    { id: "MS10231", customer: "Nithya S.", total: 9999, status: "Pending" },
  ];
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 font-display text-lg font-semibold">Recent Orders</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="pb-2 font-medium">Order</th>
              <th className="pb-2 font-medium">Customer</th>
              <th className="pb-2 font-medium">Total</th>
              <th className="pb-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-border/60">
                <td className="py-3 font-medium">#{o.id}</td>
                <td>{o.customer}</td>
                <td>{formatINR(o.total)}</td>
                <td>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs">{o.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CustomersTab() {
  const customers = [
    { name: "Aarohi Sharma", email: "aarohi@example.com", orders: 6, spent: 84000 },
    { name: "Ravi Kumar", email: "ravi@example.com", orders: 3, spent: 42000 },
    { name: "Divya Rao", email: "divya@example.com", orders: 8, spent: 121000 },
  ];
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 font-display text-lg font-semibold">Customers</h3>
      <div className="space-y-3">
        {customers.map((c) => (
          <div key={c.email} className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 font-semibold text-primary">
                {c.name[0]}
              </div>
              <div>
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.email}</p>
              </div>
            </div>
            <div className="text-right text-sm">
              <p className="font-medium">{formatINR(c.spent)}</p>
              <p className="text-xs text-muted-foreground">{c.orders} orders</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CouponsTab() {
  const [coupons, setCoupons] = useState([
    { code: "SILK10", pct: 10, active: true },
    { code: "FESTIVE20", pct: 20, active: true },
    { code: "WELCOME15", pct: 15, active: false },
  ]);
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">Coupons</h3>
        <Button variant="hero" onClick={() => toast.success("New coupon created")}>
          <Plus className="h-4 w-4" /> New Coupon
        </Button>
      </div>
      <div className="space-y-3">
        {coupons.map((c, i) => (
          <div key={c.code} className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="flex items-center gap-3">
              <Tag className="h-4 w-4 text-gold" />
              <div>
                <p className="font-mono text-sm font-semibold">{c.code}</p>
                <p className="text-xs text-muted-foreground">{c.pct}% off</p>
              </div>
            </div>
            <Button
              variant={c.active ? "gold" : "outline"}
              size="sm"
              onClick={() =>
                setCoupons((cs) => cs.map((x, j) => (i === j ? { ...x, active: !x.active } : x)))
              }
            >
              {c.active ? "Active" : "Inactive"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function InventoryTab() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 font-display text-lg font-semibold">Inventory Alerts</h3>
      <div className="space-y-3">
        {seed
          .filter((p) => p.stock <= 3)
          .map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="flex items-center gap-3">
                <img src={p.images[0]} alt={p.name} className="h-11 w-9 rounded object-cover" />
                <p className="line-clamp-1 max-w-52 text-sm font-medium">{p.name}</p>
              </div>
              <span className={cn("text-sm font-medium", p.stock === 0 ? "text-destructive" : "text-gold-foreground")}>
                {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

function ReportsTab() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 font-display text-lg font-semibold">Sales Report</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={salesData} margin={{ top: 16, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="m" stroke="var(--color-muted-foreground)" fontSize={12} />
          <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickFormatter={(v) => `${v / 100000}L`} />
          <Tooltip formatter={(v: number) => formatINR(v)} />
          <Bar dataKey="sales" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

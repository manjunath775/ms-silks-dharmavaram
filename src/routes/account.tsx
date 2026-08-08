import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Bell,
  Heart,
  LogOut,
  MapPin,
  Package,
  Settings,
  Truck,
  User,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { getProduct, formatINR } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "My Account — MS Silks Dharmavaram" }] }),
  component: Account,
});

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "orders", label: "My Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

const mockOrders = [
  { id: "MS10234", date: "10 Jul 2026", status: "Delivered", total: 18999, item: "Maroon Kanjivaram Bridal Silk" },
  { id: "MS10221", date: "28 Jun 2026", status: "Shipped", total: 14499, item: "Emerald Banarasi Pure Silk" },
  { id: "MS10198", date: "12 Jun 2026", status: "Processing", total: 11999, item: "Blush Pink Floral Zari Silk" },
];

function Account() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("profile");
  const { wishlist } = useStore();
  const wishedProducts = wishlist.map(getProduct).filter(Boolean);

  return (
    <div className="container-luxe py-8">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">My Account</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit rounded-xl border border-border bg-card p-3 lg:sticky lg:top-40">
          <div className="mb-3 flex items-center gap-3 border-b border-border p-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 font-display text-lg font-semibold text-primary">
              A
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Aarohi Sharma</p>
              <p className="truncate text-xs text-muted-foreground">aarohi@example.com</p>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto lg:flex-col">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  tab === t.id ? "bg-primary text-primary-foreground" : "hover:bg-accent",
                )}
              >
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
            <Button asChild variant="ghost" className="mt-1 justify-start text-destructive hover:text-destructive">
              <Link to="/auth">
                <LogOut className="h-4 w-4" /> Sign Out
              </Link>
            </Button>
          </nav>
        </aside>

        <div>
          {tab === "profile" && (
            <Card title="Profile Details">
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldRow label="Full Name" value="Aarohi Sharma" />
                <FieldRow label="Email" value="aarohi@example.com" />
                <FieldRow label="Phone" value="+91 90599 88913" />
                <FieldRow label="Gender" value="Female" />
              </div>
              <Button variant="hero" className="mt-6">
                Save Changes
              </Button>
            </Card>
          )}

          {tab === "orders" && (
            <Card title="My Orders">
              <div className="space-y-4">
                {mockOrders.map((o) => (
                  <div key={o.id} className="rounded-lg border border-border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">Order #{o.id}</p>
                        <p className="text-xs text-muted-foreground">Placed on {o.date}</p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-medium",
                          o.status === "Delivered" && "bg-green-100 text-green-700",
                          o.status === "Shipped" && "bg-gold/20 text-gold-foreground",
                          o.status === "Processing" && "bg-secondary text-secondary-foreground",
                        )}
                      >
                        {o.status}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">{o.item}</p>
                      <p className="font-semibold text-primary">{formatINR(o.total)}</p>
                    </div>
                    <div className="mt-3 flex items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
                      <Truck className="h-4 w-4 text-primary" />
                      {o.status === "Delivered"
                        ? "Delivered to your address"
                        : o.status === "Shipped"
                          ? "Out for delivery — arriving soon"
                          : "Being prepared for dispatch"}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {tab === "wishlist" && (
            <Card title="My Wishlist">
              {wishedProducts.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  Your wishlist is empty.{" "}
                  <Link to="/shop" className="text-primary hover:underline">
                    Explore sarees
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                  {wishedProducts.map((p) => (
                    <ProductCard key={p!.id} product={p!} />
                  ))}
                </div>
              )}
            </Card>
          )}

          {tab === "addresses" && (
            <Card title="Saved Addresses">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-gold/50 bg-gold/5 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Home</p>
                    <span className="rounded bg-primary px-2 py-0.5 text-[10px] text-primary-foreground">Default</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    12-3-45, Silk Nagar, Dharmavaram, Andhra Pradesh 515671
                  </p>
                </div>
                <button className="grid place-items-center rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground hover:border-gold hover:text-primary">
                  + Add new address
                </button>
              </div>
            </Card>
          )}

          {tab === "notifications" && (
            <Card title="Notifications">
              <div className="space-y-3">
                {[
                  "Your order #MS10234 has been delivered.",
                  "Festival Sale is live — up to 30% off silk sarees!",
                  "Your order #MS10221 is out for delivery.",
                ].map((n, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border border-border p-3 text-sm">
                    <Bell className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    {n}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {tab === "settings" && (
            <Card title="Settings">
              <div className="space-y-4">
                <FieldRow label="Language" value="English / తెలుగు" />
                <div>
                  <Label className="mb-1.5 block text-sm">Change Password</Label>
                  <Input type="password" placeholder="New password" />
                </div>
                <Button variant="hero">Update</Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-5 font-display text-xl font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm text-muted-foreground">{label}</Label>
      <Input defaultValue={value} />
    </div>
  );
}

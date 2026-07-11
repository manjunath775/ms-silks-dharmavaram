import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2, Tag } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatINR } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Cart — MS Silks Dharmavaram" }] }),
  component: Cart,
});

function Cart() {
  const { cart, updateQty, removeFromCart, cartTotal } = useStore();
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState<{ code: string; pct: number } | null>(null);

  const applyCoupon = () => {
    const codes: Record<string, number> = { SILK10: 10, FESTIVE20: 20, WELCOME15: 15 };
    const pct = codes[coupon.toUpperCase()];
    if (pct) {
      setApplied({ code: coupon.toUpperCase(), pct });
      toast.success(`Coupon applied — ${pct}% off`);
    } else {
      toast.error("Invalid coupon code");
    }
  };

  const discount = applied ? Math.round((cartTotal * applied.pct) / 100) : 0;
  const subtotal = cartTotal - discount;
  const shipping = subtotal > 2999 || subtotal === 0 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

  if (cart.length === 0) {
    return (
      <div className="container-luxe py-24 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-secondary">
          <ShoppingBag className="h-9 w-9 text-muted-foreground" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Discover our exquisite silk saree collection.</p>
        <Button asChild variant="hero" size="lg" className="mt-6">
          <Link to="/shop">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-luxe py-8">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">Shopping Cart</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {cart.map((item) => (
            <div
              key={item.product.id}
              className="flex gap-4 rounded-xl border border-border bg-card p-4"
            >
              <Link
                to="/product/$id"
                params={{ id: item.product.id }}
                className="h-28 w-24 shrink-0 overflow-hidden rounded-lg bg-muted"
              >
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="h-full w-full object-cover"
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      to="/product/$id"
                      params={{ id: item.product.id }}
                      className="line-clamp-1 font-display text-lg font-semibold hover:text-primary"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{item.product.fabric}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-md border border-border">
                    <button
                      className="grid h-8 w-8 place-items-center hover:bg-accent"
                      onClick={() => updateQty(item.product.id, item.qty - 1)}
                      aria-label="Decrease"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                    <button
                      className="grid h-8 w-8 place-items-center hover:bg-accent"
                      onClick={() => updateQty(item.product.id, item.qty + 1)}
                      aria-label="Increase"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="font-semibold text-primary">
                    {formatINR(item.product.offerPrice * item.qty)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="h-fit rounded-xl border border-border bg-card p-6 lg:sticky lg:top-40">
          <h2 className="font-display text-xl font-semibold">Order Summary</h2>

          <div className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Coupon code"
                className="pl-9"
              />
            </div>
            <Button variant="gold" onClick={applyCoupon}>
              Apply
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Try SILK10, FESTIVE20 or WELCOME15</p>

          <div className="mt-5 space-y-2.5 text-sm">
            <Row label="Subtotal" value={formatINR(cartTotal)} />
            {applied && (
              <Row label={`Discount (${applied.code})`} value={`− ${formatINR(discount)}`} accent />
            )}
            <Row label="Shipping" value={shipping === 0 ? "Free" : formatINR(shipping)} />
            <Row label="Tax (5% GST)" value={formatINR(tax)} />
            <div className="border-t border-border pt-3">
              <Row label="Total" value={formatINR(total)} bold />
            </div>
          </div>

          <Button asChild variant="hero" size="lg" className="mt-5 w-full">
            <Link to="/checkout">Proceed to Checkout</Link>
          </Button>
          <Button asChild variant="link" className="mt-2 w-full">
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  accent,
}: {
  label: string;
  value: string;
  bold?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className={bold ? "font-semibold" : "text-muted-foreground"}>{label}</span>
      <span className={bold ? "font-display text-lg font-semibold text-primary" : accent ? "text-gold" : "font-medium"}>
        {value}
      </span>
    </div>
  );
}

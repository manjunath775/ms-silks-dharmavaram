import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { CreditCard, Landmark, Loader2, Smartphone, Truck, Wallet } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatINR } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — MS Silks Dharmavaram" }] }),
  component: Checkout,
});

const deliveryOptions = [
  { id: "standard", label: "Standard Delivery", desc: "3–6 business days", price: 0 },
  { id: "express", label: "Express Delivery", desc: "1–2 business days", price: 199 },
];

const paymentOptions = [
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "card", label: "Credit / Debit Card", icon: CreditCard },
  { id: "netbanking", label: "Net Banking", icon: Landmark },
  { id: "wallet", label: "Wallets", icon: Wallet },
  { id: "cod", label: "Cash on Delivery", icon: Truck },
];

function Checkout() {
  const { cart, cartTotal, clearCart } = useStore();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState("standard");
  const [payment, setPayment] = useState("upi");
  const [processing, setProcessing] = useState(false);

  const deliveryFee = deliveryOptions.find((d) => d.id === delivery)?.price ?? 0;
  const shipping = cartTotal > 2999 ? 0 : 99;
  const tax = Math.round(cartTotal * 0.05);
  const total = cartTotal + tax + shipping + deliveryFee;

  const placeOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    setProcessing(true);
    toast.loading("Processing your payment…", { id: "pay" });

    // Simulated Razorpay flow — replace with real gateway response.
    // COD → success immediately; other methods → mostly success, occasional pending/failed.
    window.setTimeout(() => {
      toast.dismiss("pay");
      const orderId = `MS${Math.floor(Math.random() * 900000 + 100000)}`;
      const paymentId = `pay_${Math.random().toString(36).slice(2, 12)}`;

      let status: "success" | "pending" | "failed" = "success";
      let reason: string | undefined;
      if (payment !== "cod") {
        const roll = Math.random();
        if (roll < 0.15) {
          status = "failed";
          reason = "Payment declined by bank";
        } else if (roll < 0.3) {
          status = "pending";
        }
      }

      if (status === "success") clearCart();
      setProcessing(false);
      navigate({
        to: "/order-status",
        search: {
          status,
          orderId,
          paymentId: status === "failed" ? undefined : paymentId,
          amount: total,
          reason,
        },
      });
    }, 1200);
  };



  return (
    <div className="container-luxe py-8">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">Checkout</h1>
      <form onSubmit={placeOrder} className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          {/* Address */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-xl font-semibold">Shipping Address</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Full Name" required />
              <Field label="Phone Number" type="tel" required />
              <Field label="Email" type="email" required className="sm:col-span-2" />
              <Field label="Address Line" required className="sm:col-span-2" />
              <Field label="City" required />
              <Field label="State" required />
              <Field label="Pincode" required />
              <Field label="Landmark (optional)" />
            </div>
          </section>

          {/* Delivery */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-xl font-semibold">Delivery Options</h2>
            <RadioGroup value={delivery} onValueChange={setDelivery} className="mt-4 space-y-3">
              {deliveryOptions.map((d) => (
                <label
                  key={d.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors",
                    delivery === d.id ? "border-gold bg-gold/5" : "border-border",
                  )}
                >
                  <RadioGroupItem value={d.id} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{d.label}</p>
                    <p className="text-xs text-muted-foreground">{d.desc}</p>
                  </div>
                  <span className="text-sm font-medium">{d.price === 0 ? "Free" : formatINR(d.price)}</span>
                </label>
              ))}
            </RadioGroup>
          </section>

          {/* Payment */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-xl font-semibold">Payment Method</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Secured by Razorpay — UPI, Cards, Net Banking, Wallets & COD.
            </p>
            <RadioGroup value={payment} onValueChange={setPayment} className="mt-4 grid gap-3 sm:grid-cols-2">
              {paymentOptions.map((p) => (
                <label
                  key={p.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors",
                    payment === p.id ? "border-gold bg-gold/5" : "border-border",
                  )}
                >
                  <RadioGroupItem value={p.id} />
                  <p.icon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{p.label}</span>
                </label>
              ))}
            </RadioGroup>
          </section>
        </div>

        {/* Summary */}
        <div className="h-fit rounded-xl border border-border bg-card p-6 lg:sticky lg:top-40">
          <h2 className="font-display text-xl font-semibold">Your Order</h2>
          <div className="mt-4 max-h-56 space-y-3 overflow-y-auto">
            {cart.map((i) => (
              <div key={i.product.id} className="flex items-center gap-3">
                <img
                  src={i.product.images[0]}
                  alt={i.product.name}
                  className="h-14 w-12 shrink-0 rounded object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium">{i.product.name}</p>
                  <p className="text-xs text-muted-foreground">Qty {i.qty}</p>
                </div>
                <span className="text-sm font-medium">{formatINR(i.product.offerPrice * i.qty)}</span>
              </div>
            ))}
            {cart.length === 0 && <p className="text-sm text-muted-foreground">No items in cart.</p>}
          </div>

          <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatINR(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : formatINR(shipping)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax (5% GST)</span>
              <span>{formatINR(tax)}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Express delivery</span>
                <span>{formatINR(deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2 font-semibold">
              <span>Total</span>
              <span className="font-display text-lg text-primary">{formatINR(total)}</span>
            </div>
          </div>

          <Button type="submit" variant="hero" size="lg" className="mt-5 w-full" disabled={processing}>
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing…
              </>
            ) : (
              "Place Order"
            )}
          </Button>

        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  type = "text",
  required,
  className,
}: {
  label: string;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-sm">{label}</Label>
      <Input type={type} required={required} />
    </div>
  );
}

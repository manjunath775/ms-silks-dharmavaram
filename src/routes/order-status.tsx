import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { CheckCircle2, Clock, XCircle, Package, RefreshCw, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/products";
import { z } from "zod";

type Status = "success" | "pending" | "failed";

const searchSchema = z.object({
  status: z.enum(["success", "pending", "failed"]).catch("success"),
  orderId: z.string().optional(),
  paymentId: z.string().optional(),
  amount: z.coerce.number().optional(),
  reason: z.string().optional(),
});

export const Route = createFileRoute("/order-status")({
  validateSearch: (search) => searchSchema.parse(search),
  head: ({ match }) => {
    const s = (match.search as { status?: Status }).status ?? "success";
    const title =
      s === "success"
        ? "Order Confirmed"
        : s === "pending"
          ? "Payment Pending"
          : "Payment Failed";
    return {
      meta: [
        { title: `${title} — MS Silks Dharmavaram` },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  component: OrderStatus,
});

const config: Record<
  Status,
  {
    icon: typeof CheckCircle2;
    iconBg: string;
    iconColor: string;
    title: string;
    subtitle: string;
    accent: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    title: "Order Confirmed!",
    subtitle: "Thank you for shopping with MS Silks. Your payment was successful.",
    accent: "border-emerald-200 bg-emerald-50",
  },
  pending: {
    icon: Clock,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    title: "Payment Pending",
    subtitle:
      "Your payment is being processed by your bank. This can take a few minutes — we'll confirm your order as soon as it clears.",
    accent: "border-amber-200 bg-amber-50",
  },
  failed: {
    icon: XCircle,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    title: "Payment Failed",
    subtitle:
      "Your payment couldn't be completed. No amount has been charged. Please try again or choose a different payment method.",
    accent: "border-rose-200 bg-rose-50",
  },
};

function OrderStatus() {
  const { status, orderId, paymentId, amount, reason } = Route.useSearch();
  const navigate = useNavigate();
  const c = config[status];
  const Icon = c.icon;

  const displayOrderId =
    orderId ?? `MS${Math.floor(Math.random() * 900000 + 100000)}`;

  return (
    <div className="container-luxe py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-8 text-center shadow-soft sm:p-12"
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.1 }}
          className={`mx-auto grid h-24 w-24 place-items-center rounded-full ${c.iconBg}`}
        >
          <Icon className={`h-12 w-12 ${c.iconColor}`} />
        </motion.div>

        <h1 className="mt-6 font-display text-3xl font-semibold sm:text-4xl">
          {c.title}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          {c.subtitle}
        </p>

        {reason && status === "failed" && (
          <p className="mt-2 text-xs text-rose-600">Reason: {reason}</p>
        )}

        <div className={`mt-8 rounded-xl border p-5 text-left ${c.accent}`}>
          <dl className="grid gap-2 text-sm">
            <Row label="Order ID" value={`#${displayOrderId}`} />
            {paymentId && <Row label="Payment ID" value={paymentId} />}
            {typeof amount === "number" && (
              <Row label="Amount" value={formatINR(amount)} />
            )}
            <Row
              label="Status"
              value={
                <span
                  className={
                    status === "success"
                      ? "font-medium text-emerald-700"
                      : status === "pending"
                        ? "font-medium text-amber-700"
                        : "font-medium text-rose-700"
                  }
                >
                  {status === "success"
                    ? "Confirmed"
                    : status === "pending"
                      ? "Awaiting confirmation"
                      : "Not charged"}
                </span>
              }
            />
          </dl>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {status === "success" && (
            <>
              <Button variant="hero" size="lg" onClick={() => navigate({ to: "/account" })}>
                <Package className="mr-2 h-4 w-4" />
                Track Order
              </Button>
              <Button variant="luxeOutline" size="lg" onClick={() => navigate({ to: "/shop" })}>
                Continue Shopping
              </Button>
            </>
          )}
          {status === "pending" && (
            <>
              <Button
                variant="hero"
                size="lg"
                onClick={() =>
                  navigate({
                    to: "/order-status",
                    search: { status: "pending", orderId, paymentId, amount },
                  })
                }
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Check Again
              </Button>
              <Button variant="luxeOutline" size="lg" onClick={() => navigate({ to: "/account" })}>
                View Orders
              </Button>
            </>
          )}
          {status === "failed" && (
            <>
              <Button variant="hero" size="lg" onClick={() => navigate({ to: "/checkout" })}>
                Retry Payment
              </Button>
              <Button variant="luxeOutline" size="lg" onClick={() => navigate({ to: "/cart" })}>
                Back to Cart
              </Button>
            </>
          )}
        </div>

        <p className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <HelpCircle className="h-3.5 w-3.5" />
          Need help?{" "}
          <Link to="/contact" className="text-primary hover:underline">
            Contact support
          </Link>
        </p>
      </motion.div>

      {status !== "failed" && (
        <p className="mt-6 text-center text-xs text-muted-foreground">
          A confirmation has been sent to your email.
        </p>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

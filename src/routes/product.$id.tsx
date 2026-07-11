import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import {
  Check,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";
import { getProduct, products, formatINR } from "@/lib/products";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$id")({
  head: ({ params }) => {
    const p = getProduct(params.id);
    return {
      meta: [
        { title: p ? `${p.name} — MS Silks Dharmavaram` : "Saree — MS Silks" },
        { name: "description", content: p?.description ?? "Premium handloom silk saree." },
        { property: "og:title", content: p?.name ?? "MS Silks" },
        { property: "og:description", content: p?.description ?? "" },
        ...(p ? [{ property: "og:image", content: p.images[0] }] : []),
      ],
    };
  },
  component: ProductDetail,
  notFoundComponent: () => (
    <div className="container-luxe py-24 text-center">
      <p>Product not found.</p>
    </div>
  ),
});

function ProductDetail() {
  const { id } = Route.useParams();
  const product = getProduct(id);
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState({ x: 50, y: 50, on: false });

  if (!product) {
    return <div className="container-luxe py-24 text-center">Product not found.</div>;
  }

  const wished = isWishlisted(product.id);
  const discount = Math.round(((product.price - product.offerPrice) / product.price) * 100);
  const related = products.filter((p) => p.id !== product.id && p.color === product.color).slice(0, 4);
  const relatedFinal = related.length ? related : products.filter((p) => p.id !== product.id).slice(0, 4);

  const specs = [
    ["Fabric", product.fabric],
    ["Colour", product.color],
    ["Category", product.category],
    ["Occasion", product.occasion],
    ["Saree Length", product.sareeLength],
    ["Blouse", product.blouse],
    ["Wash Care", "Dry clean only"],
    ["Weave", "Handloom, pure zari"],
  ];

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
      } catch {
        /* cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <div className="container-luxe py-8">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>{" "}
        /{" "}
        <Link to="/shop" className="hover:text-primary">
          Shop
        </Link>{" "}
        / <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div className="flex flex-col-reverse gap-4 sm:flex-row">
          <div className="flex gap-3 sm:flex-col">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={cn(
                  "h-20 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                  activeImg === i ? "border-gold" : "border-transparent",
                )}
              >
                <img src={img} alt={`${product.name} view ${i + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div
            className="relative flex-1 overflow-hidden rounded-xl bg-muted"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setZoom({
                x: ((e.clientX - r.left) / r.width) * 100,
                y: ((e.clientY - r.top) / r.height) * 100,
                on: true,
              });
            }}
            onMouseLeave={() => setZoom((z) => ({ ...z, on: false }))}
          >
            <img
              src={product.images[activeImg]}
              alt={product.name}
              className="aspect-[3/4] w-full object-cover transition-transform duration-200"
              style={{
                transform: zoom.on ? "scale(1.8)" : "scale(1)",
                transformOrigin: `${zoom.x}% ${zoom.y}%`,
              }}
            />
            {discount > 0 && (
              <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                {discount}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{product.fabric}</p>
          <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5">
              <Star className="h-3.5 w-3.5 fill-gold text-gold" />
              {product.rating.toFixed(1)}
            </span>
            <span className="text-muted-foreground">{product.reviews} reviews</span>
          </div>

          <div className="mt-5 flex items-end gap-3">
            <span className="font-display text-3xl font-semibold text-primary">
              {formatINR(product.offerPrice)}
            </span>
            <span className="text-lg text-muted-foreground line-through">{formatINR(product.price)}</span>
            {discount > 0 && <span className="pb-1 text-sm font-medium text-gold">Save {discount}%</span>}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes</p>

          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

          <div className="mt-5">
            {product.stock > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700">
                <Check className="h-4 w-4" /> In stock — {product.stock} left
              </span>
            ) : (
              <span className="text-sm font-medium text-destructive">Currently sold out</span>
            )}
          </div>

          {/* Quantity + actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-md border border-border">
              <button
                className="grid h-11 w-11 place-items-center hover:bg-accent"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-medium">{qty}</span>
              <button
                className="grid h-11 w-11 place-items-center hover:bg-accent"
                onClick={() => setQty((q) => q + 1)}
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-md border border-border"
              onClick={() => {
                toggleWishlist(product.id);
                toast(wished ? "Removed from wishlist" : "Added to wishlist");
              }}
              aria-label="Wishlist"
            >
              <Heart className={cn("h-5 w-5", wished && "fill-primary text-primary")} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-md border border-border"
              onClick={share}
              aria-label="Share"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button
              variant="luxeOutline"
              size="lg"
              disabled={product.stock === 0}
              onClick={() => {
                addToCart(product, qty);
                toast.success("Added to cart");
              }}
            >
              <ShoppingBag className="h-4 w-4" /> Add to Cart
            </Button>
            <Button
              variant="hero"
              size="lg"
              disabled={product.stock === 0}
              onClick={() => {
                addToCart(product, qty);
                navigate({ to: "/checkout" });
              }}
            >
              Buy Now
            </Button>
          </div>

          {/* Assurance */}
          <div className="mt-6 grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-3">
            {[
              { icon: Truck, t: "Free Delivery", d: "3–6 business days" },
              { icon: RotateCcw, t: "7-Day Returns", d: "Easy & hassle-free" },
              { icon: ShieldCheck, t: "Silk Mark", d: "100% authentic" },
            ].map((a) => (
              <div key={a.t} className="flex items-center gap-2.5">
                <a.icon className="h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{a.t}</p>
                  <p className="text-xs text-muted-foreground">{a.d}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="mt-14">
        <Tabs defaultValue="specs">
          <TabsList>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
            <TabsTrigger value="delivery">Delivery & Returns</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.reviews})</TabsTrigger>
          </TabsList>

          <TabsContent value="specs" className="mt-6">
            <div className="grid gap-x-10 gap-y-3 sm:grid-cols-2">
              {specs.map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-border py-2 text-sm">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="text-right font-medium">{v}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="delivery" className="mt-6 max-w-2xl space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Estimated delivery:</strong> 3–6 business days across
              India. Orders above ₹2,999 ship free; a flat ₹99 applies below that.
            </p>
            <p>
              <strong className="text-foreground">Returns:</strong> Enjoy a 7-day return window from
              delivery. The saree must be unused with tags intact. Refunds are processed within 5–7 days.
            </p>
            <p>
              <strong className="text-foreground">Order tracking:</strong> Track your order anytime from
              your account dashboard.
            </p>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6 max-w-2xl space-y-5">
            {[
              { n: "Deepa K.", t: "Absolutely gorgeous! The silk quality is top notch." },
              { n: "Ramya S.", t: "Perfect for my sister's wedding. Got so many compliments." },
              { n: "Meera P.", t: "Colour is exactly as shown. Very happy with the purchase." },
            ].map((r) => (
              <div key={r.n} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-1 text-gold">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-gold" />
                  ))}
                </div>
                <p className="mt-2 text-sm">{r.t}</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">{r.n} · Verified buyer</p>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Related */}
      <section className="mt-16">
        <h2 className="font-display text-2xl font-semibold">You May Also Like</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-4">
          {relatedFinal.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}

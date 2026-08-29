import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  Check,
  Heart,
  MessageCircle,
  Minus,
  Plus,
  RotateCcw,
  Share2,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import { fetchApprovedReviews, fetchProductBySlug, fetchProducts, formatINR } from "@/lib/db";
import { useStore } from "@/lib/store";
import { useStoreSettings } from "@/lib/settings";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$id")({
  head: () => ({
    meta: [
      { title: "Silk Saree Details — MS Silks Dharmavaram" },
      {
        name: "description",
        content:
          "View full details, photos, fabric, colour and price of this handloom silk saree from MS Silks Dharmavaram, and order instantly on WhatsApp.",
      },
      { property: "og:title", content: "Silk Saree Details — MS Silks Dharmavaram" },
      {
        property: "og:description",
        content: "Handloom silk saree from MS Silks Dharmavaram — order instantly on WhatsApp.",
      },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductDetail,
  notFoundComponent: () => (
    <div className="container-luxe py-24 text-center">
      <p>Product not found.</p>
    </div>
  ),
});

function ProductDetail() {
  const { id } = Route.useParams();
  const settings = useStoreSettings();
  const { toggleWishlist, isWishlisted } = useStore();
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState({ x: 50, y: 50, on: false });

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProductBySlug(id),
  });
  const { data: all = [] } = useQuery({
    queryKey: ["products", "active"],
    queryFn: () => fetchProducts({ activeOnly: true }),
    staleTime: 60_000,
  });
  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", product?.id],
    queryFn: () => fetchApprovedReviews(product!.id),
    enabled: Boolean(product?.id),
  });

  const relatedFinal = useMemo(() => {
    if (!product) return [];
    const same = all.filter((p) => p.id !== product.id && p.color === product.color);
    return (same.length ? same : all.filter((p) => p.id !== product.id)).slice(0, 4);
  }, [all, product]);

  if (isLoading) {
    return (
      <div className="container-luxe grid gap-10 py-12 lg:grid-cols-2">
        <div className="aspect-[3/4] animate-pulse rounded-xl bg-muted" />
        <div className="space-y-4">
          <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
          <div className="h-24 w-full animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-luxe py-24 text-center">
        <h1 className="font-display text-2xl font-semibold">Saree not found</h1>
        <p className="mt-2 text-muted-foreground">This saree may have been removed.</p>
        <Button variant="hero" className="mt-6" asChild>
          <Link to="/shop">Browse all sarees</Link>
        </Button>
      </div>
    );
  }

  const wished = isWishlisted(product.id);
  const discount =
    product.price > product.offerPrice
      ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
      : 0;
  const code = product.sku ?? product.slug;

  const specs: [string, string][] = [
    ["Fabric", product.fabric || "—"],
    ["Colour", product.color || "—"],
    ["Category", product.category],
    ["Occasion", product.occasion || "—"],
    ["Saree Length", product.sareeLength || "—"],
    ["Blouse", product.blouseIncluded ? `Included${product.blouseLength ? ` (${product.blouseLength})` : ""}` : "Not included"],
    ["Border", product.borderType || "—"],
    ["Wash Care", "Dry clean only"],
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

  const orderHref = settings.orderUrl({
    name: `${product.name} × ${qty}`,
    price: product.offerPrice * qty,
    code,
  });

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
                <img
                  src={img}
                  alt={`${product.name} view ${i + 1}`}
                  className="h-full w-full object-cover"
                />
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
              src={product.images[Math.min(activeImg, product.images.length - 1)]}
              alt={`${product.name} — ${product.fabric || "silk"} saree`}
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
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {product.fabric || product.category}
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5">
              <Star className="h-3.5 w-3.5 fill-gold text-gold" />
              {product.rating ? product.rating.toFixed(1) : "New"}
            </span>
            <span className="text-muted-foreground">{product.reviews} reviews</span>
            <span className="ml-auto font-mono text-xs text-muted-foreground">{code}</span>
          </div>

          <div className="mt-5 flex items-end gap-3">
            <span className="font-display text-3xl font-semibold text-primary">
              {formatINR(product.offerPrice)}
            </span>
            {product.price > product.offerPrice && (
              <span className="text-lg text-muted-foreground line-through">
                {formatINR(product.price)}
              </span>
            )}
            {discount > 0 && (
              <span className="pb-1 text-sm font-medium text-gold">Save {discount}%</span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes</p>

          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            {product.description || product.shortDescription}
          </p>

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

          <div className="mt-4 grid grid-cols-1 gap-3">
            <Button variant="hero" size="lg" disabled={product.stock === 0} asChild={product.stock > 0}>
              {product.stock > 0 ? (
                <a
                  href={orderHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Order ${product.name} on WhatsApp`}
                >
                  <MessageCircle className="h-4 w-4" /> Order on WhatsApp
                </a>
              ) : (
                <span>Currently Unavailable</span>
              )}
            </Button>
          </div>

          {/* Assurance */}
          <div className="mt-6 grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-3">
            {[
              { icon: Truck, t: "Fast Delivery", d: "3–6 business days" },
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
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
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

          <TabsContent
            value="delivery"
            className="mt-6 max-w-2xl space-y-3 text-sm text-muted-foreground"
          >
            <p>
              <strong className="text-foreground">Estimated delivery:</strong> 3–6 business days across
              India, shipped from our Dharmavaram store.
            </p>
            <p>
              <strong className="text-foreground">Returns:</strong> 7-day return window from delivery.
              The saree must be unused with tags intact.
            </p>
            <p>
              <strong className="text-foreground">Questions?</strong> Message us on WhatsApp at{" "}
              {settings.phone}.
            </p>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6 max-w-2xl space-y-5">
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No reviews yet for this saree. Be the first to share your experience with us on WhatsApp.
              </p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center gap-1 text-gold">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-gold" />
                    ))}
                  </div>
                  {r.title && <p className="mt-2 text-sm font-medium">{r.title}</p>}
                  {r.body && <p className="mt-1 text-sm">{r.body}</p>}
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    {r.customer_name ?? "Customer"}
                    {r.is_verified_purchase ? " · Verified buyer" : ""}
                  </p>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Related */}
      {relatedFinal.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-semibold">You May Also Like</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-4">
            {relatedFinal.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

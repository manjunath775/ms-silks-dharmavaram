import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Heart, MessageCircle, Star } from "lucide-react";
import type { Product } from "@/lib/db";
import { formatINR } from "@/lib/db";
import { useStore } from "@/lib/store";
import { useStoreSettings } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ProductCard({ product }: { product: Product }) {
  const { toggleWishlist, isWishlisted } = useStore();
  const settings = useStoreSettings();
  const discount = product.price > product.offerPrice ? product.discount : 0;
  const wished = isWishlisted(product.id);
  const soldOut = product.stock === 0;
  const code = product.sku ?? product.slug;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-soft"
    >
      <Link
        to="/product/$id"
        params={{ id: product.slug }}
        className="relative block aspect-[3/4] overflow-hidden bg-muted"
      >
        <img
          src={product.images[0]}
          alt={`${product.name} — ${product.fabric || "silk"} saree from MS Silks Dharmavaram`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
              {discount}% OFF
            </span>
          )}
          {product.featured && (
            <span className="rounded-full bg-gold px-2.5 py-1 text-[11px] font-semibold text-gold-foreground">
              Featured
            </span>
          )}
        </div>
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <span className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium">
              OUT OF STOCK
            </span>
          </div>
        )}
      </Link>

      <button
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        onClick={() => {
          toggleWishlist(product.id);
          toast(wished ? "Removed from wishlist" : "Added to wishlist");
        }}
        className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-card/90 text-foreground shadow-soft backdrop-blur transition-colors hover:text-primary"
      >
        <Heart className={cn("h-4 w-4", wished && "fill-primary text-primary")} />
      </button>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {product.fabric || product.category}
        </p>
        <Link
          to="/product/$id"
          params={{ id: product.slug }}
          className="mt-1 line-clamp-1 font-display text-lg font-semibold leading-snug hover:text-primary"
        >
          {product.name}
        </Link>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-gold text-gold" />
          <span>{product.rating ? product.rating.toFixed(1) : "New"}</span>
          {product.reviews > 0 && <span>({product.reviews})</span>}
          <span className="ml-auto font-mono text-[11px]">{code}</span>
        </div>

        <div className="mt-3 flex items-end gap-2">
          <span className="text-lg font-semibold text-primary">{formatINR(product.offerPrice)}</span>
          {product.price > product.offerPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatINR(product.price)}
            </span>
          )}
        </div>

        <div className="mt-4 grid gap-2">
          {soldOut ? (
            <Button variant="luxeOutline" size="sm" disabled className="w-full">
              Currently Unavailable
            </Button>
          ) : (
            <Button variant="hero" size="sm" className="w-full" asChild>
              <a
                href={settings.orderUrl({ name: product.name, price: product.offerPrice, code })}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Place order for ${product.name} on WhatsApp`}
              >
                <MessageCircle className="h-4 w-4" /> Place Order
              </a>
            </Button>
          )}
          <Button variant="luxeOutline" size="sm" className="w-full" asChild>
            <Link to="/product/$id" params={{ id: product.slug }}>
              View Details
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

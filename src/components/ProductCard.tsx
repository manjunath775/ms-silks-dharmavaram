import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Heart, ShoppingBag, Star } from "lucide-react";
import type { Product } from "@/lib/products";
import { formatINR } from "@/lib/products";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const discount = Math.round(((product.price - product.offerPrice) / product.price) * 100);
  const wished = isWishlisted(product.id);

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-soft"
    >
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="relative block aspect-[3/4] overflow-hidden bg-muted"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
              {discount}% OFF
            </span>
          )}
          {product.bestseller && (
            <span className="rounded-full bg-gold px-2.5 py-1 text-[11px] font-semibold text-gold-foreground">
              Bestseller
            </span>
          )}
        </div>
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <span className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium">
              Sold Out
            </span>
          </div>
        )}
      </Link>

      <button
        aria-label="Add to wishlist"
        onClick={() => {
          toggleWishlist(product.id);
          toast(wished ? "Removed from wishlist" : "Added to wishlist");
        }}
        className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-card/90 text-foreground shadow-soft backdrop-blur transition-colors hover:text-primary"
      >
        <Heart className={cn("h-4 w-4", wished && "fill-primary text-primary")} />
      </button>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{product.fabric}</p>
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="mt-1 line-clamp-1 font-display text-lg font-semibold leading-snug hover:text-primary"
        >
          {product.name}
        </Link>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-gold text-gold" />
          <span>{product.rating.toFixed(1)}</span>
          <span>({product.reviews})</span>
        </div>

        <div className="mt-3 flex items-end gap-2">
          <span className="text-lg font-semibold text-primary">{formatINR(product.offerPrice)}</span>
          <span className="text-sm text-muted-foreground line-through">{formatINR(product.price)}</span>
        </div>

        <Button
          variant="luxeOutline"
          size="sm"
          disabled={product.stock === 0}
          className="mt-4 w-full"
          onClick={() => {
            addToCart(product);
            toast.success("Added to cart");
          }}
        >
          <ShoppingBag className="h-4 w-4" />
          Add to Cart
        </Button>
      </div>
    </motion.div>
  );
}

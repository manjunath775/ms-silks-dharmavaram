import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "./products";

export type CartItem = { product: Product; qty: number };

type StoreContext = {
  cart: CartItem[];
  wishlist: string[];
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  cartCount: number;
  cartTotal: number;
};

const Ctx = createContext<StoreContext | null>(null);

function useLocal<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(initial);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setState(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [key, state]);
  return [state, setState] as const;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useLocal<CartItem[]>("ms_cart", []);
  const [wishlist, setWishlist] = useLocal<string[]>("ms_wishlist", []);

  const value = useMemo<StoreContext>(() => {
    const addToCart: StoreContext["addToCart"] = (product, qty = 1) =>
      setCart((prev) => {
        const found = prev.find((i) => i.product.id === product.id);
        if (found)
          return prev.map((i) =>
            i.product.id === product.id ? { ...i, qty: i.qty + qty } : i,
          );
        return [...prev, { product, qty }];
      });

    return {
      cart,
      wishlist,
      addToCart,
      removeFromCart: (id) => setCart((prev) => prev.filter((i) => i.product.id !== id)),
      updateQty: (id, qty) =>
        setCart((prev) =>
          prev.map((i) => (i.product.id === id ? { ...i, qty: Math.max(1, qty) } : i)),
        ),
      clearCart: () => setCart([]),
      toggleWishlist: (id) =>
        setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
      isWishlisted: (id) => wishlist.includes(id),
      cartCount: cart.reduce((s, i) => s + i.qty, 0),
      cartTotal: cart.reduce((s, i) => s + i.product.offerPrice * i.qty, 0),
    };
  }, [cart, wishlist, setCart, setWishlist]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

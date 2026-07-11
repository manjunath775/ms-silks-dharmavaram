import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Menu, Moon, Search, ShoppingBag, Sun, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", to: "/" as const },
  { label: "Shop", to: "/shop" as const },
  { label: "Bridal", to: "/shop" as const, search: { collection: "bridal" } },
  { label: "Festival", to: "/shop" as const, search: { collection: "festival" } },
  { label: "About", to: "/about" as const },
  { label: "Contact", to: "/contact" as const },
];

export function Header() {
  const { cartCount, wishlist } = useStore();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/shop", search: { q: query || undefined } });
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-lg">
      <div className="bg-primary text-primary-foreground">
        <div className="container-luxe flex items-center justify-center py-1.5 text-center text-xs tracking-wide">
          ✦ Free shipping across India on orders above ₹2,999 &nbsp;·&nbsp; Authentic handloom silk
        </div>
      </div>

      <div className="container-luxe grid grid-cols-[auto_1fr_auto] items-center gap-4 py-3.5">
        <button
          className="grid h-9 w-9 place-items-center rounded-md md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link to="/" className="flex min-w-0 items-center gap-2 md:justify-self-start">
          <span className="hidden h-9 w-9 shrink-0 place-items-center rounded-full border border-gold/60 font-display text-lg font-semibold text-primary md:grid">
            MS
          </span>
          <span className="flex flex-col leading-none">
            <span className="truncate font-display text-xl font-semibold tracking-tight md:text-2xl">
              MS Silks
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Dharmavaram
            </span>
          </span>
        </Link>

        <nav className="hidden items-center justify-center gap-7 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              search={l.search as never}
              className="relative text-sm font-medium text-foreground/80 transition-colors hover:text-primary after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-0 after:bg-gold after:transition-all hover:after:w-full"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 justify-self-end">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" asChild aria-label="Account">
            <Link to="/account">
              <User className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="relative" aria-label="Wishlist">
            <Link to="/account">
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-gold-foreground">
                  {wishlist.length}
                </span>
              )}
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="relative" aria-label="Cart">
            <Link to="/cart">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>

      <div className="container-luxe hidden pb-3 md:block">
        <form onSubmit={submitSearch} className="relative mx-auto max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for Kanjivaram, Bridal, Festival sarees…"
            className="pl-10"
          />
        </form>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-border bg-background transition-[max-height] duration-300 md:hidden",
          open ? "max-h-[26rem]" : "max-h-0",
        )}
      >
        <div className="container-luxe flex flex-col gap-1 py-4">
          <form onSubmit={submitSearch} className="relative mb-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sarees…"
              className="pl-10"
            />
          </form>
          {navLinks.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              search={l.search as never}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2.5 text-sm font-medium hover:bg-accent"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}

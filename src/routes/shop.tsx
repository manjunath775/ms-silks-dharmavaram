import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import {
  products,
  colors,
  fabrics,
  occasions,
  productCategories,
  formatINR,
} from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Search = { q?: string; collection?: string };

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" ? s.q : undefined,
    collection: typeof s.collection === "string" ? s.collection : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop Silk Sarees — MS Silks Dharmavaram" },
      {
        name: "description",
        content:
          "Browse pure handloom silk sarees — filter by price, colour, fabric, occasion and category. Bridal, festival and designer weaves.",
      },
    ],
  }),
  component: Shop,
});

const PAGE_SIZE = 8;

function Shop() {
  const { q, collection } = Route.useSearch();
  const [search, setSearch] = useState(q ?? "");
  const [selColors, setSelColors] = useState<string[]>([]);
  const [selFabrics, setSelFabrics] = useState<string[]>([]);
  const [selCats, setSelCats] = useState<string[]>([]);
  const [selOccasions, setSelOccasions] = useState<string[]>([]);
  const [price, setPrice] = useState<number[]>([30000]);
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const toggle = (arr: string[], set: (v: string[]) => void, val: string) =>
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (collection === "bridal") list = list.filter((p) => p.bridal);
    if (collection === "festival") list = list.filter((p) => p.festival);
    if (collection === "kanjivaram") list = list.filter((p) => p.fabric.includes("Kanjivaram"));
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          p.fabric.toLowerCase().includes(s) ||
          p.color.toLowerCase().includes(s) ||
          p.category.toLowerCase().includes(s),
      );
    }
    if (selColors.length) list = list.filter((p) => selColors.includes(p.color));
    if (selFabrics.length) list = list.filter((p) => selFabrics.includes(p.fabric));
    if (selCats.length) list = list.filter((p) => selCats.includes(p.category));
    if (selOccasions.length) list = list.filter((p) => selOccasions.includes(p.occasion));
    list = list.filter((p) => p.offerPrice <= price[0]);
    if (inStock) list = list.filter((p) => p.stock > 0);

    if (sort === "price-low") list.sort((a, b) => a.offerPrice - b.offerPrice);
    if (sort === "price-high") list.sort((a, b) => b.offerPrice - a.offerPrice);
    if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [collection, search, selColors, selFabrics, selCats, selOccasions, price, inStock, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageItems = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const clearAll = () => {
    setSelColors([]);
    setSelFabrics([]);
    setSelCats([]);
    setSelOccasions([]);
    setPrice([30000]);
    setInStock(false);
    setSearch("");
    setPage(1);
  };

  const FilterGroup = ({
    title,
    options,
    sel,
    set,
  }: {
    title: string;
    options: string[];
    sel: string[];
    set: (v: string[]) => void;
  }) => (
    <div className="border-b border-border pb-5">
      <h4 className="mb-3 text-sm font-semibold">{title}</h4>
      <div className="space-y-2.5">
        {options.map((o) => (
          <label key={o} className="flex cursor-pointer items-center gap-2.5 text-sm">
            <Checkbox
              checked={sel.includes(o)}
              onCheckedChange={() => {
                toggle(sel, set, o);
                setPage(1);
              }}
            />
            <span className="text-muted-foreground">{o}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const FilterPanel = (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-semibold">Filters</h3>
        <button onClick={clearAll} className="text-xs text-primary hover:underline">
          Clear all
        </button>
      </div>

      <div className="border-b border-border pb-5">
        <h4 className="mb-3 text-sm font-semibold">Price up to {formatINR(price[0])}</h4>
        <Slider
          value={price}
          onValueChange={(v) => {
            setPrice(v);
            setPage(1);
          }}
          min={5000}
          max={30000}
          step={1000}
        />
      </div>

      <FilterGroup title="Category" options={productCategories} sel={selCats} set={setSelCats} />
      <FilterGroup title="Colour" options={colors} sel={selColors} set={setSelColors} />
      <FilterGroup title="Fabric" options={fabrics} sel={selFabrics} set={setSelFabrics} />
      <FilterGroup title="Occasion" options={occasions} sel={selOccasions} set={setSelOccasions} />

      <label className="flex cursor-pointer items-center gap-2.5 text-sm">
        <Checkbox
          checked={inStock}
          onCheckedChange={(c) => {
            setInStock(Boolean(c));
            setPage(1);
          }}
        />
        <span className="text-muted-foreground">In stock only</span>
      </label>
    </div>
  );

  return (
    <div className="container-luxe py-8">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">
          {collection ? `${collection} collection` : "Our Collection"}
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Shop Silk Sarees</h1>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search sarees…"
          className="sm:max-w-xs"
        />
        <div className="flex items-center gap-3 sm:ml-auto">
          <Button
            variant="outline"
            className="lg:hidden"
            onClick={() => setShowFilters(true)}
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </Button>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-40">{FilterPanel}</div>
        </aside>

        <div>
          <p className="mb-4 text-sm text-muted-foreground">
            Showing {pageItems.length} of {filtered.length} sarees
          </p>
          {pageItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-20 text-center text-muted-foreground">
              No sarees match your filters.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:gap-5 xl:grid-cols-3">
              {pageItems.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-10 flex justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-md border text-sm transition-colors",
                    current === i + 1
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-gold",
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto bg-background p-5 shadow-luxe">
            <button
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-md hover:bg-accent"
              onClick={() => setShowFilters(false)}
              aria-label="Close filters"
            >
              <X className="h-5 w-5" />
            </button>
            {FilterPanel}
            <Button variant="hero" className="mt-6 w-full" onClick={() => setShowFilters(false)}>
              Show {filtered.length} results
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

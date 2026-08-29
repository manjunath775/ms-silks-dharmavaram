import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, X } from "lucide-react";
import { fetchProducts, formatINR } from "@/lib/db";
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
      { property: "og:title", content: "Shop Silk Sarees — MS Silks Dharmavaram" },
      {
        property: "og:description",
        content: "Pure handloom silk sarees from Dharmavaram — bridal, festival and designer weaves.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Shop,
});

const PAGE_SIZE = 9;
const MAX_PRICE = 50000;

export const productsQuery = {
  queryKey: ["products", "active"] as const,
  queryFn: () => fetchProducts({ activeOnly: true }),
  staleTime: 60_000,
};

function Shop() {
  const { q, collection } = Route.useSearch();
  const { data: products = [], isLoading, error } = useQuery(productsQuery);
  const [search, setSearch] = useState(q ?? "");
  const [selColors, setSelColors] = useState<string[]>([]);
  const [selFabrics, setSelFabrics] = useState<string[]>([]);
  const [selCats, setSelCats] = useState<string[]>([]);
  const [selOccasions, setSelOccasions] = useState<string[]>([]);
  const [price, setPrice] = useState<number[]>([MAX_PRICE]);
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const uniq = (vals: (string | null | undefined)[]) =>
    Array.from(new Set(vals.filter((v): v is string => Boolean(v && v.trim())))).sort();

  const colors = useMemo(() => uniq(products.map((p) => p.color)), [products]);
  const fabrics = useMemo(() => uniq(products.map((p) => p.fabric)), [products]);
  const cats = useMemo(() => uniq(products.map((p) => p.category)), [products]);
  const occasions = useMemo(() => uniq(products.map((p) => p.occasion)), [products]);

  const toggle = (arr: string[], set: (v: string[]) => void, val: string) =>
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (collection) {
      const c = collection.toLowerCase();
      list = list.filter(
        (p) =>
          p.tags.some((t) => t.toLowerCase() === c) ||
          p.category.toLowerCase().includes(c) ||
          (p.fabric ?? "").toLowerCase().includes(c) ||
          (p.occasion ?? "").toLowerCase().includes(c),
      );
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter((p) =>
        [p.name, p.fabric, p.color, p.category, p.occasion].some((f) =>
          (f ?? "").toLowerCase().includes(s),
        ),
      );
    }
    if (selColors.length) list = list.filter((p) => selColors.includes(p.color));
    if (selFabrics.length) list = list.filter((p) => selFabrics.includes(p.fabric));
    if (selCats.length) list = list.filter((p) => selCats.includes(p.category));
    if (selOccasions.length) list = list.filter((p) => selOccasions.includes(p.occasion));
    list = list.filter((p) => p.offerPrice <= price[0]);
    if (inStock) list = list.filter((p) => p.stock > 0);

    if (sort === "featured") list.sort((a, b) => Number(b.featured) - Number(a.featured));
    if (sort === "price-low") list.sort((a, b) => a.offerPrice - b.offerPrice);
    if (sort === "price-high") list.sort((a, b) => b.offerPrice - a.offerPrice);
    if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [products, collection, search, selColors, selFabrics, selCats, selOccasions, price, inStock, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageItems = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const clearAll = () => {
    setSelColors([]);
    setSelFabrics([]);
    setSelCats([]);
    setSelOccasions([]);
    setPrice([MAX_PRICE]);
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
  }) =>
    options.length === 0 ? null : (
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
          min={1000}
          max={MAX_PRICE}
          step={1000}
        />
      </div>

      <FilterGroup title="Category" options={cats} sel={selCats} set={setSelCats} />
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
          <Button variant="outline" className="lg:hidden" onClick={() => setShowFilters(true)}>
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
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 md:gap-5 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-lg border border-border bg-card">
                  <div className="aspect-[3/4] w-full rounded-t-lg bg-muted" />
                  <div className="space-y-2 p-4">
                    <div className="h-3 w-1/3 rounded bg-muted" />
                    <div className="h-4 w-3/4 rounded bg-muted" />
                    <div className="h-4 w-1/2 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-dashed border-border py-20 text-center text-muted-foreground">
              Could not load sarees right now. Please refresh the page.
            </div>
          ) : (
            <>
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
            </>
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

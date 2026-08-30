import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Award,
  BadgeCheck,
  ChevronRight,
  Gem,
  Quote,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import heroSaree from "@/assets/hero-saree.jpg";
import bridalBanner from "@/assets/bridal-banner.jpg";
import festivalBanner from "@/assets/festival-banner.jpg";
import { useQuery } from "@tanstack/react-query";
import { categories } from "@/lib/products";
import { fetchProducts, type Product } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Home,
});

const trust = [
  { icon: Truck, title: "Free Shipping", desc: "On orders above ₹2,999" },
  { icon: BadgeCheck, title: "100% Pure Silk", desc: "Silk Mark certified" },
  { icon: Award, title: "Handloom Craft", desc: "By master weavers" },
  { icon: Gem, title: "Authentic Zari", desc: "Real gold-tested" },
];

const reviews = [
  {
    name: "Lakshmi Priya",
    text: "The bridal Kanjivaram I ordered was even more stunning in person. The zari work is exquisite and the silk feels so premium.",
    role: "Bride, Hyderabad",
  },
  {
    name: "Anjali Reddy",
    text: "Authentic Dharmavaram silk at last! Beautiful packaging, fast delivery, and the colour was exactly as shown.",
    role: "Bengaluru",
  },
  {
    name: "Sneha Varma",
    text: "I've bought three sarees now. Unmatched quality and the customer support on WhatsApp is wonderful.",
    role: "Chennai",
  },
];

function Home() {
  const { data } = useQuery({
    queryKey: ["products", "home"],
    queryFn: () => fetchProducts({ activeOnly: true }),
    staleTime: 60_000,
  });
  const products: Product[] = data ?? [];
  const featuredList = products.filter((p) => p.featured);
  const bestsellers = (featuredList.length ? featuredList : products).slice(0, 4);
  const trending = products.slice(0, 8);


  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-secondary/40">
        <div className="container-luxe grid items-center gap-8 py-12 md:grid-cols-2 md:py-16 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="order-2 md:order-1"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-card px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-3.5 w-3.5 text-gold" /> Handwoven in Dharmavaram
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">
              Timeless Silk,<br />
              <span className="gold-text">Woven for Royalty</span>
            </h1>
            <p className="mt-5 max-w-md text-base text-muted-foreground sm:text-lg">
              Discover our exclusive collection of pure handloom silk sarees — where centuries of
              craftsmanship meet contemporary elegance.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="xl">
                <Link to="/shop">
                  Shop Now <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="luxeOutline" size="xl">
                <Link to="/shop" search={{ collection: "bridal" }}>
                  Bridal Collection
                </Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-6">
              <div>
                <p className="font-display text-2xl font-semibold">3,000+</p>
                <p className="text-xs text-muted-foreground">Happy customers</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <p className="font-display text-2xl font-semibold">75+ yrs</p>
                <p className="text-xs text-muted-foreground">Weaving legacy</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-gold text-gold" />
                <span className="font-display text-2xl font-semibold">4.9</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="order-1 md:order-2"
          >
            <div className="relative overflow-hidden rounded-2xl shadow-luxe">
              <img
                src={heroSaree}
                alt="Premium Dharmavaram silk saree in maroon and gold"
                width={1600}
                height={1104}
                className="h-full w-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-border bg-card">
        <div className="container-luxe grid grid-cols-2 gap-6 py-6 md:grid-cols-4">
          {trust.map((t) => (
            <div key={t.title} className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-secondary text-primary">
                <t.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{t.title}</p>
                <p className="truncate text-xs text-muted-foreground">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Collections */}
      <section className="container-luxe py-16">
        <SectionHeading
          eyebrow="Curated for You"
          title="Featured Collections"
          subtitle="Explore our signature weaves crafted for every occasion"
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c, i) => (
            <Reveal key={c.name} delay={i * 0.08}>
              <Link
                to="/shop"
                search={{ collection: c.tag }}
                className="group relative block overflow-hidden rounded-xl"
              >
                <div className="aspect-[3/4] overflow-hidden bg-muted">
                  <img
                    src={products[i * 3].images[0]}
                    alt={c.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
                <div className="absolute bottom-0 left-0 p-5 text-background">
                  <h3 className="font-display text-xl font-semibold">{c.name}</h3>
                  <p className="text-sm opacity-90">{c.desc}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-gold">
                    Shop now <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="bg-secondary/40 py-16">
        <div className="container-luxe">
          <SectionHeading
            eyebrow="Most Loved"
            title="Trending Sarees"
            subtitle="What everyone is draping this season"
          />
          <div className="mt-10 grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-4">
            {trending.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Bridal + Festival split banners */}
      <section className="container-luxe grid gap-6 py-16 md:grid-cols-2">
        <SplitBanner
          img={bridalBanner}
          eyebrow="For the Big Day"
          title="Bridal Collection"
          desc="Grand Kanjivaram weaves that make your moment unforgettable."
          to="bridal"
        />
        <SplitBanner
          img={festivalBanner}
          eyebrow="Season of Lights"
          title="Festival Collection"
          desc="Radiant colours and rich zari for every celebration."
          to="festival"
        />
      </section>

      {/* Best Sellers */}
      <section className="container-luxe py-4 pb-16">
        <SectionHeading
          eyebrow="Customer Favourites"
          title="Best Sellers"
          subtitle="Handpicked pieces our customers can't get enough of"
        />
        <div className="mt-10 grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-4">
          {bestsellers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button asChild variant="hero" size="lg">
            <Link to="/shop">View All Sarees</Link>
          </Button>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="bg-secondary/40 py-16">
        <div className="container-luxe">
          <SectionHeading
            eyebrow="Fresh off the Loom"
            title="New Arrivals"
            subtitle="The latest additions to our handloom family"
          />
          <div className="mt-10 grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-4">
            {products.slice(-4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="container-luxe py-16">
        <SectionHeading
          eyebrow="The MS Silks Promise"
          title="Why Choose Us"
          subtitle="More than a saree — a heritage you can wear"
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Award,
              title: "Master Weavers",
              desc: "Every saree is handwoven by skilled artisans preserving a 75-year legacy of Dharmavaram craftsmanship.",
            },
            {
              icon: Gem,
              title: "Pure & Certified",
              desc: "100% pure mulberry silk with authentic tested zari, backed by our Silk Mark guarantee.",
            },
            {
              icon: Truck,
              title: "Nationwide Delivery",
              desc: "Safe, insured and fast delivery across India with easy 7-day returns on every order.",
            },
          ].map((f, i) => (
            <Reveal key={f.title} delay={i * 0.1}>
              <div className="h-full rounded-xl border border-border bg-card p-7 shadow-soft">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container-luxe">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Loved by Thousands</p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              Customer Reviews
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {reviews.map((r, i) => (
              <Reveal key={r.name} delay={i * 0.1}>
                <div className="h-full rounded-xl border border-primary-foreground/15 bg-primary-foreground/5 p-7 backdrop-blur">
                  <Quote className="h-8 w-8 text-gold" />
                  <p className="mt-4 text-sm leading-relaxed opacity-95">{r.text}</p>
                  <div className="mt-5 flex items-center gap-1 text-gold">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="h-4 w-4 fill-gold" />
                    ))}
                  </div>
                  <p className="mt-3 font-display text-lg font-semibold">{r.name}</p>
                  <p className="text-xs opacity-75">{r.role}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram Gallery */}
      <section className="container-luxe py-16">
        <SectionHeading
          eyebrow="@mssilks_dharmavaram"
          title="Follow Our Journey"
          subtitle="Tag us to be featured on our page"
        />
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {products.slice(0, 6).map((p, i) => (
            <a
              key={p.id}
              href="#"
              className="group relative aspect-square overflow-hidden rounded-lg bg-muted"
            >
              <img
                src={p.images[i % 3]}
                alt="Instagram post"
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-primary/0 transition-colors group-hover:bg-primary/40">
                <Sparkles className="h-6 w-6 text-background opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-gold">{eyebrow}</p>
      <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">{title}</h2>
      <p className="mt-3 text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function SplitBanner({
  img,
  eyebrow,
  title,
  desc,
  to,
}: {
  img: string;
  eyebrow: string;
  title: string;
  desc: string;
  to: string;
}) {
  return (
    <Reveal className="h-full">
      <Link
        to="/shop"
        search={{ collection: to }}
        className="group relative block h-full min-h-72 overflow-hidden rounded-2xl"
      >
        <img
          src={img}
          alt={title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/75 via-foreground/30 to-transparent" />
        <div className="relative z-10 flex h-full flex-col justify-end p-8 text-background">
          <p className="text-xs uppercase tracking-[0.25em] text-gold">{eyebrow}</p>
          <h3 className="mt-2 font-display text-3xl font-semibold">{title}</h3>
          <p className="mt-2 max-w-xs text-sm opacity-90">{desc}</p>
          <span className="mt-4 inline-flex w-fit items-center gap-1 rounded-full bg-background px-5 py-2 text-sm font-medium text-foreground transition-transform group-hover:translate-x-1">
            Explore <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}

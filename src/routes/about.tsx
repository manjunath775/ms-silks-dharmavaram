import { createFileRoute } from "@tanstack/react-router";
import { Award, Eye, Factory, Heart, ShieldCheck, Target } from "lucide-react";
import bridalBanner from "@/assets/bridal-banner.jpg";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — MS Silks Dharmavaram" },
      {
        name: "description",
        content:
          "Discover the story of MS Silks Dharmavaram — three generations of master weavers crafting pure handloom silk sarees with authentic gold zari.",
      },
      { property: "og:title", content: "About MS Silks Dharmavaram" },
      { property: "og:description", content: "Three generations of handloom silk saree craftsmanship." },
      { property: "og:image", content: bridalBanner },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <img src={bridalBanner} alt="MS Silks heritage" className="h-72 w-full object-cover md:h-96" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 to-foreground/20" />
        <div className="container-luxe absolute inset-0 flex flex-col justify-center text-background">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Our Heritage</p>
          <h1 className="mt-2 max-w-lg font-display text-4xl font-semibold sm:text-5xl">
            A Legacy Woven in Pure Silk
          </h1>
        </div>
      </section>

      <section className="container-luxe grid gap-8 py-16 md:grid-cols-2">
        <Reveal>
          <div>
            <h2 className="font-display text-3xl font-semibold">Our Story</h2>
            <p className="mt-4 text-muted-foreground">
              Rooted in the historic weaving town of Dharmavaram, MS Silks began over 75 years ago as a
              small family loom. Today, we carry forward that same devotion to craft — partnering with
              master weavers who pour their skill into every thread.
            </p>
            <p className="mt-3 text-muted-foreground">
              Each saree is a labour of love, taking days to weave, dyed in rich traditional hues and
              adorned with authentic gold zari. We bring these treasures directly from our looms to your
              wardrobe, without compromise.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Award, stat: "75+", label: "Years of heritage" },
              { icon: Heart, stat: "3,000+", label: "Happy customers" },
              { icon: Factory, stat: "200+", label: "Master weavers" },
              { icon: ShieldCheck, stat: "100%", label: "Silk Mark certified" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-card p-6 text-center">
                <s.icon className="mx-auto h-7 w-7 text-primary" />
                <p className="mt-3 font-display text-3xl font-semibold gold-text">{s.stat}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="bg-secondary/40 py-16">
        <div className="container-luxe grid gap-6 md:grid-cols-2">
          {[
            {
              icon: Target,
              title: "Our Mission",
              desc: "To preserve and celebrate the timeless art of Dharmavaram handloom weaving, bringing authentic luxury silk sarees to women everywhere at honest prices.",
            },
            {
              icon: Eye,
              title: "Our Vision",
              desc: "To be the most trusted name in handwoven silk, empowering weaver communities while draping generations in heritage they can wear with pride.",
            },
          ].map((v, i) => (
            <Reveal key={v.title} delay={i * 0.1}>
              <div className="h-full rounded-xl border border-border bg-card p-8">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-2xl font-semibold">{v.title}</h3>
                <p className="mt-2 text-muted-foreground">{v.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-luxe py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">From Loom to Wardrobe</p>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Our Craft & Quality</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-4">
          {[
            { step: "01", title: "Sourcing", desc: "Finest mulberry silk & pure zari sourced ethically." },
            { step: "02", title: "Handloom Weaving", desc: "Woven thread by thread by master artisans." },
            { step: "03", title: "Quality Check", desc: "Every saree inspected for flawless finish." },
            { step: "04", title: "Silk Mark", desc: "Certified authentic before it reaches you." },
          ].map((s, i) => (
            <Reveal key={s.step} delay={i * 0.08}>
              <div className="rounded-xl border border-border bg-card p-6">
                <span className="font-display text-3xl font-semibold text-gold">{s.step}</span>
                <h3 className="mt-3 font-display text-lg font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}

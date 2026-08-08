import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Reveal } from "@/components/Reveal";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — MS Silks Dharmavaram" },
      {
        name: "description",
        content:
          "Get in touch with MS Silks Dharmavaram. Visit our store, call, email or message us on WhatsApp for saree enquiries and custom orders.",
      },
      { property: "og:title", content: "Contact MS Silks Dharmavaram" },
      { property: "og:description", content: "Reach us by phone, email or WhatsApp." },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <div className="container-luxe py-12">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">We'd Love to Hear From You</p>
        <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">Get in Touch</h1>
        <p className="mt-3 text-muted-foreground">
          Questions about a saree, custom orders, or bulk enquiries — our team is here to help.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          {[
            { icon: MapPin, title: "Visit Us", lines: ["11/282, Near Ramalayam Temple", "Thogata Street, Dharmavaram", "Andhra Pradesh 515671"] },
            { icon: Phone, title: "Call Us", lines: ["+91 98765 43210", "Mon–Sat, 10am–8pm"] },
            { icon: Mail, title: "Email Us", lines: ["care@mssilks.in", "orders@mssilks.in"] },
          ].map((c) => (
            <Reveal key={c.title}>
              <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-5">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <c.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{c.title}</p>
                  {c.lines.map((l) => (
                    <p key={l} className="text-sm text-muted-foreground">
                      {l}
                    </p>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
          <Button
            asChild
            variant="gold"
            size="lg"
            className="w-full"
          >
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
            </a>
          </Button>
        </div>

        <Reveal delay={0.1}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Message sent! We'll get back to you soon.");
              (e.target as HTMLFormElement).reset();
            }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block text-sm">Name</Label>
                <Input required placeholder="Your name" />
              </div>
              <div>
                <Label className="mb-1.5 block text-sm">Phone</Label>
                <Input type="tel" placeholder="+91 …" />
              </div>
            </div>
            <div className="mt-4">
              <Label className="mb-1.5 block text-sm">Email</Label>
              <Input type="email" required placeholder="you@example.com" />
            </div>
            <div className="mt-4">
              <Label className="mb-1.5 block text-sm">Message</Label>
              <Textarea required rows={5} placeholder="How can we help?" />
            </div>
            <Button type="submit" variant="hero" size="lg" className="mt-5 w-full">
              Send Message
            </Button>
          </form>
        </Reveal>
      </div>

      <div className="mt-12 overflow-hidden rounded-xl border border-border">
        <iframe
          title="MS Silks Dharmavaram location"
          src="https://www.google.com/maps?q=Thogata+Street,+Near+Ramalayam+Temple,+Dharmavaram,+Andhra+Pradesh+515671&output=embed"
          className="h-80 w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}

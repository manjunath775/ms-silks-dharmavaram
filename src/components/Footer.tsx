import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-secondary/50">
      <div className="container-luxe grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="font-display text-2xl font-semibold">MS Silks Dharmavaram</h3>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Handwoven luxury silk sarees crafted by master weavers of Dharmavaram, delivering
            timeless elegance since three generations.
          </p>
          <div className="mt-5 flex gap-2">
            {[
              { icon: Instagram, label: "Instagram" },
              { icon: Facebook, label: "Facebook" },
              { icon: MessageCircle, label: "WhatsApp" },
            ].map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-gold hover:text-primary"
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider">Quick Links</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            {[
              { label: "Shop All", to: "/shop" as const },
              { label: "About Us", to: "/about" as const },
              { label: "Contact", to: "/contact" as const },
              { label: "My Account", to: "/account" as const },
              { label: "Cart", to: "/cart" as const },
            ].map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="hover:text-primary">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider">Get in Touch</h4>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              11/282, Near Ramalayam Temple, Thogata Street, Dharmavaram, Andhra Pradesh 515671
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-gold" /> +91 98765 43210
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-gold" /> care@mssilks.in
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider">Newsletter</h4>
          <p className="mt-4 text-sm text-muted-foreground">
            Subscribe for early access to new collections & exclusive offers.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Thank you for subscribing!");
              (e.target as HTMLFormElement).reset();
            }}
            className="mt-4 flex gap-2"
          >
            <Input type="email" required placeholder="Your email" />
            <Button type="submit" variant="gold">
              Join
            </Button>
          </form>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-luxe flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} MS Silks Dharmavaram. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/policies/$slug" params={{ slug: "privacy" }} className="hover:text-primary">
              Privacy
            </Link>
            <Link to="/policies/$slug" params={{ slug: "terms" }} className="hover:text-primary">
              Terms
            </Link>
            <Link to="/policies/$slug" params={{ slug: "shipping" }} className="hover:text-primary">
              Shipping
            </Link>
            <Link to="/policies/$slug" params={{ slug: "returns" }} className="hover:text-primary">
              Returns
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

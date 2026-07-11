import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

export type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  fabric: string;
  color: string;
  occasion: string;
  price: number;
  offerPrice: number;
  stock: number;
  rating: number;
  reviews: number;
  images: string[];
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  bridal: boolean;
  festival: boolean;
  sareeLength: string;
  blouse: string;
};

const imgs = [product1, product2, product3, product4];

const base = [
  { name: "Maroon Kanjivaram Bridal Silk", color: "Maroon", fabric: "Kanjivaram Silk", occasion: "Bridal", img: 0, price: 24999, offer: 18999, bridal: true, festival: true, best: true },
  { name: "Emerald Banarasi Pure Silk", color: "Green", fabric: "Banarasi Silk", occasion: "Festival", img: 1, price: 18999, offer: 14499, bridal: false, festival: true, best: true },
  { name: "Royal Blue Peacock Zari Silk", color: "Blue", fabric: "Dharmavaram Silk", occasion: "Wedding", img: 2, price: 21999, offer: 16999, bridal: true, festival: false, best: true },
  { name: "Blush Pink Floral Zari Silk", color: "Pink", fabric: "Soft Silk", occasion: "Reception", img: 3, price: 15999, offer: 11999, bridal: false, festival: true, best: false },
  { name: "Deep Maroon Temple Border Silk", color: "Maroon", fabric: "Dharmavaram Silk", occasion: "Festival", img: 0, price: 19999, offer: 15499, bridal: true, festival: true, best: true },
  { name: "Forest Green Kanchi Silk", color: "Green", fabric: "Kanjivaram Silk", occasion: "Party", img: 1, price: 16999, offer: 12999, bridal: false, festival: false, best: false },
  { name: "Sapphire Zari Wedding Silk", color: "Blue", fabric: "Banarasi Silk", occasion: "Wedding", img: 2, price: 23999, offer: 17999, bridal: true, festival: false, best: false },
  { name: "Rose Gold Handloom Silk", color: "Pink", fabric: "Handloom Silk", occasion: "Festival", img: 3, price: 13999, offer: 9999, bridal: false, festival: true, best: true },
  { name: "Regal Maroon Bridal Kanchi", color: "Maroon", fabric: "Kanjivaram Silk", occasion: "Bridal", img: 0, price: 27999, offer: 21999, bridal: true, festival: false, best: true },
  { name: "Ivory Green Traditional Silk", color: "Green", fabric: "Dharmavaram Silk", occasion: "Reception", img: 1, price: 17999, offer: 13499, bridal: false, festival: true, best: false },
  { name: "Midnight Blue Grand Silk", color: "Blue", fabric: "Soft Silk", occasion: "Party", img: 2, price: 14999, offer: 10999, bridal: false, festival: false, best: false },
  { name: "Coral Pink Zari Festive Silk", color: "Pink", fabric: "Banarasi Silk", occasion: "Festival", img: 3, price: 16499, offer: 12499, bridal: false, festival: true, best: true },
];

export const products: Product[] = base.map((b, i) => ({
  id: `saree-${i + 1}`,
  name: b.name,
  description:
    "A masterpiece of Dharmavaram handloom artistry, this pure silk saree is woven by master weavers using time-honoured techniques. The lustrous body is complemented by an intricate gold zari border and a richly detailed pallu, making it a timeless addition to your wardrobe.",
  category: b.bridal ? "Bridal Sarees" : b.festival ? "Festival Sarees" : "Designer Sarees",
  fabric: b.fabric,
  color: b.color,
  occasion: b.occasion,
  price: b.price,
  offerPrice: b.offer,
  stock: (i % 4 === 0 ? 0 : 3 + (i % 9)),
  rating: 4.3 + ((i % 6) / 10),
  reviews: 24 + i * 13,
  images: [imgs[b.img], imgs[(b.img + 1) % 4], imgs[(b.img + 2) % 4]],
  featured: i < 6,
  bestseller: b.best,
  newArrival: i >= 8,
  bridal: b.bridal,
  festival: b.festival,
  sareeLength: "6.3 metres (with 0.8m blouse piece)",
  blouse: "Unstitched matching blouse piece included",
}));

export const categories = [
  { name: "Bridal Sarees", tag: "bridal", desc: "Grand weaves for your big day" },
  { name: "Festival Sarees", tag: "festival", desc: "Celebrate in rich colours" },
  { name: "Kanjivaram Silk", tag: "kanjivaram", desc: "Pure zari classics" },
  { name: "Designer Sarees", tag: "designer", desc: "Contemporary elegance" },
];

export const colors = ["Maroon", "Green", "Blue", "Pink"];
export const fabrics = ["Kanjivaram Silk", "Banarasi Silk", "Dharmavaram Silk", "Soft Silk", "Handloom Silk"];
export const occasions = ["Bridal", "Wedding", "Festival", "Reception", "Party"];
export const productCategories = ["Bridal Sarees", "Festival Sarees", "Designer Sarees"];

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export const getProduct = (id: string) => products.find((p) => p.id === id);

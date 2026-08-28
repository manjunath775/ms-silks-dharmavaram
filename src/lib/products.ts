// Static catalogue metadata. All saree data itself now comes from the database
// (see src/lib/db.ts). This file only holds presentation constants.
export type { Product } from "./db";
export { formatINR } from "./db";

export const categories = [
  { name: "Bridal Sarees", tag: "bridal", desc: "Grand weaves for your big day" },
  { name: "Festival Sarees", tag: "festival", desc: "Celebrate in rich colours" },
  { name: "Kanjivaram Silk", tag: "kanjivaram", desc: "Pure zari classics" },
  { name: "Designer Sarees", tag: "designer", desc: "Contemporary elegance" },
];

export const colors = ["Maroon", "Green", "Blue", "Pink", "Gold", "Purple", "Orange"];
export const fabrics = [
  "Kanjivaram Silk",
  "Banarasi Silk",
  "Dharmavaram Silk",
  "Soft Silk",
  "Handloom Silk",
];
export const occasions = ["Bridal", "Wedding", "Festival", "Reception", "Party"];

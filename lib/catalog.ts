import type { ColorOption, Product, ProductId } from "./types";
import { PARTS } from "./parts";

export const CASUAL_PRODUCTS: ProductId[] = ["tshirt", "hoodie", "sweatshirt", "cap", "pants"];
export const FOOTBALL_PRODUCTS: ProductId[] = ["football_jersey", "football_shorts"];

export const COLORS: ColorOption[] = [
  { id: "black", name: "Black", hex: "#141414" },
  { id: "white", name: "White", hex: "#f4efe6" },
  { id: "gray", name: "Gray", hex: "#6f6c68" },
  { id: "beige", name: "Beige", hex: "#d7c4a3" },
  { id: "navy", name: "Navy", hex: "#1c2744" },
  { id: "olive", name: "Olive", hex: "#3d4630" },
  { id: "burgundy", name: "Burgundy", hex: "#5a1f2a" },
  { id: "sand", name: "Sand", hex: "#c4a06a" },
];

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

export const PRODUCTS: Product[] = [
  {
    id: "tshirt",
    name: "T-Shirt",
    blurb: "Soft jersey. The blank you start from.",
    price: 48,
    placements: PARTS.tshirt,
  },
  {
    id: "hoodie",
    name: "Hoodie",
    blurb: "Heavy fleece. Room for a larger mark.",
    price: 89,
    placements: PARTS.hoodie,
  },
  {
    id: "sweatshirt",
    name: "Sweatshirt",
    blurb: "Crew neck. Clean surface, quiet weight.",
    price: 72,
    placements: PARTS.sweatshirt,
  },
  {
    id: "cap",
    name: "Cap",
    blurb: "Structured six-panel. Front mark, back tab.",
    price: 36,
    placements: PARTS.cap,
  },
  {
    id: "pants",
    name: "Pants",
    blurb: "Relaxed cut. Pocket or thigh print.",
    price: 96,
    placements: PARTS.pants,
  },
  {
    id: "football_jersey",
    name: "Football Jersey",
    blurb: "Match kit top. Chest logo, back name and number.",
    price: 120,
    placements: PARTS.football_jersey,
  },
  {
    id: "football_shorts",
    name: "Football Shorts",
    blurb: "Match shorts. Thigh and back print zones.",
    price: 85,
    placements: PARTS.football_shorts,
  },
];

export const SYMBOLS = ["✦", "◎", "△", "◇", "※", "☽", "⌘", "❧"];

export const PATTERNS = [
  { id: "dots", label: "Dots" },
  { id: "stripes", label: "Stripes" },
  { id: "grid", label: "Grid" },
  { id: "wave", label: "Wave" },
] as const;

export function productById(id: ProductId) {
  return PRODUCTS.find((p) => p.id === id)!;
}

export function colorById(id: string) {
  return COLORS.find((c) => c.id === id) ?? COLORS[0];
}

export function formatPrice(n: number) {
  const v = Math.round(n * 100) / 100;
  return `${v} сом`;
}

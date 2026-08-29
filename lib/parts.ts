import type { PartDef, ProductId, View } from "./types";

const p = (
  id: string,
  label: string,
  view: View,
  colorKey: string,
  left: number,
  top: number,
  width: number,
  height: number
): PartDef => ({ id, label, view, colorKey, left, top, width, height });

/** Left / right sleeve zones — coords match garment photo in the full preview box */
const sleeveZones = (view: View = "sleeves"): PartDef[] => [
  p("sleeve_left", "Left sleeve", view, "torso", 10, 22, 20, 32),
  p("sleeve_right", "Right sleeve", view, "torso", 70, 22, 20, 32),
];

export const PARTS: Record<ProductId, PartDef[]> = {
  tshirt: [
    p("chest", "Chest", "front", "torso", 32, 26, 36, 26),
    p("hem", "Hem", "front", "torso", 34, 58, 32, 20),
    ...sleeveZones(),
    p("back", "Back", "back", "torso", 30, 24, 40, 32),
    p("hem_back", "Lower back", "back", "torso", 32, 60, 36, 18),
  ],
  hoodie: [
    p("chest", "Chest", "front", "torso", 32, 26, 36, 22),
    p("pocket", "Pocket", "front", "torso", 38, 52, 24, 14),
    p("hem", "Hem", "front", "torso", 34, 70, 32, 14),
    ...sleeveZones(),
    p("back", "Back", "back", "torso", 30, 24, 40, 32),
    p("hem_back", "Lower back", "back", "torso", 32, 60, 36, 18),
  ],
  sweatshirt: [
    p("chest", "Chest", "front", "torso", 32, 26, 36, 26),
    p("hem", "Hem", "front", "torso", 34, 58, 32, 20),
    ...sleeveZones(),
    p("back", "Back", "back", "torso", 30, 24, 40, 32),
    p("hem_back", "Lower back", "back", "torso", 32, 60, 36, 18),
  ],
  cap: [
    p("front", "Front", "front", "crown", 34, 28, 32, 22),
    p("back", "Back", "back", "crown", 34, 28, 32, 24),
  ],
  pants: [
    p("pocket", "Pocket", "front", "torso", 38, 14, 24, 12),
    p("thigh", "Thigh", "front", "torso", 48, 40, 22, 20),
    p("calf", "Calf", "front", "torso", 50, 68, 18, 18),
    p("back", "Back", "back", "torso", 36, 16, 28, 20),
    p("seat", "Seat", "back", "torso", 38, 42, 26, 18),
    p("hem_back", "Lower back", "back", "torso", 48, 70, 18, 16),
  ],
};

export const COLOR_KEYS: Record<ProductId, { id: string; label: string }[]> = {
  tshirt: [{ id: "torso", label: "Torso" }],
  sweatshirt: [{ id: "torso", label: "Torso" }],
  hoodie: [{ id: "torso", label: "Torso" }],
  cap: [{ id: "crown", label: "Crown" }],
  pants: [{ id: "torso", label: "Torso" }],
};

export function isSleeveZone(id: string) {
  return id === "sleeve" || id.startsWith("sleeve_");
}

/** Garment photo side for a studio view */
export function garmentSide(view: View): "front" | "back" {
  return view === "back" ? "back" : "front";
}

export function partsFor(product: ProductId, view?: View) {
  const all = PARTS[product];
  if (!view) return all;
  if (view === "sleeves") return all.filter((x) => isSleeveZone(x.id));
  return all.filter((x) => x.view === view);
}

export function partById(product: ProductId, id: string) {
  const normalized = id === "sleeve" ? "sleeve_left" : id;
  return PARTS[product].find((x) => x.id === normalized) ?? PARTS[product][0];
}

export function zoneCenter(part: PartDef) {
  return {
    x: part.left + part.width / 2,
    y: part.top + part.height / 2,
  };
}

/** Layers shown on the current studio / preview view */
export function layerVisibleOnView(product: ProductId, placement: string, view: View) {
  const part = partById(product, placement);
  if (view === "sleeves") return isSleeveZone(part.id);
  if (view === "front") {
    // Full front includes sleeve marks so the whole look is visible
    return part.view === "front" || part.view === "sleeves";
  }
  return part.view === view;
}

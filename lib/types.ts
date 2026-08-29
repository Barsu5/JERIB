export type ProductId = "tshirt" | "hoodie" | "sweatshirt" | "cap" | "pants";
export type View = "front" | "back" | "sleeves";
export type Placement = string;
export type LayerKind = "text" | "image" | "logo" | "pattern" | "symbol" | "drawing";

export type ColorOption = {
  id: string;
  name: string;
  hex: string;
};

export type PartDef = {
  id: string;
  label: string;
  view: View;
  colorKey: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

export type Product = {
  id: ProductId;
  name: string;
  blurb: string;
  price: number;
  placements: PartDef[];
};

export type DesignLayer = {
  id: string;
  kind: LayerKind;
  placement: Placement;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  content: string;
  color: string;
};

export type CartItem = {
  id: string;
  productId: ProductId;
  colorId: string;
  partColors: Record<string, string>;
  size: string;
  layers: DesignLayer[];
  qty: number;
  createdAt: number;
};

export type Order = {
  id: string;
  name: string;
  email: string;
  address: string;
  items: CartItem[];
  total: number;
  createdAt: number;
  stage: "custom" | "produce" | "deliver";
};

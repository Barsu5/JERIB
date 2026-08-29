"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, DesignLayer, LayerKind, Order, Placement, ProductId, View } from "./types";
import { COLORS } from "./catalog";
import { COLOR_KEYS, PARTS, isSleeveZone, partById, zoneCenter } from "./parts";
import type { PartDef } from "./types";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function defaultPartColors(productId: ProductId, colorId: string) {
  const hex = COLORS.find((c) => c.id === colorId)?.hex ?? "#141414";
  const next: Record<string, string> = {};
  for (const part of COLOR_KEYS[productId]) next[part.id] = hex;
  return next;
}

export type ZoneBox = { left: number; top: number; width: number; height: number };

function zoneKey(productId: ProductId, zoneId: string) {
  return `${productId}:${zoneId}`;
}

type StudioState = {
  productId: ProductId;
  colorId: string;
  partColors: Record<string, string>;
  selectedColorKey: string;
  size: string;
  view: View;
  placement: Placement;
  layers: DesignLayer[];
  selectedId: string | null;
  /** User-moved print zone grids (per product+zone) */
  zoneLayout: Record<string, ZoneBox>;
  setProduct: (id: ProductId) => void;
  setColor: (id: string) => void;
  paintPart: (hex: string) => void;
  paintAllParts: () => void;
  setSelectedColorKey: (id: string) => void;
  setSize: (size: string) => void;
  setView: (view: View) => void;
  setPlacement: (placement: Placement) => void;
  addLayer: (kind: LayerKind, content: string, color?: string) => void;
  updateLayer: (id: string, patch: Partial<DesignLayer>) => void;
  removeLayer: (id: string) => void;
  selectLayer: (id: string | null) => void;
  resetDesign: () => void;
  moveZone: (zoneId: string, box: ZoneBox, moveMarks?: boolean) => void;
  resetZoneLayout: () => void;
  resolvedZone: (zoneId: string) => PartDef;
};

const firstPlacement = (productId: ProductId, view: View): Placement => {
  if (view === "sleeves") {
    return PARTS[productId].find((p) => isSleeveZone(p.id))?.id ?? PARTS[productId][0].id;
  }
  return PARTS[productId].find((p) => p.view === view)?.id ?? PARTS[productId][0].id;
};

export const useStudio = create<StudioState>()((set, get) => ({
  productId: "tshirt",
  colorId: "black",
  partColors: defaultPartColors("tshirt", "black"),
  selectedColorKey: "torso",
  size: "M",
  view: "front",
  placement: "chest",
  layers: [],
  selectedId: null,
  zoneLayout: {},
  setProduct: (id) =>
    set({
      productId: id,
      view: "front",
      placement: firstPlacement(id, "front"),
      partColors: defaultPartColors(id, get().colorId),
      selectedColorKey: COLOR_KEYS[id][0].id,
      layers: [],
      selectedId: null,
    }),
  setColor: (id) => {
    set({
      colorId: id,
      partColors: defaultPartColors(get().productId, id),
    });
  },
  paintPart: (hex) => {
    const key = get().selectedColorKey;
    set({ partColors: { ...get().partColors, [key]: hex } });
  },
  paintAllParts: () => {
    const hex = get().partColors[get().selectedColorKey];
    if (!hex) return;
    const next: Record<string, string> = {};
    for (const part of COLOR_KEYS[get().productId]) next[part.id] = hex;
    set({ partColors: next });
  },
  setSelectedColorKey: (id) => set({ selectedColorKey: id }),
  setSize: (size) => set({ size }),
  setView: (view) => {
    const { productId } = get();
    set({ view, placement: firstPlacement(productId, view) });
  },
  setPlacement: (placement) => {
    const part = partById(get().productId, placement);
    const view: View = isSleeveZone(part.id) ? "sleeves" : part.view === "sleeves" ? "sleeves" : part.view;
    set({ placement: part.id, selectedColorKey: part.colorKey, view });
  },
  addLayer: (kind, content, color = "#f3eee6") => {
    const state = get();
    let placement = state.placement;
    if (state.view === "sleeves" || isSleeveZone(placement)) {
      if (!isSleeveZone(placement)) {
        placement = firstPlacement(state.productId, "sleeves");
      } else {
        placement = partById(state.productId, placement).id;
      }
    }
    const center = zoneCenter(get().resolvedZone(placement));
    const layer: DesignLayer = {
      id: uid(),
      kind,
      placement,
      x: center.x,
      y: center.y,
      scale: kind === "text" ? 1.15 : 1,
      rotation: 0,
      content,
      color,
    };
    set({
      layers: [...get().layers, layer],
      selectedId: layer.id,
      placement,
      view: isSleeveZone(placement) ? "sleeves" : state.view,
    });
  },
  updateLayer: (id, patch) =>
    set({
      layers: get().layers.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }),
  removeLayer: (id) =>
    set({
      layers: get().layers.filter((l) => l.id !== id),
      selectedId: get().selectedId === id ? null : get().selectedId,
    }),
  selectLayer: (id) => set({ selectedId: id }),
  resetDesign: () => set({ layers: [], selectedId: null }),

  resolvedZone: (zoneId) => {
    const { productId, zoneLayout } = get();
    const base = partById(productId, zoneId);
    const over = zoneLayout[zoneKey(productId, base.id)];
    if (!over) return base;
    return { ...base, ...over };
  },

  moveZone: (zoneId, box, moveMarks = true) => {
    const { productId, zoneLayout, layers } = get();
    const base = partById(productId, zoneId);
    const key = zoneKey(productId, base.id);
    const prev = zoneLayout[key] ?? {
      left: base.left,
      top: base.top,
      width: base.width,
      height: base.height,
    };
    const next: ZoneBox = {
      left: Math.min(100 - box.width, Math.max(0, box.left)),
      top: Math.min(100 - box.height, Math.max(0, box.top)),
      width: Math.min(80, Math.max(8, box.width)),
      height: Math.min(80, Math.max(8, box.height)),
    };
    const dl = next.left - prev.left;
    const dt = next.top - prev.top;
    set({
      zoneLayout: { ...zoneLayout, [key]: next },
      layers: moveMarks
        ? layers.map((l) =>
            l.placement === base.id || (base.id === "sleeve_left" && l.placement === "sleeve")
              ? { ...l, x: l.x + dl, y: l.y + dt }
              : l
          )
        : layers,
    });
  },

  resetZoneLayout: () => set({ zoneLayout: {} }),
}));

type ShopState = {
  cart: CartItem[];
  orders: Order[];
  addToCart: (item: Omit<CartItem, "id" | "createdAt">) => void;
  removeFromCart: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clearCart: () => void;
  placeOrder: (info: { name: string; email: string; address: string; total: number }) => string;
  advanceOrder: (id: string) => void;
};

export const useShop = create<ShopState>()(
  persist(
    (set, get) => ({
      cart: [],
      orders: [],
      addToCart: (item) =>
        set({
          cart: [...get().cart, { ...item, id: uid(), createdAt: Date.now() }],
        }),
      removeFromCart: (id) => set({ cart: get().cart.filter((i) => i.id !== id) }),
      setQty: (id, qty) =>
        set({
          cart: get().cart.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i)),
        }),
      clearCart: () => set({ cart: [] }),
      placeOrder: ({ name, email, address, total }) => {
        const id = `JR-${uid().toUpperCase()}`;
        const order: Order = {
          id,
          name,
          email,
          address,
          items: get().cart,
          total,
          createdAt: Date.now(),
          stage: "custom",
        };
        set({ orders: [order, ...get().orders], cart: [] });
        return id;
      },
      advanceOrder: (id) =>
        set({
          orders: get().orders.map((o) => {
            if (o.id !== id) return o;
            const next =
              o.stage === "custom" ? "produce" : o.stage === "produce" ? "deliver" : "deliver";
            return { ...o, stage: next };
          }),
        }),
    }),
    { name: "jerib-shop", skipHydration: true }
  )
);

import type { PartDef } from "@/lib/types";

export type AlignMode = "center" | "top" | "bottom" | "left" | "right";

/** Keep mark center inside the print zone */
export function clampToZone(
  x: number,
  y: number,
  zone: PartDef,
  margin = 3
): { x: number; y: number } {
  return {
    x: Math.min(zone.left + zone.width - margin, Math.max(zone.left + margin, x)),
    y: Math.min(zone.top + zone.height - margin, Math.max(zone.top + margin, y)),
  };
}

/** Snap to zone center / mid-edges when close */
export function snapInZone(
  x: number,
  y: number,
  zone: PartDef,
  threshold = 2.5
): { x: number; y: number; guideV: number | null; guideH: number | null } {
  const cx = zone.left + zone.width / 2;
  const cy = zone.top + zone.height / 2;
  const left = zone.left + zone.width * 0.25;
  const right = zone.left + zone.width * 0.75;
  const top = zone.top + zone.height * 0.25;
  const bottom = zone.top + zone.height * 0.75;

  let nx = x;
  let ny = y;
  let guideV: number | null = null;
  let guideH: number | null = null;

  for (const gx of [cx, left, right]) {
    if (Math.abs(x - gx) <= threshold) {
      nx = gx;
      guideV = gx;
      break;
    }
  }
  for (const gy of [cy, top, bottom]) {
    if (Math.abs(y - gy) <= threshold) {
      ny = gy;
      guideH = gy;
      break;
    }
  }

  return { x: nx, y: ny, guideV, guideH };
}

export function alignInZone(mode: AlignMode, zone: PartDef): { x: number; y: number } {
  const cx = zone.left + zone.width / 2;
  const cy = zone.top + zone.height / 2;
  const pad = 6;
  switch (mode) {
    case "center":
      return { x: cx, y: cy };
    case "top":
      return { x: cx, y: zone.top + pad };
    case "bottom":
      return { x: cx, y: zone.top + zone.height - pad };
    case "left":
      return { x: zone.left + pad, y: cy };
    case "right":
      return { x: zone.left + zone.width - pad, y: cy };
  }
}

/** Suggested scales so print fits the zone reasonably */
export function suggestedScales(zone: PartDef): { id: string; scale: number }[] {
  const area = zone.width * zone.height;
  const base = area > 900 ? 1.1 : area > 500 ? 0.95 : 0.75;
  return [
    { id: "S", scale: Math.round(base * 0.7 * 100) / 100 },
    { id: "M", scale: Math.round(base * 100) / 100 },
    { id: "L", scale: Math.round(base * 1.25 * 100) / 100 },
  ];
}

export function findNearestZone(x: number, y: number, zones: PartDef[]): PartDef | null {
  if (!zones.length) return null;
  let best = zones[0];
  let bestDist = Infinity;
  for (const z of zones) {
    const cx = z.left + z.width / 2;
    const cy = z.top + z.height / 2;
    const inside =
      x >= z.left && x <= z.left + z.width && y >= z.top && y <= z.top + z.height;
    const dist = inside ? 0 : Math.hypot(x - cx, y - cy);
    if (dist < bestDist) {
      bestDist = dist;
      best = z;
    }
  }
  return best;
}

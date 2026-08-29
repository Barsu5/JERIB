import type { CartItem, ProductId } from "@/lib/types";
import type { Partner } from "@/lib/dispatch/types";

/** Jerib service fee added on top of partner production price (сомони) */
export const SERVICE_FEE_SOM = 150;

export function formatPrice(n: number) {
  const v = Math.round(n * 100) / 100;
  return `${v} сом`;
}

/** What the client pays per unit for a product at this partner */
export function clientUnitPrice(partner: Partner, productId: ProductId) {
  const base = partner.productionPrices[productId];
  if (base == null) return null;
  return base + SERVICE_FEE_SOM;
}

export function partnerUnitPrice(partner: Partner, productId: ProductId) {
  return partner.productionPrices[productId] ?? null;
}

/** Cart / quote total: Σ(partner price × qty) + 150 × total qty */
export function clientTotalForPartner(partner: Partner, items: CartItem[]) {
  let production = 0;
  let units = 0;
  for (const item of items) {
    const unit = partner.productionPrices[item.productId];
    if (unit == null) return null;
    production += unit * item.qty;
    units += item.qty;
  }
  const service = SERVICE_FEE_SOM * units;
  return {
    production,
    service,
    total: production + service,
    units,
  };
}

/** Lowest client-facing unit price among approved accepting partners */
export function minClientUnitPrice(
  partners: Partner[],
  productId: ProductId
): number | null {
  let min: number | null = null;
  for (const p of partners) {
    if (p.approval !== "approved" || !p.acceptingOrders) continue;
    const c = clientUnitPrice(p, productId);
    if (c == null) continue;
    if (min == null || c < min) min = c;
  }
  return min;
}

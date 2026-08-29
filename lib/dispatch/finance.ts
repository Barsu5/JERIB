import type { CartItem, ProductId } from "@/lib/types";
import { SERVICE_FEE_SOM } from "@/lib/pricing";
import type { OrderFinance, Partner, PlatformSettings } from "./types";

export function productionCostFor(partner: Partner, items: CartItem[]) {
  return items.reduce((sum, item) => {
    const unit = partner.productionPrices[item.productId as ProductId] ?? 0;
    return sum + unit * item.qty;
  }, 0);
}

/**
 * Client pays partner production + 150 сом service per unit.
 * Jerib revenue ≈ service fees − payment fee − delivery − other.
 */
export function calcFinance(
  clientTotal: number,
  partner: Partner,
  items: CartItem[],
  settings: PlatformSettings
): OrderFinance {
  const productionCost = productionCostFor(partner, items);
  const units = items.reduce((n, i) => n + i.qty, 0);
  const serviceFees = SERVICE_FEE_SOM * units;
  const deliveryCost = settings.defaultDeliveryCost;
  const paymentFee = Math.round(clientTotal * settings.paymentFeeRate * 100) / 100;
  const otherCost = settings.otherCostFlat;
  const jeribRevenue =
    Math.round((serviceFees - deliveryCost - paymentFee - otherCost) * 100) / 100;
  const partnerPayout = productionCost;

  return {
    clientTotal,
    productionCost,
    deliveryCost,
    paymentFee,
    otherCost,
    jeribRevenue,
    partnerPayout,
    payoutStatus: "pending",
    paidAt: null,
  };
}

import type { DispatchOrder, PartnerOrderStatus } from "./types";
import { isPartnerDispatchEnabled } from "./config";

function pushStatus(order: DispatchOrder, status: PartnerOrderStatus, at = Date.now()): DispatchOrder {
  const history = order.statusHistory ?? [];
  const last = history[history.length - 1];
  if (last?.status === status) return { ...order, status };
  return {
    ...order,
    status,
    statusHistory: [...history, { status, at }],
  };
}

/** After payment is confirmed — mark order for manual JIRIB handling. */
export function activateManualOrder(order: DispatchOrder, now = Date.now()): DispatchOrder {
  return pushStatus(
    {
      ...order,
      partnerId: null,
      offerExpiresAt: null,
      adminAlert: false,
      clientAlert: false,
    },
    "accepted",
    now
  );
}

export function finalizeOrderAfterPaymentConfirm(order: DispatchOrder, now = Date.now()) {
  if (isPartnerDispatchEnabled()) return order;
  return activateManualOrder(order, now);
}

import type { DispatchOrder } from "@/lib/dispatch/types";
import type { OrderPayment } from "./types";

export function createInitialPayment(orderId: string, amount: number): OrderPayment {
  return {
    method: null,
    status: "awaiting_payment",
    amount,
    currency: "TJS",
    referenceCode: orderId,
    receiptDataUrl: null,
    receiptSubmittedAt: null,
    confirmedAt: null,
    rejectionReason: null,
  };
}

/** Legacy orders without payment field are treated as already paid. */
export function isPaymentConfirmed(order: DispatchOrder) {
  return !order.payment || order.payment.status === "confirmed";
}

export function needsClientPayment(order: DispatchOrder) {
  return (
    !!order.payment &&
    (order.payment.status === "awaiting_payment" ||
      order.payment.status === "receipt_submitted" ||
      order.payment.status === "rejected")
  );
}

export function canDispatchOrder(order: DispatchOrder) {
  return isPaymentConfirmed(order);
}

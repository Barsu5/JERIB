import type { DispatchOrder } from "@/lib/dispatch/types";
import type { PaymentBankId } from "./types";

const MAX_RECEIPT_BYTES = 2 * 1024 * 1024;

export function applySelectPaymentBank(order: DispatchOrder, method: PaymentBankId) {
  if (!order.payment || order.payment.status === "confirmed") return null;
  if (order.payment.status === "receipt_submitted") return null;
  return {
    ...order,
    payment: { ...order.payment, method, rejectionReason: null },
  };
}

export function applySubmitPaymentReceipt(order: DispatchOrder, receiptDataUrl: string) {
  if (!order.payment) return null;
  if (order.payment.status !== "awaiting_payment" && order.payment.status !== "rejected") {
    return null;
  }
  if (!order.payment.method) return null;
  if (!receiptDataUrl.startsWith("data:image/")) return null;
  const approxBytes = Math.ceil((receiptDataUrl.length * 3) / 4);
  if (approxBytes > MAX_RECEIPT_BYTES) return null;

  return {
    ...order,
    adminAlert: true,
    payment: {
      ...order.payment,
      status: "receipt_submitted" as const,
      receiptDataUrl,
      receiptSubmittedAt: Date.now(),
      rejectionReason: null,
    },
  };
}

export function applyConfirmPayment(order: DispatchOrder) {
  if (!order.payment || order.payment.status !== "receipt_submitted") return null;
  return {
    ...order,
    adminAlert: false,
    payment: {
      ...order.payment,
      status: "confirmed" as const,
      confirmedAt: Date.now(),
      rejectionReason: null,
    },
  };
}

export function applyRejectPayment(order: DispatchOrder, reason?: string) {
  if (!order.payment || order.payment.status !== "receipt_submitted") return null;
  return {
    ...order,
    adminAlert: false,
    clientAlert: true,
    payment: {
      ...order.payment,
      status: "rejected" as const,
      rejectionReason: reason?.trim() || null,
      receiptDataUrl: null,
      receiptSubmittedAt: null,
    },
  };
}

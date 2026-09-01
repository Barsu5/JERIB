import type { DispatchOrder } from "@/lib/dispatch/types";
import type { PaymentBankId } from "@/lib/payment/types";
import { canDispatchOrder } from "@/lib/payment/helpers";
import { isPartnerDispatchEnabled } from "@/lib/dispatch/config";
import { finalizeOrderAfterPaymentConfirm } from "@/lib/dispatch/manual";
import {
  applyConfirmPayment,
  applyRejectPayment,
  applySelectPaymentBank,
  applySubmitPaymentReceipt,
} from "@/lib/payment/actions";
import { tryAssign } from "@/lib/server/dispatch";
import { prisma } from "@/lib/prisma";
import { toOrder, toSettings } from "@/lib/server/mappers";
import { loadPartners, saveOrder } from "@/lib/server/orders";

async function loadOrderById(id: string) {
  const row = await prisma.order.findUnique({ where: { id } });
  return row ? toOrder(row) : null;
}

async function loadSettings() {
  const row = await prisma.platformSettings.findUnique({ where: { id: 1 } });
  return row ? toSettings(row) : null;
}

export function selectPaymentBank(order: DispatchOrder, method: PaymentBankId) {
  return applySelectPaymentBank(order, method);
}

export function submitPaymentReceipt(order: DispatchOrder, receiptDataUrl: string) {
  return applySubmitPaymentReceipt(order, receiptDataUrl);
}

export async function confirmPaymentAndDispatch(orderId: string) {
  const [order, partners, settings] = await Promise.all([
    loadOrderById(orderId),
    loadPartners(),
    loadSettings(),
  ]);
  if (!order || !settings) return null;
  const confirmed = applyConfirmPayment(order);
  if (!confirmed) return null;

  let next = confirmed;
  if (isPartnerDispatchEnabled()) {
    if (next.status === "searching" && !next.partnerId && canDispatchOrder(next)) {
      next = tryAssign(next, partners, settings, Date.now());
    }
  } else {
    next = finalizeOrderAfterPaymentConfirm(next);
  }

  await saveOrder(next);
  return next;
}

export function rejectPayment(order: DispatchOrder, reason?: string) {
  return applyRejectPayment(order, reason);
}

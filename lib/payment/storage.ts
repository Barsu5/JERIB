import type { OrderPayment } from "./types";

const PAYMENT_PREFIX = "@@JIRIB_PAYMENT@@";

export function stripPaymentFromNotes(notes: string) {
  if (!notes.startsWith(PAYMENT_PREFIX)) return notes;
  const end = notes.indexOf("\n");
  return end === -1 ? "" : notes.slice(end + 1);
}

export function encodePaymentInNotes(payment: OrderPayment | null, notes: string) {
  const userNotes = stripPaymentFromNotes(notes);
  if (!payment) return userNotes;
  const payload = `${PAYMENT_PREFIX}${JSON.stringify(payment)}`;
  return userNotes ? `${payload}\n${userNotes}` : payload;
}

export function decodePaymentFromNotes(notes: string): {
  payment: OrderPayment | null;
  notes: string;
} {
  if (!notes.startsWith(PAYMENT_PREFIX)) {
    return { payment: null, notes };
  }
  const end = notes.indexOf("\n");
  const json = end === -1 ? notes.slice(PAYMENT_PREFIX.length) : notes.slice(PAYMENT_PREFIX.length, end);
  const rest = end === -1 ? "" : notes.slice(end + 1);
  try {
    return { payment: JSON.parse(json) as OrderPayment, notes: rest };
  } catch {
    return { payment: null, notes };
  }
}

export function paymentFromOrderRow(row: { notes: string; payment?: unknown }): OrderPayment | null {
  if (row.payment && typeof row.payment === "object") {
    return row.payment as OrderPayment;
  }
  return decodePaymentFromNotes(row.notes).payment;
}

export function notesForOrderRow(order: { notes: string; payment: OrderPayment | null }) {
  return encodePaymentInNotes(order.payment, order.notes);
}

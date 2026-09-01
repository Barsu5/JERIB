export type PaymentBankId = "alif" | "dushanbe_city";

export type ClientPaymentStatus =
  | "awaiting_payment"
  | "receipt_submitted"
  | "confirmed"
  | "rejected";

export type OrderPayment = {
  method: PaymentBankId | null;
  status: ClientPaymentStatus;
  amount: number;
  currency: "TJS";
  /** Payment reference — order id */
  referenceCode: string;
  receiptDataUrl?: string | null;
  receiptSubmittedAt?: number | null;
  confirmedAt?: number | null;
  rejectionReason?: string | null;
};

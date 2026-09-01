import type { Lang } from "@/lib/i18n";
import type { ClientPaymentStatus } from "./types";

const PAYMENT_STATUS_LABELS: Record<ClientPaymentStatus, Record<Lang, string>> = {
  awaiting_payment: {
    en: "Awaiting payment",
    ru: "Ожидает оплаты",
    tg: "Интизори пардохт",
  },
  receipt_submitted: {
    en: "Receipt under review",
    ru: "Чек на проверке",
    tg: "Чек дар санҷиш",
  },
  confirmed: {
    en: "Payment confirmed",
    ru: "Оплата подтверждена",
    tg: "Пардохт тасдиқ шуд",
  },
  rejected: {
    en: "Payment rejected",
    ru: "Оплата отклонена",
    tg: "Пардохт рад шуд",
  },
};

export function paymentStatusLabel(status: ClientPaymentStatus, lang: Lang) {
  return PAYMENT_STATUS_LABELS[status][lang] ?? PAYMENT_STATUS_LABELS[status].en;
}

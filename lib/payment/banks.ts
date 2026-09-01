import type { Lang } from "@/lib/i18n";
import type { PaymentBankId } from "./types";

export type BankRequisites = {
  id: PaymentBankId;
  name: Record<Lang, string>;
  accountName: string;
  accountNumber: string;
  cardNumber: string;
};

function envOr(key: string, fallback: string) {
  if (typeof process !== "undefined" && process.env[key]?.trim()) {
    return process.env[key]!.trim();
  }
  return fallback;
}

/** Update via .env or edit defaults below — shown to clients at checkout. */
export const PAYMENT_BANKS: BankRequisites[] = [
  {
    id: "alif",
    name: {
      en: "Alif Bank",
      ru: "Алиф банк",
      tg: "Бонки Алиф",
    },
    accountName: envOr("NEXT_PUBLIC_JIRIB_ALIF_ACCOUNT_NAME", "JIRIB"),
    accountNumber: envOr("NEXT_PUBLIC_JIRIB_ALIF_ACCOUNT", "0000000000000000"),
    cardNumber: envOr("NEXT_PUBLIC_JIRIB_ALIF_CARD", "0000 0000 0000 0000"),
  },
  {
    id: "dushanbe_city",
    name: {
      en: "Dushanbe City Bank",
      ru: "Душанбе Сити банк",
      tg: "Бонки «Душанбе Сити»",
    },
    accountName: envOr("NEXT_PUBLIC_JIRIB_DCB_ACCOUNT_NAME", "JIRIB"),
    accountNumber: envOr("NEXT_PUBLIC_JIRIB_DCB_ACCOUNT", "0000000000000000"),
    cardNumber: envOr("NEXT_PUBLIC_JIRIB_DCB_CARD", "0000 0000 0000 0000"),
  },
];

export function bankById(id: PaymentBankId | null | undefined) {
  if (!id) return null;
  return PAYMENT_BANKS.find((b) => b.id === id) ?? null;
}

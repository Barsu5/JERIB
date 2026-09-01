"use client";

import { useRef, useState } from "react";
import { formatPrice } from "@/lib/catalog";
import { PAYMENT_BANKS, bankById } from "@/lib/payment/banks";
import type { DispatchOrder } from "@/lib/dispatch/types";
import type { PaymentBankId } from "@/lib/payment/types";
import { isPartnerDispatchEnabled } from "@/lib/dispatch/config";
import { useDispatch } from "@/lib/dispatch/store";
import { useLang, useT } from "@/lib/i18n";

type Props = {
  order: DispatchOrder;
  readOnly?: boolean;
};

export function OrderPaymentPanel({ order, readOnly = false }: Props) {
  const t = useT();
  const lang = useLang((s) => s.lang);
  const fileRef = useRef<HTMLInputElement>(null);
  const selectBank = useDispatch((s) => s.selectPaymentBank);
  const submitReceipt = useDispatch((s) => s.submitPaymentReceipt);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pendingReceipt, setPendingReceipt] = useState<string | null>(null);

  const payment = order.payment;
  if (!payment) return null;

  const selectedBank = bankById(payment.method);
  const canPay =
    !readOnly &&
    (payment.status === "awaiting_payment" || payment.status === "rejected");
  const receiptPending = payment.status === "receipt_submitted";
  const paid = payment.status === "confirmed";
  const manualMode = !isPartnerDispatchEnabled();
  const receiptPreview = pendingReceipt ?? payment.receiptDataUrl ?? null;

  const onSelectBank = async (method: PaymentBankId) => {
    setError("");
    setBusy(true);
    try {
      await selectBank(order.id, method);
    } finally {
      setBusy(false);
    }
  };

  const onFile = async (file: File | null) => {
    if (!file || !payment.method) return;
    if (!file.type.startsWith("image/")) {
      setError(t("paymentReceiptImageOnly"));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError(t("paymentReceiptTooLarge"));
      return;
    }
    setError("");
    setBusy(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setPendingReceipt(dataUrl);
    } catch {
      setError(t("paymentReceiptUploadFailed"));
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onConfirmPayment = async () => {
    if (!pendingReceipt || !payment.method) {
      setError(t("paymentReceiptRequired"));
      return;
    }
    setError("");
    setBusy(true);
    try {
      await submitReceipt(order.id, pendingReceipt);
      setPendingReceipt(null);
    } catch {
      setError(t("paymentReceiptUploadFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-14 border border-white/15 p-6">
      <h2 className="font-display text-3xl">{t("paymentTitle")}</h2>
      <p className="mt-3 text-sm text-mist">{t("paymentBody")}</p>
      <p className="mt-4 font-display text-4xl text-clay">{formatPrice(payment.amount)}</p>
      <p className="mt-2 text-xs text-mist">
        {t("paymentReference")}: <span className="text-paper">{payment.referenceCode}</span>
      </p>

      {paid && (
        <p className="mt-6 border border-clay/40 bg-clay/10 px-4 py-3 text-sm text-paper">
          {t(manualMode ? "paymentConfirmedManual" : "paymentConfirmed")}
        </p>
      )}

      {receiptPending && (
        <p className="mt-6 border border-white/20 bg-white/5 px-4 py-3 text-sm">
          {t("paymentReceiptPending")}
        </p>
      )}

      {payment.status === "rejected" && (
        <p className="mt-6 border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm">
          {payment.rejectionReason || t("paymentRejected")}
        </p>
      )}

      {canPay && (
        <>
          <p className="mt-8 text-[10px] uppercase tracking-[0.22em] text-mist">
            {t("paymentSelectBank")}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {PAYMENT_BANKS.map((bank) => {
              const active = payment.method === bank.id;
              return (
                <button
                  key={bank.id}
                  type="button"
                  disabled={busy}
                  onClick={() => onSelectBank(bank.id)}
                  className={`border px-4 py-4 text-left text-sm transition ${
                    active
                      ? "border-clay bg-clay/10 text-paper"
                      : "border-white/15 hover:border-clay"
                  }`}
                >
                  <span className="font-display text-xl">{bank.name[lang]}</span>
                </button>
              );
            })}
          </div>

          {selectedBank && (
            <div className="mt-8 space-y-3 border border-white/10 bg-[#12100e] p-5 text-sm">
              <p className="text-[10px] uppercase tracking-[0.22em] text-clay">
                {t("paymentRequisites")}
              </p>
              <p>
                <span className="text-mist">{t("paymentRecipient")}: </span>
                {selectedBank.accountName}
              </p>
              <p>
                <span className="text-mist">{t("paymentAccount")}: </span>
                {selectedBank.accountNumber}
              </p>
              <p>
                <span className="text-mist">{t("paymentCard")}: </span>
                {selectedBank.cardNumber}
              </p>
              <p className="text-xs text-mist">{t("paymentTransferHint")}</p>
            </div>
          )}

          {payment.method && (
            <>
              <div className="mt-8">
                <p className="text-[10px] uppercase tracking-[0.22em] text-mist">
                  {t("paymentUploadReceipt")}
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  disabled={busy}
                  className="mt-3 block w-full text-sm text-mist file:mr-4 file:border-0 file:bg-paper file:px-4 file:py-2 file:text-[10px] file:uppercase file:tracking-widest file:text-ink"
                  onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                />
                <p className="mt-2 text-xs text-mist">{t("paymentReceiptHint")}</p>
              </div>

              {receiptPreview && (
                <div className="mt-8">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-mist">
                    {t("paymentReceipt")}
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={receiptPreview}
                    alt={t("paymentReceipt")}
                    className="mt-3 max-h-80 border border-white/15 object-contain"
                  />
                  {pendingReceipt && (
                    <p className="mt-3 text-xs text-clay">{t("paymentReceiptReady")}</p>
                  )}
                </div>
              )}

              <button
                type="button"
                disabled={busy || !pendingReceipt}
                onClick={onConfirmPayment}
                className="mt-8 bg-paper px-8 py-3 text-[11px] uppercase tracking-[0.22em] text-ink hover:bg-clay hover:text-paper disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy ? t("loading") : t("paymentClientConfirm")}
              </button>
              {!pendingReceipt && (
                <p className="mt-2 text-xs text-mist">{t("paymentConfirmAfterReceipt")}</p>
              )}
            </>
          )}
        </>
      )}

      {receiptPending && payment.receiptDataUrl && (
        <div className="mt-8">
          <p className="text-[10px] uppercase tracking-[0.22em] text-mist">{t("paymentReceipt")}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={payment.receiptDataUrl}
            alt={t("paymentReceipt")}
            className="mt-3 max-h-80 border border-white/15 object-contain"
          />
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </section>
  );
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

"use client";

import { FinalPreview } from "@/components/FinalPreview";
import { colorById, formatPrice } from "@/lib/catalog";
import { cityLabel } from "@/lib/dispatch/cities";
import { statusLabel } from "@/lib/dispatch/store";
import type { DispatchOrder } from "@/lib/dispatch/types";
import { useLang, useT, type DictKey } from "@/lib/i18n";

export function PartnerOrderCard({
  order,
  onAccept,
  onReject,
  onAdvance,
}: {
  order: DispatchOrder;
  onAccept: () => void;
  onReject: () => void;
  onAdvance: () => void;
}) {
  const t = useT();
  const lang = useLang((s) => s.lang);
  const first = order.items[0];
  const canAdvance =
    order.status !== "offered" &&
    order.status !== "delivered" &&
    order.status !== "failed_no_partner" &&
    order.status !== "searching";

  return (
    <article className="border border-white/10 bg-[#12100e] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-mist">{order.id}</p>
          <p className="mt-2 font-display text-3xl">{statusLabel(order.status, lang)}</p>
          <p className="mt-2 text-sm text-mist">
            {order.name} · {order.email}
          </p>
          <p className="mt-1 text-sm text-mist">
            {cityLabel(order.cityId, lang)} · {order.address}
          </p>
        </div>
        <p className="font-display text-3xl">{formatPrice(order.total)}</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[160px_1fr]">
        {first && (
          <div className="h-40 bg-[#1a1714]">
            <FinalPreview
              design={{
                productId: first.productId,
                colorHex: colorById(first.colorId).hex,
                layers: first.layers,
                size: first.size,
              }}
              view="front"
            />
          </div>
        )}
        <div className="space-y-2 text-sm">
          {order.items.map((item) => (
            <div key={item.id} className="border border-white/10 px-3 py-3">
              <p>
                {t(`product_${item.productId}` as DictKey)} · {item.size} ·{" "}
                {t(`color_${item.colorId}` as DictKey)} · ×{item.qty}
              </p>
              <p className="mt-1 text-mist">
                {t("printMethod")}: {order.printMethod.toUpperCase()} · {t("placements")}:{" "}
                {[...new Set(item.layers.map((l) => l.placement))].join(", ") || "—"}
              </p>
              <p className="mt-1 text-mist">
                {t("deadline")}: {new Date(order.deadlineAt).toLocaleString()}
              </p>
              <p className="mt-1 text-[11px] text-clay">{t("designLocked")}</p>
            </div>
          ))}
          {order.finance && (
            <p className="text-mist">
              {t("yourPayout")}: {formatPrice(order.finance.partnerPayout)} ·{" "}
              {order.finance.payoutStatus === "paid" ? t("paid") : t("payoutPending")}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {order.status === "offered" && (
          <>
            <button
              type="button"
              onClick={onAccept}
              className="bg-paper px-5 py-3 text-[11px] uppercase tracking-[0.22em] text-ink hover:bg-clay hover:text-paper"
            >
              {t("acceptOrder")}
            </button>
            <button
              type="button"
              onClick={onReject}
              className="border border-white/20 px-5 py-3 text-[11px] uppercase tracking-[0.22em] hover:border-clay"
            >
              {t("rejectOrder")}
            </button>
            {order.offerExpiresAt && (
              <span className="self-center text-xs text-mist">
                {t("offerExpires")}: {new Date(order.offerExpiresAt).toLocaleTimeString()}
              </span>
            )}
          </>
        )}
        {canAdvance && (
          <button
            type="button"
            onClick={onAdvance}
            className="border border-clay px-5 py-3 text-[11px] uppercase tracking-[0.22em] text-clay hover:bg-clay hover:text-paper"
          >
            {t("advanceStatus")}
          </button>
        )}
      </div>
    </article>
  );
}

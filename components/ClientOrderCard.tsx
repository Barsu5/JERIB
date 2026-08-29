"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/catalog";
import { locationLabel } from "@/lib/dispatch/cities";
import { statusLabel } from "@/lib/dispatch/store";
import type { DispatchOrder, PartnerOrderStatus } from "@/lib/dispatch/types";
import { useLang, useT, type DictKey } from "@/lib/i18n";

export const CLIENT_PIPELINE: PartnerOrderStatus[] = [
  "offered",
  "accepted",
  "in_production",
  "quality_check",
  "ready",
  "packed",
  "with_courier",
  "delivered",
];

export function isActiveOrder(status: PartnerOrderStatus) {
  return status !== "delivered" && status !== "failed_no_partner";
}

export function orderStepIndex(status: PartnerOrderStatus) {
  if (status === "searching") return 0;
  if (status === "failed_no_partner") return -1;
  const i = CLIENT_PIPELINE.indexOf(status);
  return i < 0 ? 0 : i;
}

function ensureHistory(order: DispatchOrder) {
  if (order.statusHistory?.length) return order.statusHistory;
  return [{ status: order.status, at: order.createdAt }];
}

export function ClientOrderCard({ order }: { order: DispatchOrder }) {
  const t = useT();
  const lang = useLang((s) => s.lang);
  const step = orderStepIndex(order.status);
  const history = ensureHistory(order);
  const products = [...new Set(order.items.map((i) => i.productId))]
    .map((id) => t(`product_${id}` as DictKey))
    .join(", ");

  return (
    <article className="border border-white/10 bg-[#12100e] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-mist">{order.id}</p>
          <p className="mt-2 font-display text-3xl text-clay">{statusLabel(order.status, lang)}</p>
          <p className="mt-2 text-sm text-mist">
            {products} · {locationLabel(order.cityId, lang)}
          </p>
          <p className="mt-1 text-xs text-mist">
            {t("orderedAt")}: {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <p className="font-display text-2xl">{formatPrice(order.total)}</p>
      </div>

      {order.status !== "failed_no_partner" && (
        <div className="mt-5">
          <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-mist">{t("orderProgress")}</p>
          <div className="flex gap-1">
            {CLIENT_PIPELINE.map((s, i) => (
              <div
                key={s}
                title={statusLabel(s, lang)}
                className={`h-1.5 flex-1 ${i <= step ? "bg-clay" : "bg-white/10"}`}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-mist">
            {step + 1} / {CLIENT_PIPELINE.length} · {statusLabel(order.status, lang)}
          </p>
        </div>
      )}

      <div className="mt-5 border-t border-white/10 pt-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-mist">{t("statusHistory")}</p>
        <ol className="mt-3 space-y-2">
          {[...history].reverse().slice(0, 4).map((ev, idx) => (
            <li key={`${ev.status}-${ev.at}-${idx}`} className="flex justify-between gap-4 text-sm">
              <span className={idx === 0 ? "text-paper" : "text-mist"}>
                {statusLabel(ev.status, lang)}
              </span>
              <span className="shrink-0 text-xs text-mist">
                {new Date(ev.at).toLocaleString()}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <Link
        href={`/order/${order.id}`}
        className="mt-5 inline-block text-[11px] uppercase tracking-[0.22em] text-clay hover:underline"
      >
        {t("viewOrderDetails")}
      </Link>
    </article>
  );
}

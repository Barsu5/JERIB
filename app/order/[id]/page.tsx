"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { CLIENT_PIPELINE, orderStepIndex } from "@/components/ClientOrderCard";
import { FinalPreview } from "@/components/FinalPreview";
import { useSessionUser } from "@/lib/auth/store";
import { colorById, formatPrice } from "@/lib/catalog";
import { cityLabel } from "@/lib/dispatch/cities";
import { partnerById, statusLabel, useDispatch } from "@/lib/dispatch/store";
import { useDispatchTick } from "@/lib/dispatch/useDispatchTick";
import { useLang, useT, type DictKey } from "@/lib/i18n";
import { SERVICE_FEE_SOM, clientUnitPrice, partnerUnitPrice } from "@/lib/pricing";

export default function OrderPage() {
  const t = useT();
  const lang = useLang((s) => s.lang);
  const params = useParams<{ id: string }>();
  const user = useSessionUser();
  useDispatchTick();
  const order = useDispatch((s) => s.orders.find((o) => o.id === params.id));
  const partners = useDispatch((s) => s.partners);
  const partner = partnerById(partners, order?.partnerId ?? null);

  if (!order) {
    return (
      <main className="px-6 pt-40">
        <p className="text-mist">{t("orderNotFound")}</p>
        <Link href={user?.role === "client" ? "/account" : "/"} className="mt-4 inline-block text-clay">
          {user?.role === "client" ? t("backToOrders") : t("home")}
        </Link>
      </main>
    );
  }

  const stepIndex = orderStepIndex(order.status);
  const first = order.items[0];
  const history = order.statusHistory?.length
    ? order.statusHistory
    : [{ status: order.status, at: order.createdAt }];

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 pb-24 pt-32">
      <Link
        href="/account"
        className="text-[10px] uppercase tracking-[0.24em] text-mist hover:text-clay"
      >
        ← {t("backToOrders")}
      </Link>

      <p className="mt-6 text-[10px] uppercase tracking-[0.32em] text-mist">{order.id}</p>
      <h1 className="mt-3 font-display text-5xl md:text-6xl">{statusLabel(order.status, lang)}</h1>
      <p className="mt-4 text-sm text-mist">
        {order.name} · {cityLabel(order.cityId, lang)}
      </p>
      <p className="mt-1 text-xs text-mist">
        {t("orderedAt")}: {new Date(order.createdAt).toLocaleString()}
      </p>

      {order.clientAlert && (
        <div className="mt-6 border border-clay/40 bg-clay/10 px-4 py-3 text-sm">
          {t("clientNoPartner")}
        </div>
      )}

      <p className="mt-6 text-sm text-mist">
        {t("jeribHandlesPartner")}
        {partner && order.status !== "failed_no_partner" && order.status !== "searching" && (
          <>
            {" "}
            · {t("localPartnerIn")} {cityLabel(partner.cityId, lang)}
          </>
        )}
      </p>

      {first && (
        <div className="mx-auto mt-10 h-[380px] max-w-sm">
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

      {order.status !== "failed_no_partner" && (
        <section className="mt-14">
          <h2 className="font-display text-3xl">{t("orderProgress")}</h2>
          <ol className="mt-6 space-y-2">
            {CLIENT_PIPELINE.map((s, i) => {
              const done = i <= stepIndex;
              const current = i === stepIndex;
              return (
                <li
                  key={s}
                  className={`flex items-center gap-4 border px-4 py-3 text-sm ${
                    current
                      ? "border-clay text-paper"
                      : done
                        ? "border-white/20 text-paper"
                        : "border-white/10 text-mist"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center text-[10px] ${
                      done ? "bg-clay text-paper" : "border border-white/20"
                    }`}
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  <span className="font-display text-xl">{statusLabel(s, lang)}</span>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <section className="mt-14">
        <h2 className="font-display text-3xl">{t("statusHistory")}</h2>
        <ol className="mt-6 space-y-0 border-l border-white/15 pl-6">
          {[...history].reverse().map((ev, idx) => (
            <li key={`${ev.status}-${ev.at}-${idx}`} className="relative pb-6 last:pb-0">
              <span
                className={`absolute -left-[1.64rem] top-1 h-3 w-3 rounded-full ${
                  idx === 0 ? "bg-clay" : "bg-white/30"
                }`}
              />
              <p className={`font-display text-2xl ${idx === 0 ? "text-paper" : "text-mist"}`}>
                {statusLabel(ev.status, lang)}
              </p>
              <p className="mt-1 text-xs text-mist">{new Date(ev.at).toLocaleString()}</p>
            </li>
          ))}
        </ol>
      </section>

      <ul className="mt-12 space-y-3 text-sm text-mist">
        {order.items.map((i) => {
          const pUnit = partner ? partnerUnitPrice(partner, i.productId) : null;
          const cUnit = partner ? clientUnitPrice(partner, i.productId) : null;
          return (
            <li key={i.id}>
              {t(`product_${i.productId}` as DictKey)} · {i.size} · ×{i.qty}
              {cUnit != null && <> · {formatPrice(cUnit * i.qty)}</>}
              {pUnit != null && (
                <span className="block text-xs">
                  {t("priceBreakdown")
                    .replace("{partner}", formatPrice(pUnit))
                    .replace("{fee}", formatPrice(SERVICE_FEE_SOM))
                    .replace("{client}", formatPrice(pUnit + SERVICE_FEE_SOM))}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-8 font-display text-4xl">{formatPrice(order.total)}</p>
      <p className="mt-2 text-xs text-mist">{order.address}</p>
    </main>
  );
}

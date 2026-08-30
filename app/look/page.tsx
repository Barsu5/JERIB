"use client";

import { useState } from "react";
import Link from "next/link";
import { FinalPreview, useDownloadDesign } from "@/components/FinalPreview";
import { colorById, formatPrice, productById } from "@/lib/catalog";
import type { LookDesign } from "@/lib/designTexture";
import { useDispatch } from "@/lib/dispatch/store";
import { useT, type DictKey } from "@/lib/i18n";
import { SERVICE_FEE_SOM, minClientUnitPrice } from "@/lib/pricing";
import { isSleeveZone, PARTS } from "@/lib/parts";
import { useShop, useStudio } from "@/lib/store";
import type { View } from "@/lib/types";

export default function LookPage() {
  const t = useT();
  const partners = useDispatch((s) => s.partners);
  const [view, setView] = useState<View>("front");
  const productId = useStudio((s) => s.productId);
  const colorId = useStudio((s) => s.colorId);
  const layers = useStudio((s) => s.layers);
  const size = useStudio((s) => s.size);
  const last = useShop((s) => s.cart[s.cart.length - 1]);

  const design: LookDesign = last
    ? {
        productId: last.productId,
        colorHex: colorById(last.colorId).hex,
        partColors: last.partColors,
        layers: last.layers,
        size: last.size,
      }
    : {
        productId,
        colorHex: colorById(colorId).hex,
        partColors: useStudio.getState().partColors,
        layers,
        size,
      };

  const product = productById(design.productId);
  const { download, busy } = useDownloadDesign(design);
  const shownColorId = last?.colorId ?? colorId;
  const hasSleeves = PARTS[design.productId].some((z) => isSleeveZone(z.id));

  return (
    <main className="grid min-h-screen pt-16 lg:grid-cols-[1fr_320px]">
      <section className="flex min-h-[70vh] flex-col items-center justify-center bg-[#1a1714] px-6 py-10 lg:min-h-[calc(100vh-4rem)]">
        <div className="mb-6 flex flex-wrap items-center justify-center gap-4 text-[11px] uppercase tracking-[0.22em] sm:gap-6">
          <button
            type="button"
            onClick={() => setView("front")}
            className={view === "front" ? "text-clay" : "text-mist hover:text-paper"}
          >
            {t("front")}
          </button>
          {hasSleeves && (
            <>
              <span className="text-mist">·</span>
              <button
                type="button"
                onClick={() => setView("sleeves")}
                className={view === "sleeves" ? "text-clay" : "text-mist hover:text-paper"}
              >
                {t("sleeves")}
              </button>
            </>
          )}
          <span className="text-mist">·</span>
          <button
            type="button"
            onClick={() => setView("back")}
            className={view === "back" ? "text-clay" : "text-mist hover:text-paper"}
          >
            {t("back")}
          </button>
        </div>
        <div className="h-[min(68vh,620px)] w-full">
          <FinalPreview design={design} view={view} />
        </div>
      </section>

      <aside className="flex flex-col justify-end gap-6 border-t border-white/10 px-8 py-12 lg:border-l lg:border-t-0">
        <p className="text-[10px] uppercase tracking-[0.32em] text-clay">{t("finalResult")}</p>
        <h1 className="font-display text-5xl">{t("yourDesign")}</h1>
        <p className="text-sm leading-relaxed text-mist">
          {t(`product_${design.productId}` as DictKey)} · {t(`color_${shownColorId}` as DictKey)} · {t("size")}{" "}
          {design.size}
        </p>
        <p className="font-display text-4xl">
          {(() => {
            const from = minClientUnitPrice(partners, design.productId);
            return from != null ? formatPrice(from) : formatPrice(product.price);
          })()}
        </p>
        <p className="text-xs text-mist">
          {t("includesServiceFee").replace("{fee}", formatPrice(SERVICE_FEE_SOM))}
        </p>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => download(view)}
            className="bg-paper py-4 text-[11px] uppercase tracking-[0.28em] text-ink hover:bg-clay hover:text-paper disabled:opacity-50"
          >
            {busy ? t("saving") : t("downloadPng")}
          </button>
          <Link
            href="/cart"
            className="border border-white/20 py-4 text-center text-[11px] uppercase tracking-[0.22em] hover:border-clay"
          >
            {t("continueCart")}
          </Link>
          <Link
            href="/studio"
            className="text-center text-[11px] uppercase tracking-[0.22em] text-mist hover:text-clay"
          >
            {t("editDesign")}
          </Link>
        </div>
      </aside>
    </main>
  );
}

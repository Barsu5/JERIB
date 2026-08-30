"use client";

import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { productById, CASUAL_PRODUCTS, FOOTBALL_PRODUCTS } from "@/lib/catalog";
import { useT, type DictKey } from "@/lib/i18n";

export default function HomePage() {
  const t = useT();

  return (
    <main>
      <section className="relative flex min-h-screen flex-col justify-center overflow-hidden px-6 pb-24 pt-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(156,43,43,0.18),transparent_55%),radial-gradient(ellipse_at_80%_70%,rgba(26,35,50,0.45),transparent_50%)]" />
        <div className="relative mx-auto flex w-full max-w-5xl flex-col items-start">
          <BrandMark href={undefined} size="hero" />
          <p className="mt-8 max-w-lg font-display text-2xl leading-snug tracking-wide text-paper sm:text-3xl">
            {t("heroLine")}
          </p>
          <p className="mt-4 max-w-sm text-sm text-mist">{t("heroLineSub")}</p>
          <Link href="/studio" className="btn-jerib mt-10 px-8 py-4">
            {t("createDesign")}
          </Link>
        </div>
      </section>

      <section className="border-t border-white/10 px-6 py-24">
        <p className="mb-12 text-heritage text-mist">{t("chooseProduct")}</p>
        <div className="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-5">
          {CASUAL_PRODUCTS.map((id) => {
            const p = productById(id);
            return (
            <Link
              key={p.id}
              href={`/studio?product=${p.id}`}
              className="bg-ink p-8 transition hover:bg-[#12100e]"
            >
              <p className="font-display text-2xl tracking-wide text-paper">
                {t(`product_${p.id}` as DictKey)}
              </p>
              <p className="mt-3 text-sm text-mist">{t(`blurb_${p.id}` as DictKey)}</p>
            </Link>
          );
          })}
        </div>
      </section>

      <section className="border-t border-white/10 px-6 py-24">
        <p className="mb-12 text-heritage text-mist">{t("footballSection")}</p>
        <div className="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {FOOTBALL_PRODUCTS.map((id) => {
            const p = productById(id);
            return (
            <Link
              key={p.id}
              href={`/studio?product=${p.id}`}
              className="bg-ink p-8 transition hover:bg-[#12100e]"
            >
              <p className="font-display text-2xl tracking-wide text-paper">
                {t(`product_${p.id}` as DictKey)}
              </p>
              <p className="mt-3 text-sm text-mist">{t(`blurb_${p.id}` as DictKey)}</p>
            </Link>
          );
          })}
        </div>
      </section>

      <section className="grid gap-px border-t border-white/10 bg-white/10 md:grid-cols-3">
        {(
          [
            ["01", "stepCustom", "stepCustomBody"],
            ["02", "stepProduce", "stepProduceBody"],
            ["03", "stepDeliver", "stepDeliverBody"],
          ] as const
        ).map(([step, title, body]) => (
          <article key={step} className="bg-ink px-8 py-16">
            <p className="text-[10px] uppercase tracking-[0.32em] text-clay">{step}</p>
            <h2 className="mt-4 font-display text-4xl tracking-wide md:text-5xl">{t(title)}</h2>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-mist">{t(body)}</p>
          </article>
        ))}
      </section>

      <section className="border-t border-white/10 px-6 py-28">
        <div className="mx-auto flex max-w-4xl flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <BrandMark href={undefined} size="nav" className="mb-4" />
            <h2 className="whitespace-pre-line font-display text-4xl leading-tight tracking-wide md:text-5xl">
              {t("placementsTitle")}
            </h2>
          </div>
          <Link href="/studio" className="text-[11px] uppercase tracking-[0.28em] text-gold hover:text-paper">
            {t("openStudio")}
          </Link>
        </div>
      </section>
    </main>
  );
}

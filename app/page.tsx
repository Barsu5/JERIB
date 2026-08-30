"use client";

import Link from "next/link";
import { Footer } from "@/components/Footer";
import { productById, CASUAL_PRODUCTS, FOOTBALL_PRODUCTS } from "@/lib/catalog";
import { useT, type DictKey } from "@/lib/i18n";

function HeroMockupGrid() {
  const t = useT();
  const tiles = [
    { bg: "bg-slate-100", product: "hoodie" as const, large: true },
    { bg: "bg-sky-100", product: "tshirt" as const },
    { bg: "bg-slate-800", product: "cap" as const, dark: true },
    { bg: "bg-amber-100", product: "football_jersey" as const },
  ];

  return (
    <div className="grid h-full min-h-[320px] grid-cols-[1.4fr_1fr] gap-3 sm:min-h-[400px]">
      <div
        className={`relative overflow-hidden rounded-2xl ${tiles[0].bg} flex flex-col items-center justify-center p-6`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" />
        <span className="relative text-xs font-semibold uppercase tracking-widest text-slate-400">
          {t(`product_${tiles[0].product}` as DictKey)}
        </span>
        <div className="relative mt-4 h-40 w-32 rounded-xl border-2 border-dashed border-slate-300 bg-white/60 sm:h-52 sm:w-40" />
      </div>
      <div className="grid grid-rows-3 gap-3">
        {tiles.slice(1).map((tile) => (
          <div
            key={tile.product}
            className={`relative overflow-hidden rounded-2xl ${tile.bg} flex flex-col items-center justify-center p-3`}
          >
            <span
              className={`text-[10px] font-semibold uppercase tracking-widest ${tile.dark ? "text-slate-400" : "text-slate-500"}`}
            >
              {t(`product_${tile.product}` as DictKey)}
            </span>
            <div
              className={`mt-2 h-10 w-14 rounded-lg border border-dashed sm:h-12 sm:w-16 ${tile.dark ? "border-slate-600 bg-slate-700/50" : "border-slate-300 bg-white/50"}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionHeading({ title, intro, dark }: { title: string; intro?: string; dark?: boolean }) {
  return (
    <div className="mx-auto mb-12 max-w-3xl text-center">
      <h2 className={`text-3xl font-bold tracking-tight sm:text-4xl ${dark ? "text-white" : "text-slate-900"}`}>
        {title}
      </h2>
      {intro && (
        <p className={`mt-4 text-base leading-relaxed ${dark ? "text-slate-300" : "text-slate-600"}`}>{intro}</p>
      )}
    </div>
  );
}

function FeatureIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-clay/10 text-clay">
      {children}
    </div>
  );
}

export default function HomePage() {
  const t = useT();

  const features = [
    { title: "homeFeature1Title", body: "homeFeature1Body", icon: "◆" },
    { title: "homeFeature2Title", body: "homeFeature2Body", icon: "◇" },
    { title: "homeFeature3Title", body: "homeFeature3Body", icon: "○" },
  ] as const;

  const steps = [
    ["1", "homeStep1Title", "homeStep1Body"],
    ["2", "homeStep2Title", "homeStep2Body"],
    ["3", "homeStep3Title", "homeStep3Body"],
    ["4", "homeStep4Title", "homeStep4Body"],
  ] as const;

  const why = [
    ["homeWhy1Title", "homeWhy1Body"],
    ["homeWhy2Title", "homeWhy2Body"],
    ["homeWhy3Title", "homeWhy3Body"],
    ["homeWhy4Title", "homeWhy4Body"],
    ["homeWhy5Title", "homeWhy5Body"],
    ["homeWhy6Title", "homeWhy6Body"],
  ] as const;

  const does = [
    ["homeDoes1Title", "homeDoes1Body"],
    ["homeDoes2Title", "homeDoes2Body"],
    ["homeDoes3Title", "homeDoes3Body"],
  ] as const;

  const focus = [
    ["homeFocus1Title", "homeFocus1Body"],
    ["homeFocus2Title", "homeFocus2Body"],
    ["homeFocus3Title", "homeFocus3Body"],
  ] as const;

  const trust = [
    ["homeTrust1Title", "homeTrust1Body"],
    ["homeTrust2Title", "homeTrust2Body"],
    ["homeTrust3Title", "homeTrust3Body"],
    ["homeTrust4Title", "homeTrust4Body"],
  ] as const;

  return (
    <>
      <main className="bg-white text-slate-900">
        {/* Hero — Printful-style dark navy block */}
        <section className="bg-navy pt-24 text-white">
          <div className="mx-auto max-w-6xl px-6 pb-6 pt-4">
            <p className="text-sm text-slate-400">{t("homeBreadcrumb")}</p>
          </div>
          <div className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div>
              <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
                {t("homeHeroTitle")}
              </h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-slate-300">{t("homeHeroSub")}</p>
              <div className="mt-8 flex flex-wrap items-center gap-8">
                <div>
                  <p className="text-2xl font-bold text-white">{t("homeStatCities")}</p>
                  <p className="mt-1 text-sm text-slate-400">{t("homeStatCitiesLabel")}</p>
                </div>
                <div className="h-10 w-px bg-slate-600" aria-hidden />
                <div>
                  <p className="text-2xl font-bold text-white">{t("homeStatProducts")}</p>
                  <p className="mt-1 text-sm text-slate-400">{t("homeStatProductsLabel")}</p>
                </div>
              </div>
              <Link href="/studio" className="btn-primary mt-10">
                {t("homeCta")}
                <span aria-hidden>→</span>
              </Link>
            </div>
            <HeroMockupGrid />
          </div>
        </section>

        {/* How it works */}
        <section className="px-6 py-20">
          <SectionHeading title={t("homeHowTitle")} intro={t("homeHowIntro")} />
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
            {features.map((f) => (
              <article key={f.title} className="marketing-card">
                <FeatureIcon>
                  <span className="text-lg">{f.icon}</span>
                </FeatureIcon>
                <h3 className="text-lg font-semibold text-slate-900">{t(f.title)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{t(f.body)}</p>
              </article>
            ))}
          </div>
          <p className="mx-auto mt-12 max-w-3xl rounded-2xl bg-muted px-8 py-6 text-center text-base font-medium text-slate-800">
            {t("homeHowSummary")}
          </p>
        </section>

        {/* Products */}
        <section className="bg-muted px-6 py-20">
          <SectionHeading title={t("chooseProduct")} />
          <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {CASUAL_PRODUCTS.map((id) => {
              const p = productById(id);
              return (
                <Link
                  key={p.id}
                  href={`/studio?product=${p.id}`}
                  className="marketing-card group block hover:border-clay/30"
                >
                  <p className="text-lg font-semibold text-slate-900 group-hover:text-clay">
                    {t(`product_${p.id}` as DictKey)}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">{t(`blurb_${p.id}` as DictKey)}</p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="px-6 py-20">
          <SectionHeading title={t("footballSection")} />
          <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FOOTBALL_PRODUCTS.map((id) => {
              const p = productById(id);
              return (
                <Link
                  key={p.id}
                  href={`/studio?product=${p.id}`}
                  className="marketing-card group block hover:border-clay/30"
                >
                  <p className="text-lg font-semibold text-slate-900 group-hover:text-clay">
                    {t(`product_${p.id}` as DictKey)}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">{t(`blurb_${p.id}` as DictKey)}</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Steps */}
        <section className="bg-muted px-6 py-20">
          <SectionHeading title={t("homeStepsTitle")} intro={t("homeStepsIntro")} />
          <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([num, title, body]) => (
              <article key={num} className="marketing-card">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-clay text-sm font-bold text-white">
                  {num}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{t(title)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{t(body)}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Why choose */}
        <section className="px-6 py-20">
          <SectionHeading title={t("homeWhyTitle")} />
          <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {why.map(([title, body]) => (
              <article key={title} className="marketing-card">
                <h3 className="text-base font-semibold text-slate-900">{t(title)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{t(body)}</p>
              </article>
            ))}
          </div>
        </section>

        {/* What we do */}
        <section className="bg-navy px-6 py-20 text-white">
          <SectionHeading title={t("homeDoesTitle")} dark />
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
            {does.map(([title, body]) => (
              <article
                key={title}
                className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm"
              >
                <h3 className="text-lg font-semibold">{t(title)}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{t(body)}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Focus */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{t("homeFocusTitle")}</h2>
            <p className="mt-4 text-slate-600">{t("homeFocusSub")}</p>
          </div>
          <div className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-3">
            {focus.map(([title, body]) => (
              <article key={title} className="marketing-card text-center">
                <h3 className="text-lg font-semibold text-slate-900">{t(title)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{t(body)}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Trust */}
        <section className="bg-muted px-6 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">{t("homeTrustTitle")}</h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">{t("homeTrustBody")}</p>
          </div>
          <div className="mx-auto mt-12 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {trust.map(([title, body]) => (
              <article key={title} className="marketing-card">
                <h3 className="text-base font-semibold text-slate-900">{t(title)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{t(body)}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

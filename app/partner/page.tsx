"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PartnerOrderCard } from "@/components/partner/PartnerOrderCard";
import { BrandMark } from "@/components/BrandMark";
import { useAuth, useSessionUser, useAuthHydrated } from "@/lib/auth/store";
import { formatPrice } from "@/lib/catalog";
import { cityLabel } from "@/lib/dispatch/cities";
import { QUALITY_STANDARDS } from "@/lib/dispatch/standards";
import { partnerById, useDispatch } from "@/lib/dispatch/store";
import type { PartnerOrderStatus } from "@/lib/dispatch/types";
import { useDispatchTick } from "@/lib/dispatch/useDispatchTick";
import { useLang, useT, type DictKey } from "@/lib/i18n";
import { SERVICE_FEE_SOM } from "@/lib/pricing";
import type { ProductId } from "@/lib/types";

type PanelView = "overview" | "orders" | "earnings" | "profile" | "standards";

const ORDER_FILTERS: { key: string; statuses: PartnerOrderStatus[] | "all" }[] = [
  { key: "all", statuses: "all" },
  { key: "new", statuses: ["offered"] },
  { key: "accepted", statuses: ["accepted"] },
  { key: "producing", statuses: ["in_production", "quality_check"] },
  { key: "ready", statuses: ["ready", "packed", "with_courier"] },
  { key: "history", statuses: ["delivered"] },
];

const NAV: { id: PanelView; labelKey: DictKey }[] = [
  { id: "overview", labelKey: "partnerNavOverview" },
  { id: "orders", labelKey: "partnerNavOrders" },
  { id: "earnings", labelKey: "partnerNavEarnings" },
  { id: "profile", labelKey: "partnerNavProfile" },
  { id: "standards", labelKey: "partnerNavStandards" },
];

export default function PartnerPanelPage() {
  const t = useT();
  const lang = useLang((s) => s.lang);
  const router = useRouter();
  const user = useSessionUser();
  const authReady = useAuthHydrated();
  const logout = useAuth((s) => s.logout);
  useDispatchTick();

  const partners = useDispatch((s) => s.partners);
  const orders = useDispatch((s) => s.orders);
  const setActivePartner = useDispatch((s) => s.setActivePartner);
  const accept = useDispatch((s) => s.partnerAccept);
  const reject = useDispatch((s) => s.partnerReject);
  const advance = useDispatch((s) => s.partnerAdvance);
  const toggleAccepting = useDispatch((s) => s.adminToggleAccepting);
  const updatePartner = useDispatch((s) => s.adminUpdatePartner);

  const [view, setView] = useState<PanelView>("overview");
  const [orderFilter, setOrderFilter] = useState("new");

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      router.replace("/login?next=/partner");
      return;
    }
    if (user.role !== "partner") {
      router.replace(user.role === "admin" ? "/admin" : "/account");
      return;
    }
    if (user.partnerId) setActivePartner(user.partnerId);
  }, [user, router, setActivePartner, authReady]);

  const partner = partnerById(partners, user?.partnerId ?? null);

  const mine = useMemo(
    () => orders.filter((o) => o.partnerId === user?.partnerId),
    [orders, user?.partnerId]
  );

  const counts = useMemo(() => {
    const by = (statuses: PartnerOrderStatus[]) =>
      mine.filter((o) => statuses.includes(o.status)).length;
    return {
      new: by(["offered"]),
      accepted: by(["accepted"]),
      producing: by(["in_production", "quality_check"]),
      ready: by(["ready", "packed", "with_courier"]),
      history: by(["delivered"]),
      all: mine.length,
    };
  }, [mine]);

  const stats = useMemo(() => {
    const done = mine.filter((o) => o.status === "delivered");
    const revenue = done.reduce((n, o) => n + (o.finance?.partnerPayout ?? 0), 0);
    const paid = done
      .filter((o) => o.finance?.payoutStatus === "paid")
      .reduce((n, o) => n + (o.finance?.partnerPayout ?? 0), 0);
    const active = mine.filter(
      (o) => o.status !== "delivered" && o.status !== "failed_no_partner"
    ).length;
    const completion =
      mine.length === 0
        ? 1
        : done.length / Math.max(1, mine.filter((o) => o.status !== "offered").length || 1);
    return {
      revenue,
      paid,
      pendingPay: revenue - paid,
      active,
      done: done.length,
      completion,
    };
  }, [mine]);

  const visibleOrders = useMemo(() => {
    const f = ORDER_FILTERS.find((x) => x.key === orderFilter);
    if (!f || f.statuses === "all") return mine;
    return mine.filter((o) => f.statuses.includes(o.status));
  }, [mine, orderFilter]);

  if (!authReady || !user || user.role !== "partner") {
    return (
      <main className="px-6 pt-40">
        <p className="text-mist">{t("loading")}</p>
      </main>
    );
  }

  if (!partner) {
    return (
      <main className="mx-auto max-w-lg px-6 pt-40">
        <h1 className="font-display text-4xl">{t("partnerPanelTitle")}</h1>
        <p className="mt-4 text-sm text-mist">{t("partnerProfileMissing")}</p>
      </main>
    );
  }

  if (partner.approval === "pending") {
    return (
      <main className="mx-auto max-w-lg px-6 pt-40">
        <p className="text-[10px] uppercase tracking-[0.32em] text-clay">{t("partnerPortal")}</p>
        <h1 className="mt-3 font-display text-4xl">{partner.name}</h1>
        <p className="mt-4 text-sm text-mist">{t("partnerPendingApproval")}</p>
        <p className="mt-2 text-sm text-mist">{user.email}</p>
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="mt-10 border border-white/20 px-5 py-3 text-[10px] uppercase tracking-[0.2em]"
        >
          {t("logout")}
        </button>
      </main>
    );
  }

  if (partner.approval === "blocked") {
    return (
      <main className="mx-auto max-w-lg px-6 pt-40">
        <h1 className="font-display text-4xl">{t("partnerBlocked")}</h1>
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="mt-10 border border-white/20 px-5 py-3 text-[10px] uppercase tracking-[0.2em]"
        >
          {t("logout")}
        </button>
      </main>
    );
  }

  return (
    <div className="min-h-screen pt-16 lg:grid lg:grid-cols-[240px_1fr]">
      {/* Sidebar */}
      <aside className="border-b border-white/10 bg-[#100e0c] px-5 py-6 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:border-b-0 lg:border-r">
        <p className="text-[10px] uppercase tracking-[0.28em] text-clay">{t("partnerPanelTitle")}</p>
        <p className="mt-3 font-display text-2xl leading-tight">{partner.name}</p>
        <p className="mt-1 text-xs text-mist">{cityLabel(partner.cityId, lang)}</p>
        <p className="mt-1 text-xs text-mist">{user.email}</p>

        <nav className="mt-8 flex gap-2 overflow-x-auto lg:block lg:space-y-1 lg:overflow-visible">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setView(item.id)}
              className={`shrink-0 px-3 py-2.5 text-left text-[11px] uppercase tracking-[0.16em] lg:w-full ${
                view === item.id ? "bg-paper text-ink" : "text-mist hover:bg-white/5 hover:text-paper"
              }`}
            >
              {t(item.labelKey)}
              {item.id === "orders" && counts.new > 0 && (
                <span className="ml-2 text-clay">{counts.new}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-8 hidden border-t border-white/10 pt-6 text-xs text-mist lg:block">
          <p>
            {t("load")}: {Math.round(partner.currentLoad * 100)}%
          </p>
          <p className="mt-2">
            {t("accepting")}: {partner.acceptingOrders ? t("yes") : t("no")}
          </p>
          <button
            type="button"
            onClick={() => toggleAccepting(partner.id)}
            className="mt-4 text-[10px] uppercase tracking-[0.2em] text-clay hover:underline"
          >
            {partner.acceptingOrders ? t("pauseOrders") : t("resumeOrders")}
          </button>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="mt-4 block text-[10px] uppercase tracking-[0.2em] text-mist hover:text-clay"
          >
            {t("logout")}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="px-6 py-8 lg:px-10 lg:py-10">
        {view === "overview" && (
          <section>
            <h1 className="font-display text-4xl md:text-5xl">{t("partnerNavOverview")}</h1>
            <p className="mt-2 text-sm text-mist">{t("partnerBody")}</p>

            <div className="mt-10 grid gap-px bg-white/10 sm:grid-cols-2 xl:grid-cols-4">
              {[
                [t("partnerStatNew"), String(counts.new)],
                [t("partnerStatActive"), String(stats.active)],
                [t("partnerRevenue"), formatPrice(stats.revenue)],
                [t("pendingPayout"), formatPrice(stats.pendingPay)],
              ].map(([label, value]) => (
                <div key={String(label)} className="bg-ink px-5 py-7">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-mist">{label}</p>
                  <p className="mt-3 font-display text-4xl">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-px bg-white/10 sm:grid-cols-3">
              {[
                [t("rating"), partner.rating.toFixed(1)],
                [t("completionPct"), `${Math.round(stats.completion * 100)}%`],
                [t("load"), `${Math.round(partner.currentLoad * 100)}%`],
              ].map(([label, value]) => (
                <div key={String(label)} className="bg-ink px-5 py-6">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-mist">{label}</p>
                  <p className="mt-2 font-display text-3xl">{value}</p>
                </div>
              ))}
            </div>

            {counts.new > 0 && (
              <div className="mt-10">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-2xl">{t("partnerTab_new")}</h2>
                  <button
                    type="button"
                    onClick={() => {
                      setOrderFilter("new");
                      setView("orders");
                    }}
                    className="text-[10px] uppercase tracking-[0.2em] text-clay"
                  >
                    {t("partnerSeeAll")}
                  </button>
                </div>
                <div className="space-y-4">
                  {mine
                    .filter((o) => o.status === "offered")
                    .slice(0, 3)
                    .map((order) => (
                      <PartnerOrderCard
                        key={order.id}
                        order={order}
                        onAccept={() => accept(order.id, partner.id)}
                        onReject={() => reject(order.id, partner.id)}
                        onAdvance={() => advance(order.id, partner.id)}
                      />
                    ))}
                </div>
              </div>
            )}
          </section>
        )}

        {view === "orders" && (
          <section>
            <h1 className="font-display text-4xl md:text-5xl">{t("partnerNavOrders")}</h1>
            <nav className="mt-8 flex flex-wrap gap-2">
              {ORDER_FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setOrderFilter(f.key)}
                  className={`px-3 py-2 text-[10px] uppercase tracking-[0.16em] ${
                    orderFilter === f.key
                      ? "bg-paper text-ink"
                      : "border border-white/15 hover:border-white/40"
                  }`}
                >
                  {f.key === "all" ? t("partnerFilterAll") : t(`partnerTab_${f.key}` as DictKey)}
                  <span className="ml-2 opacity-60">
                    {f.key === "all" ? counts.all : counts[f.key as keyof typeof counts]}
                  </span>
                </button>
              ))}
            </nav>
            <div className="mt-8 space-y-4">
              {visibleOrders.length === 0 && <p className="text-mist">{t("noOrdersInTab")}</p>}
              {visibleOrders.map((order) => (
                <PartnerOrderCard
                  key={order.id}
                  order={order}
                  onAccept={() => accept(order.id, partner.id)}
                  onReject={() => reject(order.id, partner.id)}
                  onAdvance={() => advance(order.id, partner.id)}
                />
              ))}
            </div>
          </section>
        )}

        {view === "earnings" && (
          <section>
            <h1 className="font-display text-4xl md:text-5xl">{t("partnerNavEarnings")}</h1>
            <div className="mt-10 grid gap-px bg-white/10 sm:grid-cols-3">
              {[
                [t("partnerRevenue"), formatPrice(stats.revenue)],
                [t("paid"), formatPrice(stats.paid)],
                [t("pendingPayout"), formatPrice(stats.pendingPay)],
              ].map(([label, value]) => (
                <div key={String(label)} className="bg-ink px-5 py-8">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-mist">{label}</p>
                  <p className="mt-3 font-display text-4xl">{value}</p>
                </div>
              ))}
            </div>
            <ul className="mt-10 divide-y divide-white/10 border-t border-white/10">
              {mine
                .filter((o) => o.finance)
                .map((o) => (
                  <li key={o.id} className="flex flex-wrap items-center justify-between gap-4 py-5 text-sm">
                    <div>
                      <p className="font-display text-xl">{o.id}</p>
                      <p className="mt-1 text-mist">{new Date(o.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p>{formatPrice(o.finance!.partnerPayout)}</p>
                      <p className="mt-1 text-xs text-mist">
                        {o.finance!.payoutStatus === "paid" ? t("paid") : t("payoutPending")}
                      </p>
                    </div>
                  </li>
                ))}
              {mine.filter((o) => o.finance).length === 0 && (
                <li className="py-8 text-mist">{t("partnerNoEarnings")}</li>
              )}
            </ul>
          </section>
        )}

        {view === "profile" && (
          <section>
            <h1 className="font-display text-4xl md:text-5xl">{t("partnerNavProfile")}</h1>
            <dl className="mt-10 grid gap-6 sm:grid-cols-2">
              {(
                [
                  [t("partners"), partner.name],
                  [t("city"), cityLabel(partner.cityId, lang)],
                  [t("companyAddress"), partner.address],
                  ["GPS", `${partner.lat.toFixed(4)}, ${partner.lng.toFixed(4)}`],
                  [t("serviceRadius"), `${partner.serviceRadiusKm} km`],
                  [t("serviceCities"), partner.serviceCities.map((c) => cityLabel(c, lang)).join(", ")],
                  [t("printMethod"), partner.printMethods.join(", ").toUpperCase()],
                  [t("chooseProduct"), partner.products.join(", ")],
                  [t("rating"), String(partner.rating)],
                  [t("quality"), String(partner.qualityScore)],
                  [t("completionPct"), `${Math.round(partner.completionRate * 100)}%`],
                  [t("cancelRate"), `${Math.round(partner.cancelRate * 100)}%`],
                  [t("load"), `${Math.round(partner.currentLoad * 100)}%`],
                  [t("accepting"), partner.acceptingOrders ? t("yes") : t("no")],
                ] as const
              ).map(([k, v]) => (
                <div key={String(k)} className="border-b border-white/10 pb-4">
                  <dt className="text-[10px] uppercase tracking-[0.2em] text-mist">{k}</dt>
                  <dd className="mt-2 text-sm">{v}</dd>
                </div>
              ))}
            </dl>
            <button
              type="button"
              onClick={() => toggleAccepting(partner.id)}
              className="mt-10 border border-clay px-6 py-3 text-[11px] uppercase tracking-[0.22em] text-clay hover:bg-clay hover:text-paper"
            >
              {partner.acceptingOrders ? t("pauseOrders") : t("resumeOrders")}
            </button>

            <div className="mt-14">
              <h2 className="font-display text-3xl">{t("partnerSetPrices")}</h2>
              <p className="mt-2 max-w-xl text-sm text-mist">{t("partnerSetPricesHint")}</p>
              <ul className="mt-8 space-y-4">
                {partner.products.map((pid) => {
                  const your = partner.productionPrices[pid] ?? 0;
                  const client = your + SERVICE_FEE_SOM;
                  return (
                    <li
                      key={pid}
                      className="flex flex-wrap items-end justify-between gap-4 border border-white/10 px-4 py-4"
                    >
                      <div>
                        <p className="font-display text-xl">{t(`product_${pid}` as DictKey)}</p>
                        <p className="mt-1 text-xs text-mist">
                          {t("clientWillPay")}: {formatPrice(client)} ({t("yourPrice")} +{" "}
                          {formatPrice(SERVICE_FEE_SOM)})
                        </p>
                      </div>
                      <label className="text-[10px] uppercase tracking-[0.18em] text-mist">
                        {t("yourPrice")} (сом)
                        <input
                          type="number"
                          min={1}
                          value={your}
                          onChange={(e) => {
                            const value = Math.max(1, Number(e.target.value) || 0);
                            updatePartner(partner.id, {
                              productionPrices: {
                                ...partner.productionPrices,
                                [pid as ProductId]: value,
                              },
                            });
                          }}
                          className="mt-2 block w-32 border border-white/15 bg-transparent px-3 py-2 text-sm text-paper outline-none focus:border-clay"
                        />
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        )}

        {view === "standards" && (
          <section>
            <h1 className="font-display text-4xl md:text-5xl">{t("partnerNavStandards")}</h1>
            <p className="mt-3 max-w-xl text-sm text-mist">{t("partnerStandardsIntro")}</p>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {QUALITY_STANDARDS.map((s) => (
                <article key={s.id} className="border border-white/10 p-5">
                  <h2 className="font-display text-2xl">{s.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-mist">{s.body}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        <p className="mt-16 text-[11px] text-mist">
          <BrandMark href="/" size="nav" animated className="inline-flex" />
          {" · "}
          <Link href="/admin" className="text-clay hover:underline">
            {t("adminLink")}
          </Link>
        </p>
      </main>
    </div>
  );
}

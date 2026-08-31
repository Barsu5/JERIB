"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useSessionUser, useAuthHydrated } from "@/lib/auth/store";
import { authErrorKey } from "@/lib/auth/errors";
import { CountryCitySelect } from "@/components/CountryCitySelect";
import { BrandInText } from "@/components/BrandMark";
import { formatPrice } from "@/lib/catalog";
import { DEFAULT_CITY_ID, DEFAULT_COUNTRY_ID, normalizeCityId, CITIES, cityLabel, locationLabel } from "@/lib/dispatch/cities";
import { QUALITY_STANDARDS } from "@/lib/dispatch/standards";
import { partnerById, statusLabel, useDispatch } from "@/lib/dispatch/store";
import type { Partner, PartnerApproval } from "@/lib/dispatch/types";
import { useDispatchTick } from "@/lib/dispatch/useDispatchTick";
import { useLang, useT, type DictKey } from "@/lib/i18n";

type AdminTab = "orders" | "partners" | "cities" | "standards" | "settings";

export default function AdminPage() {
  const t = useT();
  const lang = useLang((s) => s.lang);
  const router = useRouter();
  const user = useSessionUser();
  const authReady = useAuthHydrated();
  const logout = useAuth((s) => s.logout);
  useDispatchTick();
  const [tab, setTab] = useState<AdminTab>("orders");
  const partners = useDispatch((s) => s.partners);
  const orders = useDispatch((s) => s.orders);
  const settings = useDispatch((s) => s.settings);
  const reassign = useDispatch((s) => s.adminReassign);
  const setApproval = useDispatch((s) => s.adminSetPartnerApproval);
  const toggleAccepting = useDispatch((s) => s.adminToggleAccepting);
  const updatePartner = useDispatch((s) => s.adminUpdatePartner);
  const createPartnerAccount = useAuth((s) => s.adminCreatePartnerAccount);
  const setSettings = useDispatch((s) => s.adminSetSettings);
  const setLoad = useDispatch((s) => s.adminSetLoad);
  const markPaid = useDispatch((s) => s.adminMarkPayoutPaid);
  const forceExpire = useDispatch((s) => s.forceExpireOffer);

  const alerts = orders.filter((o) => o.adminAlert || o.status === "failed_no_partner");
  const delayed = orders.filter(
    (o) =>
      o.status !== "delivered" &&
      o.status !== "failed_no_partner" &&
      Date.now() > o.deadlineAt
  );

  const cityStats = useMemo(() => {
    const activeIds = new Set([
      ...orders.map((o) => o.cityId),
      ...partners.map((p) => p.cityId),
    ]);
    return CITIES.filter((c) => activeIds.has(c.id)).map((c) => {
      const cityOrders = orders.filter((o) => o.cityId === c.id);
      const cityPartners = partners.filter((p) => p.cityId === c.id && p.approval === "approved");
      const delivered = cityOrders.filter((o) => o.status === "delivered").length;
      const revenue = cityOrders.reduce((n, o) => n + (o.finance?.jeribRevenue ?? 0), 0);
      const avgLoad =
        cityPartners.length === 0
          ? 0
          : cityPartners.reduce((n, p) => n + p.currentLoad, 0) / cityPartners.length;
      return { city: c, orders: cityOrders.length, partners: cityPartners.length, delivered, revenue, avgLoad };
    });
  }, [orders, partners]);

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      router.replace("/login?next=/admin");
      return;
    }
    if (user.role !== "admin") {
      router.replace(user.role === "partner" ? "/partner" : "/account");
    }
  }, [user, router, authReady]);

  if (!authReady || !user || user.role !== "admin") {
    return (
      <main className="px-6 pt-40">
        <p className="text-mist">{t("loading")}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 pb-24 pt-28">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.32em] text-clay">
            <BrandInText text={t("adminPortal")} />
          </p>
          <h1 className="mt-2 font-display text-5xl">{t("adminTitle")}</h1>
          <p className="mt-3 max-w-2xl text-sm text-mist">{t("adminBody")}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="border border-white/20 px-5 py-3 text-[10px] uppercase tracking-[0.2em]"
        >
          {t("logout")}
        </button>
      </div>

      {(alerts.length > 0 || delayed.length > 0) && (
        <div className="mt-8 border border-clay/50 bg-clay/10 px-5 py-4 text-sm">
          {alerts.length > 0 && (
            <p>
              {t("adminAlerts")}: {alerts.length} — {t("noPartnerAlert")}
            </p>
          )}
          {delayed.length > 0 && (
            <p className="mt-1">
              {t("delayedOrders")}: {delayed.length}
            </p>
          )}
        </div>
      )}

      <nav className="mt-10 flex flex-wrap gap-2">
        {(["orders", "partners", "cities", "standards", "settings"] as AdminTab[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`px-3 py-2 text-[10px] uppercase tracking-[0.18em] ${
              tab === id ? "bg-paper text-ink" : "border border-white/15 hover:border-white/40"
            }`}
          >
            {t(`adminTab_${id}` as DictKey)}
          </button>
        ))}
      </nav>

      {tab === "orders" && (
        <section className="mt-10 space-y-4">
          {orders.length === 0 && <p className="text-mist">{t("noOrdersYet")}</p>}
          {orders.map((o) => {
            const partner = partnerById(partners, o.partnerId);
            return (
              <article key={o.id} className="border border-white/10 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-mist">{o.id}</p>
                    <p className="mt-1 font-display text-2xl">{statusLabel(o.status, lang)}</p>
                    <p className="mt-2 text-sm text-mist">
                      {o.name} · {cityLabel(o.cityId, lang)} · {formatPrice(o.total)}
                    </p>
                    <p className="mt-1 text-sm">
                      {t("assignedPartner")}:{" "}
                      <span className="text-clay">{partner?.name ?? "—"}</span>
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <select
                      className="border border-white/15 bg-ink px-3 py-2 text-sm"
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) reassign(o.id, e.target.value);
                        e.target.value = "";
                      }}
                    >
                      <option value="">{t("reassignTo")}</option>
                      {partners
                        .filter((p) => p.approval === "approved")
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                    </select>
                    {o.status === "offered" && (
                      <button
                        type="button"
                        onClick={() => forceExpire(o.id)}
                        className="border border-white/20 px-3 py-2 text-[10px] uppercase tracking-widest hover:border-clay"
                      >
                        {t("forceCascade")}
                      </button>
                    )}
                    {o.finance && o.finance.payoutStatus === "pending" && o.status === "delivered" && (
                      <button
                        type="button"
                        onClick={() => markPaid(o.id)}
                        className="border border-clay px-3 py-2 text-[10px] uppercase tracking-widest text-clay"
                      >
                        {t("markPayoutPaid")}
                      </button>
                    )}
                  </div>
                </div>
                {o.finance && (
                  <p className="mt-4 text-xs text-mist">
                    {t("financeLine")
                      .replace("{client}", formatPrice(o.finance.clientTotal))
                      .replace("{prod}", formatPrice(o.finance.productionCost))
                      .replace("{del}", formatPrice(o.finance.deliveryCost))
                      .replace("{fee}", formatPrice(o.finance.paymentFee))
                      .replace("{other}", formatPrice(o.finance.otherCost))
                      .replace("{rev}", formatPrice(o.finance.jeribRevenue))}
                  </p>
                )}
                <details className="mt-3 text-xs text-mist">
                  <summary className="cursor-pointer">{t("assignmentHistory")}</summary>
                  <ul className="mt-2 space-y-1">
                    {o.assignmentHistory.map((a, i) => (
                      <li key={`${a.partnerId}-${i}`}>
                        {partnerById(partners, a.partnerId)?.name ?? a.partnerId} · score{" "}
                        {a.score} · {a.outcome}
                      </li>
                    ))}
                  </ul>
                </details>
              </article>
            );
          })}
        </section>
      )}

      {tab === "partners" && (
        <PartnersAdmin
          partners={partners}
          setApproval={setApproval}
          toggleAccepting={toggleAccepting}
          updatePartner={updatePartner}
          createPartnerAccount={createPartnerAccount}
          setLoad={setLoad}
        />
      )}

      {tab === "cities" && (
        <section className="mt-10 grid gap-px bg-white/10 sm:grid-cols-3">
          {cityStats.map((s) => (
            <div key={s.city.id} className="bg-ink p-6">
              <p className="font-display text-3xl">{locationLabel(s.city.id, lang)}</p>
              <ul className="mt-4 space-y-2 text-sm text-mist">
                <li>
                  {t("partners")}: {s.partners}
                </li>
                <li>
                  {t("orders")}: {s.orders} ({t("delivered")}: {s.delivered})
                </li>
                <li>
                  {t("avgLoad")}: {Math.round(s.avgLoad * 100)}%
                </li>
                <li>
                  {t("jeribRevenue")}: {formatPrice(s.revenue)}
                </li>
              </ul>
              <ul className="mt-4 space-y-1 text-xs">
                {partners
                  .filter((p) => p.cityId === s.city.id)
                  .map((p) => (
                    <li key={p.id} className="text-mist">
                      {p.name} · {Math.round(p.currentLoad * 100)}% · {p.approval}
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {tab === "standards" && (
        <section className="mt-10 grid gap-4 md:grid-cols-2">
          {QUALITY_STANDARDS.map((s) => (
            <article key={s.id} className="border border-white/10 p-6">
              <h2 className="font-display text-2xl">{s.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-mist">{s.body}</p>
            </article>
          ))}
        </section>
      )}

      {tab === "settings" && (
        <section className="mt-10 max-w-lg space-y-4">
          <label className="block text-[10px] uppercase tracking-[0.2em] text-mist">
            {t("acceptTimeoutMin")}
            <input
              type="number"
              min={1}
              value={settings.acceptTimeoutMs / 60000}
              onChange={(e) =>
                setSettings({ acceptTimeoutMs: Math.max(1, Number(e.target.value)) * 60000 })
              }
              className="mt-2 w-full border border-white/15 bg-transparent px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-[10px] uppercase tracking-[0.2em] text-mist">
            {t("commissionRate")}
            <input
              type="number"
              step={0.01}
              min={0}
              max={1}
              value={settings.defaultCommissionRate}
              onChange={(e) => setSettings({ defaultCommissionRate: Number(e.target.value) })}
              className="mt-2 w-full border border-white/15 bg-transparent px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-[10px] uppercase tracking-[0.2em] text-mist">
            {t("deliveryCost")}
            <input
              type="number"
              value={settings.defaultDeliveryCost}
              onChange={(e) => setSettings({ defaultDeliveryCost: Number(e.target.value) })}
              className="mt-2 w-full border border-white/15 bg-transparent px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-[10px] uppercase tracking-[0.2em] text-mist">
            {t("paymentFeeRate")}
            <input
              type="number"
              step={0.001}
              value={settings.paymentFeeRate}
              onChange={(e) => setSettings({ paymentFeeRate: Number(e.target.value) })}
              className="mt-2 w-full border border-white/15 bg-transparent px-3 py-2 text-sm"
            />
          </label>
          <p className="pt-4 text-xs text-mist">{t("scoringWeights")}</p>
          <p className="text-sm">
            speed 30% · distance 20% · quality 15% · load 15% · price 10% · reliability 10%
          </p>
        </section>
      )}

      <p className="mt-16 text-[11px] text-mist">
        <Link href="/partner" className="text-clay hover:underline">
          {t("partnerLink")}
        </Link>
      </p>
    </main>
  );
}

function PartnersAdmin({
  partners,
  setApproval,
  toggleAccepting,
  updatePartner,
  createPartnerAccount,
  setLoad,
}: {
  partners: Partner[];
  setApproval: (id: string, a: PartnerApproval) => void;
  toggleAccepting: (id: string) => void;
  updatePartner: (id: string, patch: Partial<Partner>) => void;
  createPartnerAccount: ReturnType<typeof useAuth.getState>["adminCreatePartnerAccount"];
  setLoad: (id: string, load: number) => void;
}) {
  const t = useT();
  const lang = useLang((s) => s.lang);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [cityId, setCityId] = useState(DEFAULT_CITY_ID);
  const [countryId, setCountryId] = useState(DEFAULT_COUNTRY_ID);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setCompanyName("");
    setAddress("");
    setCityId(DEFAULT_CITY_ID);
    setCountryId(DEFAULT_COUNTRY_ID);
    setFormError("");
  };

  const onCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setFormError("");
    setSuccess("");
    try {
      if (password.trim().length < 6) {
        setFormError(t("authPasswordShort"));
        return;
      }
      const res = await createPartnerAccount({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        cityId,
        companyName: companyName.trim(),
        address: address.trim(),
      });
      if (!res.ok) {
        setFormError(t(authErrorKey(res.error)));
        return;
      }
      setSuccess(
        t("adminPartnerCreated").replace("{email}", res.email).replace("{password}", password)
      );
      resetForm();
      setShowForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-10 space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setShowForm((v) => !v);
            setSuccess("");
          }}
          className="bg-paper px-5 py-3 text-[11px] uppercase tracking-[0.22em] text-ink hover:bg-clay hover:text-paper"
        >
          {showForm ? t("cancel") : t("adminCreatePartner")}
        </button>
      </div>

      {success && (
        <p className="border border-clay/40 bg-clay/10 px-4 py-3 text-sm text-paper">{success}</p>
      )}

      {showForm && (
        <form onSubmit={onCreateAccount} className="border border-white/10 p-5 space-y-4">
          <p className="text-sm text-mist">{t("adminCreatePartnerBody")}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-[10px] uppercase tracking-[0.2em] text-mist">
              {t("name")}
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full border border-white/15 bg-transparent px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-mist">
              {t("companyName")}
              <input
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="mt-2 w-full border border-white/15 bg-transparent px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-mist">
              Email
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full border border-white/15 bg-transparent px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-mist">
              {t("phone")}
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 w-full border border-white/15 bg-transparent px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-mist sm:col-span-2">
              {t("password")}
              <input
                required
                type="text"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full border border-white/15 bg-transparent px-3 py-2 text-sm"
              />
            </label>
          </div>
          <CountryCitySelect
            countryId={countryId}
            cityId={cityId}
            onCountryChange={setCountryId}
            onCityChange={(id) => setCityId(normalizeCityId(id))}
          />
          <label className="block text-[10px] uppercase tracking-[0.2em] text-mist">
            {t("address")}
            <textarea
              required
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-2 w-full border border-white/15 bg-transparent px-3 py-2 text-sm"
            />
          </label>
          {formError && <p className="text-sm text-clay">{formError}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="bg-clay px-5 py-3 text-[11px] uppercase tracking-[0.22em] text-paper disabled:opacity-50"
          >
            {submitting ? t("signingIn") : t("adminCreatePartnerSubmit")}
          </button>
        </form>
      )}
      {partners.map((p) => (
        <article key={p.id} className="border border-white/10 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-display text-2xl">{p.name}</p>
              <p className="mt-1 text-sm text-mist">
                {cityLabel(p.cityId, lang)} · {p.address}
              </p>
              <p className="mt-1 text-xs text-mist">
                GPS {p.lat.toFixed(4)}, {p.lng.toFixed(4)} · R {p.serviceRadiusKm} km ·{" "}
                {p.printMethods.join(", ")} · {p.products.join(", ")}
              </p>
              <p className="mt-1 text-xs text-mist">
                {t("rating")} {p.rating} · {t("quality")} {p.qualityScore} ·{" "}
                {t("completionPct")} {Math.round(p.completionRate * 100)}% · {t("cancelRate")}{" "}
                {Math.round(p.cancelRate * 100)}%
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["pending", "approved", "blocked"] as PartnerApproval[]).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setApproval(p.id, a)}
                  className={`px-3 py-2 text-[10px] uppercase tracking-widest ${
                    p.approval === a ? "bg-clay text-paper" : "border border-white/15"
                  }`}
                >
                  {a}
                </button>
              ))}
              <button
                type="button"
                onClick={() => toggleAccepting(p.id)}
                className="border border-white/15 px-3 py-2 text-[10px] uppercase tracking-widest"
              >
                {p.acceptingOrders ? t("pauseOrders") : t("resumeOrders")}
              </button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <label className="text-mist">
              {t("load")} {Math.round(p.currentLoad * 100)}%
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={p.currentLoad}
                onChange={(e) => setLoad(p.id, Number(e.target.value))}
                className="ml-2 align-middle"
              />
            </label>
            <label className="text-mist">
              {t("serviceRadius")}
              <input
                type="number"
                value={p.serviceRadiusKm}
                onChange={(e) => updatePartner(p.id, { serviceRadiusKm: Number(e.target.value) })}
                className="ml-2 w-20 border border-white/15 bg-transparent px-2 py-1"
              />
            </label>
            <label className="flex items-center gap-2 text-mist">
              <input
                type="checkbox"
                checked={p.acceptsRemoteDelivery}
                onChange={(e) => updatePartner(p.id, { acceptsRemoteDelivery: e.target.checked })}
              />
              {t("remoteDelivery")}
            </label>
          </div>
          <p className="mt-2 text-xs text-mist">
            {t("serviceCities")}: {p.serviceCities.map((c) => cityLabel(c, lang)).join(", ")}
          </p>
        </article>
      ))}
    </section>
  );
}

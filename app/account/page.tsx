"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClientOrderCard, isActiveOrder } from "@/components/ClientOrderCard";
import { CountryCitySelect } from "@/components/CountryCitySelect";
import { AddressForm } from "@/components/AddressForm";
import {
  EMPTY_ADDRESS,
  formatDeliveryAddress,
  isAddressValid,
  parseDeliveryAddress,
  type AddressFields,
} from "@/lib/address";
import { useSessionUser, useAuth, useAuthHydrated } from "@/lib/auth/store";
import {
  cityCountryId,
  DEFAULT_CITY_ID,
  DEFAULT_COUNTRY_ID,
  normalizeCityId,
  type CityId,
  type CountryId,
} from "@/lib/dispatch/cities";
import { useDispatch } from "@/lib/dispatch/store";
import { useDispatchTick } from "@/lib/dispatch/useDispatchTick";
import { useLang, useT } from "@/lib/i18n";

type OrdersTab = "active" | "history" | "all";

export default function AccountPage() {
  const t = useT();
  const lang = useLang((s) => s.lang);
  const router = useRouter();
  const user = useSessionUser();
  const authReady = useAuthHydrated();
  const updateProfile = useAuth((s) => s.updateProfile);
  const logout = useAuth((s) => s.logout);
  const orders = useDispatch((s) => s.orders);
  useDispatchTick();

  const [name, setName] = useState("");
  const [cityId, setCityId] = useState<CityId>(DEFAULT_CITY_ID);
  const [countryId, setCountryId] = useState<CountryId>(DEFAULT_COUNTRY_ID);
  const [addressFields, setAddressFields] = useState<AddressFields>(EMPTY_ADDRESS);
  const [saved, setSaved] = useState(false);
  const [ordersTab, setOrdersTab] = useState<OrdersTab>("active");

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      router.replace("/login?next=/account");
      return;
    }
    if (user.role === "partner") {
      router.replace("/partner");
      return;
    }
    if (user.role === "admin") {
      router.replace("/admin");
      return;
    }
    setName(user.name);
    setCityId(normalizeCityId(user.cityId));
    setCountryId(cityCountryId(user.cityId));
    const parsed = parseDeliveryAddress(user.address);
    setAddressFields({
      ...parsed,
      phone: parsed.phone || user.phone || "",
    });
  }, [user, router, authReady]);

  const myOrders = useMemo(() => {
    if (!user) return [];
    return orders
      .filter((o) => o.userId === user.id || o.email.toLowerCase() === user.email.toLowerCase())
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [orders, user]);

  const activeOrders = myOrders.filter((o) => isActiveOrder(o.status));
  const historyOrders = myOrders.filter((o) => !isActiveOrder(o.status));
  const visible =
    ordersTab === "active" ? activeOrders : ordersTab === "history" ? historyOrders : myOrders;

  if (!authReady || !user || user.role !== "client") {
    return (
      <main className="px-6 pt-40">
        <p className="text-mist">{t("loading")}</p>
      </main>
    );
  }

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!isAddressValid(addressFields, countryId)) return;
    await updateProfile({
      name,
      phone: addressFields.phone.trim(),
      cityId,
      address: formatDeliveryAddress(addressFields, { cityId, countryId, lang }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 pb-24 pt-28">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.32em] text-clay">{t("clientCabinet")}</p>
          <h1 className="mt-2 font-display text-5xl">{t("accountTitle")}</h1>
          <p className="mt-3 text-sm text-mist">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="border border-white/20 px-5 py-3 text-[10px] uppercase tracking-[0.2em] hover:border-clay"
        >
          {t("logout")}
        </button>
      </div>

      {/* Orders — primary focus */}
      <section className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-4xl">{t("myOrders")}</h2>
            <p className="mt-2 text-sm text-mist">{t("myOrdersBody")}</p>
          </div>
          <div className="flex gap-6 text-sm text-mist">
            <span>
              {t("ordersActive")}: <span className="text-clay">{activeOrders.length}</span>
            </span>
            <span>
              {t("ordersHistory")}: {historyOrders.length}
            </span>
          </div>
        </div>

        <nav className="mt-8 flex flex-wrap gap-2">
          {(
            [
              ["active", t("ordersActive"), activeOrders.length],
              ["history", t("ordersHistory"), historyOrders.length],
              ["all", t("ordersAll"), myOrders.length],
            ] as const
          ).map(([id, label, n]) => (
            <button
              key={id}
              type="button"
              onClick={() => setOrdersTab(id)}
              className={`px-3 py-2 text-[10px] uppercase tracking-[0.18em] ${
                ordersTab === id ? "bg-paper text-ink" : "border border-white/15 hover:border-white/40"
              }`}
            >
              {label}
              <span className="ml-2 opacity-60">{n}</span>
            </button>
          ))}
        </nav>

        <div className="mt-8 space-y-4">
          {visible.length === 0 && (
            <div className="border border-white/10 px-6 py-10">
              <p className="text-mist">
                {ordersTab === "active" ? t("noActiveOrders") : t("noClientOrders")}
              </p>
              <Link
                href="/studio"
                className="mt-6 inline-block text-[11px] uppercase tracking-[0.22em] text-clay"
              >
                {t("createADesign")}
              </Link>
            </div>
          )}
          {visible.map((o) => (
            <ClientOrderCard key={o.id} order={o} />
          ))}
        </div>
      </section>

      {/* Profile */}
      <section className="mt-20 border-t border-white/10 pt-12">
        <h2 className="font-display text-3xl">{t("profile")}</h2>
        <form onSubmit={onSave} className="mt-6 grid max-w-xl gap-4">
          <label className="block text-[10px] uppercase tracking-[0.2em] text-mist">
            {t("name")}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full border border-white/15 bg-transparent px-3 py-3 text-sm outline-none focus:border-clay"
            />
          </label>
          <CountryCitySelect
            countryId={countryId}
            cityId={cityId}
            onCountryChange={setCountryId}
            onCityChange={(id) => setCityId(normalizeCityId(id))}
          />
          <AddressForm
            countryId={countryId}
            cityId={cityId}
            value={addressFields}
            onChange={setAddressFields}
          />
          <button
            type="submit"
            className="w-fit bg-paper px-6 py-3 text-[11px] uppercase tracking-[0.22em] text-ink hover:bg-clay hover:text-paper"
          >
            {t("saveProfile")}
          </button>
          {saved && <p className="text-sm text-clay">{t("profileSaved")}</p>}
        </form>
      </section>
    </main>
  );
}

"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import QuickAuth from "@/components/QuickAuth";
import { CountryCitySelect } from "@/components/CountryCitySelect";
import { AddressForm } from "@/components/AddressForm";
import {
  EMPTY_ADDRESS,
  formatDeliveryAddress,
  isAddressValid,
  parseDeliveryAddress,
  type AddressFields,
} from "@/lib/address";
import {
  DEFAULT_CITY_ID,
  DEFAULT_COUNTRY_ID,
  normalizeCityId,
  type CityId,
  type CountryId,
} from "@/lib/dispatch/cities";
import { homeForRole, useAuth, useAuthHydrated } from "@/lib/auth/store";
import type { UserRole } from "@/lib/auth/types";
import { useLang, useT } from "@/lib/i18n";

function RegisterForm() {
  const t = useT();
  const lang = useLang((s) => s.lang);
  const router = useRouter();
  const search = useSearchParams();
  const authReady = useAuthHydrated();

  const initialRole = (search.get("role") as UserRole) || "client";
  const [role, setRole] = useState<UserRole>(initialRole === "partner" ? "partner" : "client");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [cityId, setCityId] = useState<CityId>(DEFAULT_CITY_ID);
  const [countryId, setCountryId] = useState<CountryId>(DEFAULT_COUNTRY_ID);
  const [addressFields, setAddressFields] = useState<AddressFields>(EMPTY_ADDRESS);
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!authReady) return;
    setError("");
    if (role === "partner" && !isAddressValid(addressFields, countryId)) {
      setError(t("authInvalid"));
      return;
    }
    if (role === "partner") {
      const res = useAuth.getState().registerPartner({
        name,
        email,
        phone,
        password,
        cityId,
        companyName,
        address: formatDeliveryAddress(addressFields, { cityId, countryId, lang }),
      });
      if (!res.ok) {
        setError(res.error === "exists" ? t("authEmailExists") : t("authInvalid"));
        return;
      }
      router.replace(homeForRole("partner"));
      return;
    }
    const res = useAuth.getState().registerClient({
      name,
      email,
      phone,
      password,
      cityId,
      address: addressFields.line1
        ? formatDeliveryAddress(addressFields, { cityId, countryId, lang })
        : undefined,
    });
    if (!res.ok) {
      setError(res.error === "exists" ? t("authEmailExists") : t("authInvalid"));
      return;
    }
    router.replace(homeForRole("client"));
  };

  return (
    <main className="mx-auto min-h-screen max-w-lg px-6 pb-24 pt-28">
      <p className="text-[10px] uppercase tracking-[0.32em] text-clay">{t("authPortal")}</p>
      <h1 className="mt-3 font-display text-5xl">{t("registerTitle")}</h1>
      <p className="mt-3 text-sm text-mist">{t("registerBody")}</p>

      <div className="mt-8 flex gap-2">
        <button
          type="button"
          onClick={() => setRole("client")}
          className={`flex-1 px-3 py-3 text-[10px] uppercase tracking-[0.18em] ${
            role === "client" ? "bg-paper text-ink" : "border border-white/15"
          }`}
        >
          {t("roleClient")}
        </button>
        <button
          type="button"
          onClick={() => setRole("partner")}
          className={`flex-1 px-3 py-3 text-[10px] uppercase tracking-[0.18em] ${
            role === "partner" ? "bg-paper text-ink" : "border border-white/15"
          }`}
        >
          {t("rolePartner")}
        </button>
      </div>

      {role === "client" && (
        <div className="mt-8">
          <QuickAuth
            onSuccess={(user) => router.replace(homeForRole(user.role))}
            onError={(msg) => setError(msg)}
          />
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <label className="block text-[10px] uppercase tracking-[0.22em] text-mist">
          {t("name")}
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full border border-white/15 bg-transparent px-3 py-3 text-sm outline-none focus:border-clay"
          />
        </label>
        {role === "partner" && (
          <label className="block text-[10px] uppercase tracking-[0.22em] text-mist">
            {t("companyName")}
            <input
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-2 w-full border border-white/15 bg-transparent px-3 py-3 text-sm outline-none focus:border-clay"
            />
          </label>
        )}
        <label className="block text-[10px] uppercase tracking-[0.22em] text-mist">
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full border border-white/15 bg-transparent px-3 py-3 text-sm outline-none focus:border-clay"
          />
        </label>
        <label className="block text-[10px] uppercase tracking-[0.22em] text-mist">
          {t("phone")}
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-2 w-full border border-white/15 bg-transparent px-3 py-3 text-sm outline-none focus:border-clay"
          />
        </label>
        <label className="block text-[10px] uppercase tracking-[0.22em] text-mist">
          {t("password")}
          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          required={role === "partner"}
        />
        {role === "partner" && (
          <p className="text-xs text-mist">{t("partnerRegisterNote")}</p>
        )}
        {error && <p className="text-sm text-clay">{error}</p>}
        <button
          type="submit"
          disabled={!authReady}
          className="w-full bg-paper py-4 text-[11px] uppercase tracking-[0.28em] text-ink hover:bg-clay hover:text-paper disabled:opacity-50"
        >
          {t("registerSubmit")}
        </button>
      </form>

      <p className="mt-8 text-sm text-mist">
        {t("haveAccount")}{" "}
        <Link href="/login" className="text-clay hover:underline">
          {t("loginLink")}
        </Link>
      </p>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<main className="px-6 pt-40 text-mist">…</main>}>
      <RegisterForm />
    </Suspense>
  );
}

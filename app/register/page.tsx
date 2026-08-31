"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import QuickAuth from "@/components/QuickAuth";
import { BrandInText } from "@/components/BrandMark";
import { CountryCitySelect } from "@/components/CountryCitySelect";
import { AddressForm } from "@/components/AddressForm";
import {
  EMPTY_ADDRESS,
  formatDeliveryAddress,
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
import { authErrorKey } from "@/lib/auth/errors";
import { useLang, useT } from "@/lib/i18n";

function RegisterForm() {
  const t = useT();
  const lang = useLang((s) => s.lang);
  const router = useRouter();
  const search = useSearchParams();
  const authReady = useAuthHydrated();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [cityId, setCityId] = useState<CityId>(DEFAULT_CITY_ID);
  const [countryId, setCountryId] = useState<CountryId>(DEFAULT_COUNTRY_ID);
  const [addressFields, setAddressFields] = useState<AddressFields>(EMPTY_ADDRESS);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (search.get("role") === "partner") {
      router.replace("/login?role=partner");
    }
  }, [search, router]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!authReady || submitting) return;

    const form = e.currentTarget;
    if (!form.reportValidity()) return;

    setSubmitting(true);
    setError("");
    try {
      if (password.trim().length < 6) {
        setError(t("authPasswordShort"));
        return;
      }
      const res = await useAuth.getState().registerClient({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        cityId,
        address: addressFields.line1
          ? formatDeliveryAddress(addressFields, { cityId, countryId, lang })
          : undefined,
      });
      if (!res.ok) {
        setError(t(authErrorKey(res.error)));
        return;
      }
      router.replace(homeForRole("client"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-lg px-6 pb-24 pt-28">
      <p className="text-[10px] uppercase tracking-[0.32em] text-clay">
        <BrandInText text={t("authPortal")} />
      </p>
      <h1 className="mt-3 font-display text-5xl">{t("registerTitle")}</h1>
      <p className="mt-3 text-sm text-mist">{t("registerBody")}</p>

      <div className="mt-8">
        <QuickAuth
          onSuccess={(user) => router.replace(homeForRole(user.role))}
          onError={(msg) => setError(msg)}
        />
      </div>

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
          required={false}
          variant="delivery"
        />
        {error && <p className="text-sm text-clay">{error}</p>}
        <button
          type="submit"
          disabled={!authReady || submitting}
          className="w-full bg-paper py-4 text-[11px] uppercase tracking-[0.28em] text-ink hover:bg-clay hover:text-paper disabled:opacity-50"
        >
          {submitting ? t("signingIn") : t("registerSubmit")}
        </button>
      </form>

      <p className="mt-6 text-xs text-mist">
        {t("partnerLoginNote")}{" "}
        <Link href="/login?role=partner" className="text-clay hover:underline">
          {t("rolePartner")}
        </Link>
      </p>

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

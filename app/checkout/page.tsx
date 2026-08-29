"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSessionUser, useAuthHydrated } from "@/lib/auth/store";
import { formatPrice } from "@/lib/catalog";
import { CITIES, cityLabel } from "@/lib/dispatch/cities";
import { rankPartnersGeoFirst } from "@/lib/dispatch/scoring";
import { useDispatch } from "@/lib/dispatch/store";
import type { CityId, PrintMethod } from "@/lib/dispatch/types";
import { useLang, useT, type DictKey } from "@/lib/i18n";
import {
  SERVICE_FEE_SOM,
  clientTotalForPartner,
  clientUnitPrice,
  partnerUnitPrice,
} from "@/lib/pricing";
import { useShop } from "@/lib/store";

export default function CheckoutPage() {
  const t = useT();
  const lang = useLang((s) => s.lang);
  const router = useRouter();
  const user = useSessionUser();
  const authReady = useAuthHydrated();
  const cart = useShop((s) => s.cart);
  const clearCart = useShop((s) => s.clearCart);
  const partners = useDispatch((s) => s.partners);
  const settings = useDispatch((s) => s.settings);
  const createAndDispatch = useDispatch((s) => s.createAndDispatch);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [cityId, setCityId] = useState<CityId>("dushanbe");
  const [printMethod, setPrintMethod] = useState<PrintMethod>("dtg");

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
    setAddress(user.address);
    setCityId(user.cityId);
  }, [user]);

  const quote = useMemo(() => {
    if (!cart.length) return null;
    const productIds = [...new Set(cart.map((i) => i.productId))];
    const qty = cart.reduce((n, i) => n + i.qty, 0);
    const city = CITIES.find((c) => c.id === cityId)!;
    const ranked = rankPartnersGeoFirst(
      partners,
      {
        cityId,
        clientLat: city.lat,
        clientLng: city.lng,
        productIds,
        qty,
        printMethod,
      },
      settings
    );
    const best = ranked[0];
    if (!best) return null;
    const totals = clientTotalForPartner(best.partner, cart);
    if (!totals) return null;
    return { partner: best.partner, ...totals };
  }, [cart, cityId, printMethod, partners, settings]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== "client") {
      router.push("/login?next=/checkout");
      return;
    }
    if (!cart.length || !quote) return;
    const id = createAndDispatch({
      userId: user.id,
      name,
      email,
      address,
      cityId,
      items: cart,
      total: quote.total,
      printMethod,
    });
    clearCart();
    router.push(`/order/${id}`);
  };

  if (!cart.length) {
    return (
      <main className="px-6 pt-40">
        <p className="text-mist">{t("cartIsEmpty")}</p>
      </main>
    );
  }

  if (!authReady) {
    return (
      <main className="px-6 pt-40">
        <p className="text-mist">{t("loading")}</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-md px-6 pt-40">
        <h1 className="font-display text-4xl">{t("loginRequired")}</h1>
        <p className="mt-4 text-sm text-mist">{t("loginRequiredBody")}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/login?next=/checkout"
            className="bg-paper px-6 py-3 text-[11px] uppercase tracking-[0.22em] text-ink hover:bg-clay hover:text-paper"
          >
            {t("loginSubmit")}
          </Link>
          <Link
            href="/register?role=client"
            className="border border-white/20 px-6 py-3 text-[11px] uppercase tracking-[0.22em] hover:border-clay"
          >
            {t("registerLink")}
          </Link>
        </div>
      </main>
    );
  }

  if (user.role !== "client") {
    return (
      <main className="px-6 pt-40">
        <p className="text-mist">{t("clientsOnlyCheckout")}</p>
        <Link href="/account" className="mt-4 inline-block text-clay">
          {t("accountNav")}
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-5xl gap-16 px-6 pb-24 pt-32 md:grid-cols-2">
      <form onSubmit={onSubmit} className="space-y-6">
        <h1 className="font-display text-5xl">{t("produceThis")}</h1>
        <p className="text-sm text-mist">{t("checkoutDispatchBody")}</p>
        <label className="block text-[10px] uppercase tracking-[0.22em] text-mist">
          {t("name")}
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full border border-white/15 bg-transparent px-3 py-3 text-sm text-paper outline-none focus:border-clay"
          />
        </label>
        <label className="block text-[10px] uppercase tracking-[0.22em] text-mist">
          {t("email")}
          <input
            required
            type="email"
            value={email}
            readOnly
            className="mt-2 w-full border border-white/15 bg-transparent px-3 py-3 text-sm text-mist outline-none"
          />
        </label>
        <label className="block text-[10px] uppercase tracking-[0.22em] text-mist">
          {t("city")}
          <select
            value={cityId}
            onChange={(e) => setCityId(e.target.value as CityId)}
            className="mt-2 w-full border border-white/15 bg-ink px-3 py-3 text-sm text-paper outline-none focus:border-clay"
          >
            {CITIES.map((c) => (
              <option key={c.id} value={c.id}>
                {cityLabel(c.id, lang)}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[10px] uppercase tracking-[0.22em] text-mist">
          {t("address")}
          <textarea
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            className="mt-2 w-full border border-white/15 bg-transparent px-3 py-3 text-sm text-paper outline-none focus:border-clay"
          />
        </label>
        <label className="block text-[10px] uppercase tracking-[0.22em] text-mist">
          {t("printMethod")}
          <select
            value={printMethod}
            onChange={(e) => setPrintMethod(e.target.value as PrintMethod)}
            className="mt-2 w-full border border-white/15 bg-ink px-3 py-3 text-sm text-paper outline-none focus:border-clay"
          >
            {(["dtg", "screen", "embroidery", "vinyl", "sublimation"] as PrintMethod[]).map((m) => (
              <option key={m} value={m}>
                {m.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={!quote}
          className="bg-paper px-10 py-4 text-[11px] uppercase tracking-[0.28em] text-ink hover:bg-clay hover:text-paper disabled:opacity-40"
        >
          {t("confirmOrder")}
          {quote ? ` · ${formatPrice(quote.total)}` : ""}
        </button>
        {!quote && <p className="text-sm text-clay">{t("noPartnerForQuote")}</p>}
      </form>
      <aside className="border border-white/10 p-8">
        <p className="text-[10px] uppercase tracking-[0.28em] text-mist">{t("toProduce")}</p>
        <ul className="mt-6 space-y-4 text-sm">
          {cart.map((i) => {
            const partnerPrice = quote ? partnerUnitPrice(quote.partner, i.productId) : null;
            const clientPrice = quote ? clientUnitPrice(quote.partner, i.productId) : null;
            return (
              <li key={i.id} className="border-b border-white/10 pb-4">
                <div className="flex justify-between gap-4">
                  <span>
                    {t(`product_${i.productId}` as DictKey)} × {i.qty}
                  </span>
                  <span>{clientPrice != null ? formatPrice(clientPrice * i.qty) : "—"}</span>
                </div>
                {partnerPrice != null && clientPrice != null && (
                  <p className="mt-2 text-xs text-mist">
                    {t("priceBreakdown")
                      .replace("{partner}", formatPrice(partnerPrice))
                      .replace("{fee}", formatPrice(SERVICE_FEE_SOM))
                      .replace("{client}", formatPrice(clientPrice))}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
        {quote && (
          <div className="mt-6 space-y-2 border-t border-white/10 pt-6 text-sm">
            <div className="flex justify-between text-mist">
              <span>{t("partnerProduction")}</span>
              <span>{formatPrice(quote.production)}</span>
            </div>
            <div className="flex justify-between text-mist">
              <span>
                {t("serviceFee")} ({SERVICE_FEE_SOM} × {quote.units})
              </span>
              <span>{formatPrice(quote.service)}</span>
            </div>
            <div className="flex justify-between font-display text-2xl">
              <span>{t("total")}</span>
              <span>{formatPrice(quote.total)}</span>
            </div>
          </div>
        )}
        <p className="mt-8 text-xs leading-relaxed text-mist">{t("checkoutPartnerNote")}</p>
      </aside>
    </main>
  );
}

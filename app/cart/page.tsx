"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/catalog";
import { isPartnerDispatchEnabled } from "@/lib/dispatch/config";
import { useDispatch } from "@/lib/dispatch/store";
import { useT, type DictKey } from "@/lib/i18n";
import { SERVICE_FEE_SOM, clientUnitPriceFromCatalog, minClientUnitPrice } from "@/lib/pricing";
import { useShop } from "@/lib/store";

export default function CartPage() {
  const t = useT();
  const cart = useShop((s) => s.cart);
  const remove = useShop((s) => s.removeFromCart);
  const setQty = useShop((s) => s.setQty);
  const partners = useDispatch((s) => s.partners);
  const manualMode = !isPartnerDispatchEnabled();

  const lines = cart.map((item) => {
    const from = manualMode
      ? clientUnitPriceFromCatalog(item.productId)
      : minClientUnitPrice(partners, item.productId);
    return { item, unit: from, line: from != null ? from * item.qty : null };
  });
  const total = lines.every((l) => l.line != null)
    ? lines.reduce((n, l) => n + (l.line ?? 0), 0)
    : null;

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 pb-24 pt-32">
      <h1 className="font-display text-6xl">{t("cartTitle")}</h1>
      <p className="mt-3 text-sm text-mist">{manualMode ? t("cartPriceHintManual") : t("cartPriceHint")}</p>

      {cart.length === 0 ? (
        <div className="mt-16">
          <p className="text-mist">{t("cartEmpty")}</p>
          <Link href="/studio" className="mt-6 inline-block text-[11px] uppercase tracking-[0.28em] text-clay">
            {t("createADesign")}
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-12 divide-y divide-white/10">
            {lines.map(({ item, unit, line }) => (
              <li key={item.id} className="flex flex-wrap items-start justify-between gap-6 py-8">
                <div>
                  <p className="font-display text-3xl">{t(`product_${item.productId}` as DictKey)}</p>
                  <p className="mt-2 text-sm text-mist">
                    {t(`color_${item.colorId}` as DictKey)} · {item.size} · {item.layers.length}{" "}
                    {item.layers.length === 1 ? t("mark") : t("marksWord")}
                  </p>
                  {unit != null && (
                    <p className="mt-2 text-xs text-mist">
                      {t("fromPrice").replace("{price}", formatPrice(unit))} · {t("includesServiceFee").replace("{fee}", formatPrice(SERVICE_FEE_SOM))}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-6">
                  <label className="text-[10px] uppercase tracking-widest text-mist">
                    {t("qty")}
                    <input
                      type="number"
                      min={1}
                      value={item.qty}
                      onChange={(e) => setQty(item.id, Number(e.target.value))}
                      className="ml-2 w-14 border border-white/15 bg-transparent px-2 py-1 text-paper"
                    />
                  </label>
                  <p>{line != null ? formatPrice(line) : "—"}</p>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    className="text-[11px] uppercase tracking-widest text-mist hover:text-clay"
                  >
                    {t("remove")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-8">
            <p className="text-sm text-mist">{t("totalApprox")}</p>
            <p className="font-display text-4xl">{total != null ? formatPrice(total) : "—"}</p>
          </div>
          <Link
            href="/checkout"
            className="mt-10 inline-block bg-paper px-10 py-4 text-[11px] uppercase tracking-[0.28em] text-ink hover:bg-clay hover:text-paper"
          >
            {t("placeOrder")}
          </Link>
        </>
      )}
    </main>
  );
}

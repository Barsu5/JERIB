"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { useSessionUser, useAuthHydrated } from "@/lib/auth/store";
import { useShop } from "@/lib/store";
import { LANGS, useLang, useT } from "@/lib/i18n";
import { useHasHydrated } from "@/lib/useHasHydrated";

export function Header() {
  const pathname = usePathname();
  const hydrated = useHasHydrated();
  const authReady = useAuthHydrated();
  const count = useShop((s) => s.cart.reduce((n, i) => n + i.qty, 0));
  const studio = pathname.startsWith("/studio");
  const lang = useLang((s) => s.lang);
  const setLang = useLang((s) => s.setLang);
  const t = useT();
  const user = useSessionUser();

  const showUser = hydrated && authReady ? user : null;
  const showCount = hydrated ? count : 0;

  const accountHref =
    showUser?.role === "partner"
      ? "/partner"
      : showUser?.role === "admin"
        ? "/admin"
        : "/account";

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/5 bg-ink/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 text-paper">
        <BrandMark />
        <nav className="flex flex-wrap items-center justify-end gap-4 text-[11px] uppercase tracking-[0.22em] sm:gap-6">
          <div className="flex items-center gap-1.5 normal-case tracking-[0.12em]">
            {LANGS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLang(l.id)}
                className={`px-1.5 py-0.5 ${lang === l.id ? "text-gold" : "text-mist hover:text-paper"}`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <Link href="/studio" className={studio ? "text-gold" : "hover:text-gold"}>
            {t("create")}
          </Link>
          {(!showUser || showUser.role === "client") && (
            <Link href="/cart" className="relative hover:text-gold">
              {t("cart")}
              {showCount > 0 && (
                <span className="absolute -right-4 -top-2 text-[10px] text-clay">{showCount}</span>
              )}
            </Link>
          )}
          {showUser ? (
            <Link
              href={accountHref}
              className={pathname.startsWith(accountHref) ? "text-gold" : "hover:text-gold"}
            >
              {showUser.role === "partner"
                ? t("partnerNav")
                : showUser.role === "admin"
                  ? t("adminNav")
                  : t("accountNav")}
            </Link>
          ) : (
            <>
              <Link href="/login" className="hover:text-gold">
                {t("loginLink")}
              </Link>
              <Link href="/register" className="hover:text-gold">
                {t("registerLink")}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

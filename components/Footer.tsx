"use client";

import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { useT } from "@/lib/i18n";

export function Footer() {
  const t = useT();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <BrandMark />
          <p className="mt-4 text-sm leading-relaxed">{t("footerTagline")}</p>
        </div>
        <nav className="flex flex-wrap gap-x-10 gap-y-4 text-sm font-medium text-slate-900">
          <Link href="/studio" className="hover:text-clay">
            {t("footerStudio")}
          </Link>
          <Link href="/login" className="hover:text-clay">
            {t("footerLogin")}
          </Link>
          <Link href="/register" className="hover:text-clay">
            {t("footerRegister")}
          </Link>
        </nav>
      </div>
      <div className="border-t border-slate-100 px-6 py-4 text-center text-xs text-slate-400">
        © {year} JIRIB. {t("footerRights")}
      </div>
    </footer>
  );
}

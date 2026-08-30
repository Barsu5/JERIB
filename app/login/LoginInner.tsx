"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import QuickAuth from "@/components/QuickAuth";
import { DEMO_ACCOUNTS, homeForRole, useAuth, useAuthHydrated } from "@/lib/auth/store";
import { authErrorKey } from "@/lib/auth/errors";
import { useT } from "@/lib/i18n";

export default function LoginInner() {
  const t = useT();
  const router = useRouter();
  const search = useSearchParams();
  const authReady = useAuthHydrated();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const afterAuth = (role: "client" | "partner" | "admin") => {
    const next = search.get("next");
    router.replace(next || homeForRole(role));
  };

  const go = async (mail: string, pass: string) => {
    if (!authReady || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await useAuth.getState().login(mail, pass);
      if (!res.ok) {
        setError(t(authErrorKey(res.error)));
        return;
      }
      afterAuth(res.user.role);
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await go(email, password);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 pb-24 pt-28">
      <p className="text-[10px] uppercase tracking-[0.32em] text-clay">{t("authPortal")}</p>
      <h1 className="mt-3 font-display text-5xl">{t("loginTitle")}</h1>
      <p className="mt-3 text-sm text-mist">{t("loginBody")}</p>

      <div className="mt-10">
        <QuickAuth
          onSuccess={(user) => afterAuth(user.role)}
          onError={(msg) => setError(msg)}
        />
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
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
          {t("password")}
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full border border-white/15 bg-transparent px-3 py-3 text-sm outline-none focus:border-clay"
          />
        </label>
        {error && <p className="text-sm text-clay">{error}</p>}
        <button
          type="submit"
          disabled={!authReady || submitting}
          className="w-full bg-paper py-4 text-[11px] uppercase tracking-[0.28em] text-ink hover:bg-clay hover:text-paper disabled:opacity-50"
        >
          {submitting ? t("signingIn") : t("loginSubmit")}
        </button>
      </form>

      <p className="mt-8 text-sm text-mist">
        {t("noAccount")}{" "}
        <Link href="/register" className="text-clay hover:underline">
          {t("registerLink")}
        </Link>
      </p>

      <div className="mt-10 border border-white/10 p-4 text-xs leading-relaxed text-mist">
        <p className="text-[10px] uppercase tracking-[0.2em] text-clay">{t("demoAccounts")}</p>
        <ul className="mt-4 space-y-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <li key={acc.email}>
              <button
                type="button"
                disabled={!authReady || submitting}
                onClick={() => {
                  setEmail(acc.email);
                  setPassword(acc.password);
                  setError("");
                  void go(acc.email, acc.password);
                }}
                className={`w-full border px-3 py-3 text-left transition hover:border-clay disabled:opacity-50 ${
                  acc.role === "partner" ? "border-clay/50 text-paper" : "border-white/15"
                }`}
              >
                <span className="block text-[10px] uppercase tracking-[0.18em] text-clay">
                  {acc.role === "partner"
                    ? t("demoPartner")
                    : acc.role === "client"
                      ? t("demoClient")
                      : t("demoAdmin")}
                </span>
                <span className="mt-1 block">
                  {acc.email} / {acc.password}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

"use client";

import { FormEvent, useState } from "react";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { hasGoogleClientId } from "@/components/GoogleAuthProvider";
import { useAuth, useAuthHydrated } from "@/lib/auth/store";
import type { PublicUser } from "@/lib/auth/types";
import { useT } from "@/lib/i18n";

type Props = {
  onSuccess: (user: PublicUser) => void;
  onError?: (message: string) => void;
};

type DemoProvider = "apple" | "telegram";

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export default function QuickAuth({ onSuccess, onError }: Props) {
  const t = useT();
  const ready = useAuthHydrated();
  const googleConfigured = hasGoogleClientId();
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [phone, setPhone] = useState("+992");
  const [busy, setBusy] = useState<null | "google" | DemoProvider | "phone">(null);
  const [localError, setLocalError] = useState("");

  const fail = (msg: string) => {
    setLocalError(msg);
    onError?.(msg);
    setBusy(null);
  };

  const onDemoProvider = async (provider: DemoProvider) => {
    if (!ready || busy) return;
    setLocalError("");
    setBusy(provider);
    try {
      await wait(350);
      const res = useAuth.getState().loginWithProvider(provider);
      if (!res.ok) {
        fail(t("authInvalid"));
        return;
      }
      onSuccess(res.user);
    } catch {
      fail(t("authInvalid"));
    } finally {
      setBusy(null);
    }
  };

  const onPhone = async (e: FormEvent) => {
    e.preventDefault();
    if (!ready || busy) return;
    setLocalError("");
    setBusy("phone");
    try {
      await wait(350);
      const res = useAuth.getState().loginWithPhone(phone);
      if (!res.ok) {
        fail(res.error === "invalid" ? t("authPhoneInvalid") : t("authInvalid"));
        return;
      }
      onSuccess(res.user);
    } catch {
      fail(t("authInvalid"));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-mist">
        <span className="h-px flex-1 bg-white/10" />
        {t("orQuickAuth")}
        <span className="h-px flex-1 bg-white/10" />
      </div>

      {!ready && <p className="text-xs text-mist">{t("loading")}</p>}

      <div className="grid gap-2">
        {googleConfigured ? (
          <GoogleSignInButton
            disabled={!ready || (busy !== null && busy !== "google")}
            busy={busy === "google"}
            onBusy={(v) => {
              setBusy(v ? "google" : null);
              if (v) setLocalError("");
            }}
            onSuccess={onSuccess}
            onError={fail}
          />
        ) : (
          <button
            type="button"
            disabled={!ready || busy !== null}
            onClick={() => fail(t("googleClientMissing"))}
            className="flex w-full items-center gap-3 border border-white/15 px-3 py-3 text-left text-sm transition hover:border-clay disabled:opacity-50"
          >
            <span className="flex h-8 w-8 items-center justify-center border border-white/20 text-[11px] font-medium tracking-wide text-paper">
              G
            </span>
            <span className="text-[11px] uppercase tracking-[0.18em]">{t("continueGoogle")}</span>
          </button>
        )}

        {(
          [
            { id: "apple" as const, labelKey: "continueApple" as const },
            { id: "telegram" as const, labelKey: "continueTelegram" as const },
          ] as const
        ).map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={!ready || busy !== null}
            onClick={() => void onDemoProvider(p.id)}
            className="flex w-full items-center gap-3 border border-white/15 px-3 py-3 text-left text-sm transition hover:border-clay disabled:opacity-50"
          >
            <span className="flex h-8 w-8 items-center justify-center border border-white/20 text-[11px] font-medium tracking-wide text-paper">
              {p.id === "apple" ? (
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                  <path d="M16.7 12.6c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.7-1.3-.1-2.5.8-3.1.8-.6 0-1.6-.8-2.7-.7-1.4.1-2.7.8-3.4 2.1-1.5 2.5-.4 6.3 1 8.3.7 1 1.5 2.1 2.6 2 1-.1 1.4-.7 2.7-.7s1.6.7 2.7.6c1.1-.1 1.8-1 2.5-2 .8-1.1 1.1-2.2 1.1-2.3-.1 0-2.1-.8-2.2-3.2zM14.5 6.4c.6-.7 1-1.7.9-2.7-1.1.1-2.1.6-2.7 1.3-.5.6-1 1.7-.9 2.6 1.1.1 2.1-.4 2.7-1.2z" />
                </svg>
              ) : (
                "TG"
              )}
            </span>
            <span className="text-[11px] uppercase tracking-[0.18em]">
              {busy === p.id ? t("signingIn") : t(p.labelKey)}
            </span>
          </button>
        ))}

        <button
          type="button"
          disabled={!ready || busy !== null}
          onClick={() => setPhoneOpen((v) => !v)}
          className="flex w-full items-center gap-3 border border-white/15 px-3 py-3 text-left text-sm transition hover:border-clay disabled:opacity-50"
        >
          <span className="flex h-8 w-8 items-center justify-center border border-white/20 text-[11px] tracking-wide text-paper">
            #
          </span>
          <span className="text-[11px] uppercase tracking-[0.18em]">{t("continuePhone")}</span>
        </button>
      </div>

      {phoneOpen && (
        <form onSubmit={(e) => void onPhone(e)} className="space-y-3 border border-white/10 p-3">
          <p className="text-xs leading-relaxed text-mist">{t("continuePhoneHint")}</p>
          <label className="block text-[10px] uppercase tracking-[0.22em] text-mist">
            {t("phone")}
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+992 XX XXX XX XX"
              className="mt-2 w-full border border-white/15 bg-transparent px-3 py-3 text-sm outline-none focus:border-clay"
            />
          </label>
          <button
            type="submit"
            disabled={!ready || busy !== null}
            className="w-full bg-paper py-3 text-[11px] uppercase tracking-[0.22em] text-ink hover:bg-clay hover:text-paper disabled:opacity-50"
          >
            {busy === "phone" ? t("signingIn") : t("continuePhoneSubmit")}
          </button>
        </form>
      )}

      {localError && <p className="text-sm text-clay">{localError}</p>}
      <p className="text-[10px] leading-relaxed text-mist/80">
        {googleConfigured ? t("googleAuthNote") : t("googleClientMissing")}
      </p>
    </div>
  );
}

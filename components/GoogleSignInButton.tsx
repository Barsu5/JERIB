"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { applyApiSession, ensureAuthBootstrap, syncDispatchForUser } from "@/lib/api/bootstrap";
import { useAuth } from "@/lib/auth/store";
import type { PublicUser } from "@/lib/auth/types";
import { useT } from "@/lib/i18n";

type Props = {
  disabled?: boolean;
  busy: boolean;
  onBusy: (busy: boolean) => void;
  onSuccess: (user: PublicUser) => void;
  onError: (message: string) => void;
};

/** Must render only under GoogleOAuthProvider */
export function GoogleSignInButton({ disabled, busy, onBusy, onSuccess, onError }: Props) {
  const t = useT();

  const googleLogin = useGoogleLogin({
    scope: "openid email profile",
    onSuccess: async (tokenResponse) => {
      onBusy(true);
      try {
        await ensureAuthBootstrap();
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ accessToken: tokenResponse.access_token }),
        });
        const data = (await res.json()) as {
          sub?: string;
          email?: string;
          name?: string;
          picture?: string | null;
          user?: PublicUser;
        };
        if (!res.ok || !data.sub || !data.email) {
          onError(t("googleAuthFailed"));
          return;
        }
        if (data.user) {
          applyApiSession(data.user);
          await syncDispatchForUser(data.user);
          onSuccess(data.user);
          return;
        }
        const auth = await useAuth.getState().loginWithGoogle({
          sub: data.sub,
          email: data.email,
          name: data.name || data.email,
          picture: data.picture || undefined,
        });
        if (!auth.ok) {
          onError(t("authInvalid"));
          return;
        }
        onSuccess(auth.user);
      } catch {
        onError(t("googleAuthFailed"));
      } finally {
        onBusy(false);
      }
    },
    onError: () => {
      onBusy(false);
      onError(t("googleAuthFailed"));
    },
    onNonOAuthError: () => {
      onBusy(false);
    },
  });

  return (
    <button
      type="button"
      disabled={disabled || busy}
      onClick={() => {
        onBusy(true);
        googleLogin();
      }}
      className="flex w-full items-center gap-3 border border-white/15 px-3 py-3 text-left text-sm transition hover:border-clay disabled:opacity-50"
    >
      <span className="flex h-8 w-8 items-center justify-center border border-white/20 text-[11px] font-medium tracking-wide text-paper">
        G
      </span>
      <span className="text-[11px] uppercase tracking-[0.18em]">
        {busy ? t("signingIn") : t("continueGoogle")}
      </span>
    </button>
  );
}

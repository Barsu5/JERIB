"use client";

import { checkHealth, apiFetchDispatch, fetchMe } from "@/lib/api/client";
import type { PublicUser } from "@/lib/auth/types";
import { useAuth } from "@/lib/auth/store";
import { useDispatch } from "@/lib/dispatch/store";

let bootPromise: Promise<void> | null = null;

async function fetchPublicPartners() {
  const res = await fetch("/api/partners", { credentials: "include" });
  if (!res.ok) return null;
  const data = (await res.json()) as { partners: ReturnType<typeof useDispatch.getState>["partners"] };
  return data.partners;
}

export async function syncDispatchForUser(user: PublicUser | null) {
  if (!user || !useAuth.getState().useApi) return;
  try {
    const data = await apiFetchDispatch();
    if (user.role === "admin") {
      useDispatch.setState({
        orders: data.orders,
        partners: data.partners ?? useDispatch.getState().partners,
        settings: data.settings ?? useDispatch.getState().settings,
      });
    } else if (user.role === "partner" && user.partnerId) {
      useDispatch.setState({
        orders: data.orders,
        activePartnerId: user.partnerId,
      });
    } else {
      useDispatch.setState({ orders: data.orders });
    }
  } catch {
    // Non-fatal — user is still logged in
  }
}

export function applyApiSession(user: PublicUser) {
  useAuth.getState().setUseApi(true);
  useAuth.getState().setSessionUser(user);
  useDispatch.getState().setUseApi(true);
  if (user.role === "partner" && user.partnerId) {
    useDispatch.setState({ activePartnerId: user.partnerId });
  }
}

async function runBootstrap() {
  try {
    const health = await checkHealth();
    if (!health.database) return;

    useAuth.getState().setUseApi(true);
    useDispatch.getState().setUseApi(true);

    const partners = await fetchPublicPartners();
    if (partners) useDispatch.setState({ partners });

    const me = await fetchMe().catch(() => ({ user: null }));
    if (me.user) {
      applyApiSession(me.user);
      await syncDispatchForUser(me.user);
    }
  } catch {
    // Stay on localStorage mode
  }
}

/** Wait until API vs localStorage mode is resolved (call before login/register). */
export function ensureAuthBootstrap(): Promise<void> {
  if (!bootPromise) bootPromise = runBootstrap();
  return bootPromise;
}

/** @deprecated use ensureAuthBootstrap */
export async function bootstrapApi() {
  await ensureAuthBootstrap();
}

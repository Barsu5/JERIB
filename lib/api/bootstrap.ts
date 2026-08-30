"use client";

import { checkHealth, fetchMe, apiFetchDispatch } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/store";
import { useDispatch } from "@/lib/dispatch/store";

let bootstrapped = false;

async function fetchPublicPartners() {
  const res = await fetch("/api/partners", { credentials: "include" });
  if (!res.ok) return null;
  const data = (await res.json()) as { partners: ReturnType<typeof useDispatch.getState>["partners"] };
  return data.partners;
}

export async function bootstrapApi() {
  if (bootstrapped) return;
  bootstrapped = true;

  try {
    const health = await checkHealth();
    if (!health.database) return;

    useAuth.getState().setUseApi(true);
    useDispatch.getState().setUseApi(true);

    const partners = await fetchPublicPartners();
    if (partners) useDispatch.setState({ partners });

    const me = await fetchMe().catch(() => ({ user: null }));
    useAuth.getState().setSessionUser(me.user);

    if (me.user) {
      const data = await apiFetchDispatch();
      if (me.user.role === "admin") {
        useDispatch.setState({
          orders: data.orders,
          partners: data.partners ?? partners ?? [],
          settings: data.settings ?? useDispatch.getState().settings,
        });
      } else if (me.user.role === "partner" && me.user.partnerId) {
        useDispatch.setState({
          orders: data.orders,
          activePartnerId: me.user.partnerId,
        });
      } else {
        useDispatch.setState({ orders: data.orders });
      }
    }
  } catch {
    // Stay on localStorage mode
  }
}

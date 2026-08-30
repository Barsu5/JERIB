import type { PublicUser, RegisterClientInput, CreatePartnerAccountInput } from "@/lib/auth/types";
import type { DispatchOrder, Partner, PlatformSettings } from "@/lib/dispatch/types";
import type { PrintMethod } from "@/lib/dispatch/types";
import type { CartItem } from "@/lib/types";

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: { error?: string; detail?: unknown }
  ) {
    super(body.error || `HTTP ${status}`);
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new ApiError(res.status, body as { error?: string });
  return body;
}

export async function checkHealth() {
  return apiFetch<{ ok: boolean; database: boolean }>("/api/health");
}

export async function fetchMe() {
  return apiFetch<{ user: PublicUser | null }>("/api/auth/me");
}

export async function apiLogin(email: string, password: string) {
  return apiFetch<{ user: PublicUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function apiLogout() {
  return apiFetch<{ ok: boolean }>("/api/auth/logout", { method: "POST" });
}

export async function apiRegisterClient(input: RegisterClientInput) {
  return apiFetch<{ user: PublicUser }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ ...input, role: "client" }),
  });
}

export async function apiCreatePartnerAccount(input: CreatePartnerAccountInput) {
  return apiFetch<{ partner: Partner; user: PublicUser }>("/api/partners/create", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function apiUpdateProfile(patch: Partial<Pick<PublicUser, "name" | "phone" | "cityId" | "address">>) {
  return apiFetch<{ user: PublicUser }>("/api/auth/profile", {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function apiFetchDispatch() {
  return apiFetch<{
    orders: DispatchOrder[];
    partners?: Partner[];
    settings?: PlatformSettings;
  }>("/api/orders");
}

export async function apiCreateOrder(input: {
  name: string;
  email: string;
  address: string;
  cityId: string;
  items: CartItem[];
  total: number;
  printMethod?: PrintMethod;
}) {
  return apiFetch<{ order: DispatchOrder }>("/api/orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function apiOrderAction(
  orderId: string,
  action: string,
  extra?: Record<string, unknown>
) {
  return apiFetch<{ order: DispatchOrder; orders?: DispatchOrder[] }>(`/api/orders/${orderId}`, {
    method: "PATCH",
    body: JSON.stringify({ action, ...extra }),
  });
}

export async function apiDispatchTick() {
  return apiFetch<{ orders: DispatchOrder[] }>("/api/partners", { method: "POST" });
}

export async function apiUpdatePartner(partnerId: string, patch: Record<string, unknown>) {
  return apiFetch<{ partner: Partner }>(`/api/partners/${partnerId}`, {
    method: "PATCH",
    body: JSON.stringify({ patch }),
  });
}

export async function apiSetPartnerApproval(partnerId: string, approval: string) {
  return apiFetch<{ partner: Partner }>(`/api/partners/${partnerId}`, {
    method: "PATCH",
    body: JSON.stringify({ action: "approval", approval }),
  });
}

export async function apiUpdateSettings(patch: Partial<PlatformSettings>) {
  return apiFetch<{ settings: PlatformSettings }>("/api/settings", {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

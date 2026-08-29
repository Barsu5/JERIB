"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cityById } from "@/lib/dispatch/cities";
import { useDispatch } from "@/lib/dispatch/store";
import type { Partner } from "@/lib/dispatch/types";
import type {
  AuthUser,
  GoogleProfileInput,
  OAuthProvider,
  PublicUser,
  RegisterClientInput,
  RegisterPartnerInput,
  UserRole,
} from "./types";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

/** Lightweight demo hash — not for production */
export function hashPassword(password: string) {
  let h = 5381;
  for (let i = 0; i < password.length; i++) h = (h * 33) ^ password.charCodeAt(i);
  return `j${(h >>> 0).toString(16)}`;
}

function toPublic(u: AuthUser): PublicUser {
  const { passwordHash: _, ...rest } = u;
  return rest;
}

const DEMO_PASS = hashPassword("demo123");

/** Public demo credentials shown on the login page */
export const DEMO_ACCOUNTS = [
  {
    role: "client" as const,
    email: "client@jerib.tj",
    password: "demo123",
    label: "Client",
  },
  {
    role: "partner" as const,
    email: "partner@jerib.tj",
    password: "demo123",
    label: "Partner · Atlas Print",
  },
  {
    role: "admin" as const,
    email: "admin@jerib.tj",
    password: "demo123",
    label: "Admin",
  },
];

const SEED_USERS: AuthUser[] = [
  {
    id: "u-admin",
    role: "admin",
    name: "Jerib Admin",
    email: "admin@jerib.tj",
    phone: "+992900000001",
    passwordHash: DEMO_PASS,
    cityId: "dushanbe",
    address: "Jerib HQ",
    partnerId: null,
    provider: "email",
    providerId: null,
    createdAt: Date.now(),
  },
  {
    id: "u-client-demo",
    role: "client",
    name: "Алишер Рахимов",
    email: "client@jerib.tj",
    phone: "+992900000010",
    passwordHash: DEMO_PASS,
    cityId: "dushanbe",
    address: "ул. Рудаки 10, Душанбе",
    partnerId: null,
    provider: "email",
    providerId: null,
    createdAt: Date.now(),
  },
  {
    id: "u-partner-demo",
    role: "partner",
    name: "Демо Партнёр",
    email: "partner@jerib.tj",
    phone: "+992900000020",
    passwordHash: DEMO_PASS,
    cityId: "dushanbe",
    address: "ул. Рудаки 45, Душанбе",
    partnerId: "p-dsb-atlas",
    provider: "email",
    providerId: null,
    createdAt: Date.now(),
  },
  {
    id: "u-partner-atlas",
    role: "partner",
    name: "Atlas Manager",
    email: "atlas@jerib.tj",
    phone: "+992900000021",
    passwordHash: DEMO_PASS,
    cityId: "dushanbe",
    address: "ул. Рудаки 45, Душанбе",
    partnerId: "p-dsb-atlas",
    provider: "email",
    providerId: null,
    createdAt: Date.now(),
  },
  {
    id: "u-partner-silk",
    role: "partner",
    name: "Silk Manager",
    email: "silk@jerib.tj",
    phone: "+992900000022",
    passwordHash: DEMO_PASS,
    cityId: "dushanbe",
    address: "пр. Исмоили Сомони 12",
    partnerId: "p-dsb-silk",
    provider: "email",
    providerId: null,
    createdAt: Date.now(),
  },
  {
    id: "u-partner-sughd",
    role: "partner",
    name: "Sughd Manager",
    email: "sughd@jerib.tj",
    phone: "+992900000030",
    passwordHash: DEMO_PASS,
    cityId: "khujand",
    address: "ул. Ленина 21",
    partnerId: "p-khj-sughd",
    provider: "email",
    providerId: null,
    createdAt: Date.now(),
  },
];

function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "").replace(/^00/, "+");
}

const OAUTH_PROFILES: Record<
  Exclude<OAuthProvider, "google">,
  { name: string; email: string; phone: string; providerId: string }
> = {
  apple: {
    name: "Apple User",
    email: "apple.user@jerib.oauth",
    phone: "+992900111002",
    providerId: "apple-demo",
  },
  telegram: {
    name: "Telegram User",
    email: "telegram.user@jerib.oauth",
    phone: "+992900111003",
    providerId: "telegram-demo",
  },
};

function mergeSeedUsers(stored: AuthUser[] | undefined): AuthUser[] {
  const list = (stored ? [...stored] : []).map((u) => ({
    ...u,
    provider: u.provider ?? ("email" as const),
    providerId: u.providerId ?? null,
  }));
  for (const seed of SEED_USERS) {
    const i = list.findIndex((u) => u.email === seed.email || u.id === seed.id);
    if (i >= 0) {
      list[i] = {
        ...list[i],
        ...seed,
        // keep user-chosen profile fields if they customized a non-seed account with same email — overwrite password/role for demos
        passwordHash: seed.passwordHash,
        role: seed.role,
        partnerId: seed.partnerId,
      };
    } else {
      list.push(seed);
    }
  }
  return list;
}

type AuthResult = { ok: true; user: PublicUser } | { ok: false; error: string };

type AuthState = {
  users: AuthUser[];
  sessionUserId: string | null;
  registerClient: (input: RegisterClientInput) => AuthResult;
  registerPartner: (input: RegisterPartnerInput) => AuthResult;
  login: (email: string, password: string) => AuthResult;
  /** Real Google Sign-In profile (from Google account picker) */
  loginWithGoogle: (profile: GoogleProfileInput) => AuthResult;
  /** Demo one-tap for apple / telegram only */
  loginWithProvider: (provider: Exclude<OAuthProvider, "google">) => AuthResult;
  /** Phone OTP-style client login (creates account if needed) */
  loginWithPhone: (phone: string) => AuthResult;
  logout: () => void;
  updateProfile: (
    patch: Partial<Pick<AuthUser, "name" | "phone" | "cityId" | "address">>
  ) => void;
  currentUser: () => PublicUser | null;
};

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      users: SEED_USERS,
      sessionUserId: null,

      currentUser: () => {
        const id = get().sessionUserId;
        if (!id) return null;
        const u = get().users.find((x) => x.id === id);
        return u ? toPublic(u) : null;
      },

      registerClient: (input) => {
        const email = input.email.trim().toLowerCase();
        if (!email || !input.password || input.password.length < 6) {
          return { ok: false, error: "invalid" };
        }
        if (get().users.some((u) => u.email === email)) {
          return { ok: false, error: "exists" };
        }
        const user: AuthUser = {
          id: `u-${uid()}`,
          role: "client",
          name: input.name.trim(),
          email,
          phone: input.phone.trim(),
          passwordHash: hashPassword(input.password),
          cityId: input.cityId,
          address: input.address?.trim() ?? "",
          partnerId: null,
          provider: "email",
          providerId: null,
          createdAt: Date.now(),
        };
        set({ users: [...get().users, user], sessionUserId: user.id });
        return { ok: true, user: toPublic(user) };
      },

      registerPartner: (input) => {
        const email = input.email.trim().toLowerCase();
        if (!email || !input.password || input.password.length < 6) {
          return { ok: false, error: "invalid" };
        }
        if (get().users.some((u) => u.email === email)) {
          return { ok: false, error: "exists" };
        }

        const partnerId = `p-${uid()}`;
        const city = cityById(input.cityId);
        const partner: Partner = {
          id: partnerId,
          name: input.companyName.trim(),
          cityId: input.cityId,
          address: input.address.trim(),
          lat: city.lat,
          lng: city.lng,
          serviceRadiusKm: 20,
          serviceCities: [input.cityId],
          acceptsRemoteDelivery: false,
          printMethods: ["dtg"],
          products: ["tshirt", "hoodie"],
          productionPrices: { tshirt: 90, hoodie: 170 },
          minOrderQty: 1,
          capacityUnits: 30,
          avgProductionHours: 24,
          workingHours: { open: 9, close: 18, days: [1, 2, 3, 4, 5] },
          currentLoad: 0,
          rating: 4,
          qualityScore: 80,
          completionRate: 1,
          cancelRate: 0,
          acceptingOrders: false,
          approval: "pending",
          commissionOverride: null,
          createdAt: Date.now(),
        };

        // Add partner into dispatch store
        useDispatch.setState((s) => ({ partners: [...s.partners, partner] }));

        const user: AuthUser = {
          id: `u-${uid()}`,
          role: "partner",
          name: input.name.trim(),
          email,
          phone: input.phone.trim(),
          passwordHash: hashPassword(input.password),
          cityId: input.cityId,
          address: input.address.trim(),
          partnerId,
          provider: "email",
          providerId: null,
          createdAt: Date.now(),
        };
        set({ users: [...get().users, user], sessionUserId: user.id });
        return { ok: true, user: toPublic(user) };
      },

      login: (email, password) => {
        const e = email.trim().toLowerCase();
        const user = get().users.find((u) => u.email === e);
        if (!user || user.passwordHash !== hashPassword(password)) {
          return { ok: false, error: "credentials" };
        }
        set({ sessionUserId: user.id });
        if (user.role === "partner" && user.partnerId) {
          useDispatch.setState({ activePartnerId: user.partnerId });
        }
        return { ok: true, user: toPublic(user) };
      },

      loginWithGoogle: (profile) => {
        const email = profile.email.trim().toLowerCase();
        const sub = profile.sub.trim();
        const name = (profile.name || email.split("@")[0] || "Google").trim();
        if (!email || !sub) return { ok: false, error: "invalid" };

        const byGoogle = get().users.find(
          (u) => u.provider === "google" && u.providerId === sub
        );
        if (byGoogle) {
          set({
            users: get().users.map((u) =>
              u.id === byGoogle.id ? { ...u, name, email } : u
            ),
            sessionUserId: byGoogle.id,
          });
          const updated = get().users.find((u) => u.id === byGoogle.id)!;
          return { ok: true, user: toPublic(updated) };
        }

        const byEmail = get().users.find((u) => u.email === email);
        if (byEmail) {
          set({
            users: get().users.map((u) =>
              u.id === byEmail.id
                ? {
                    ...u,
                    name: name || u.name,
                    provider: "google",
                    providerId: sub,
                  }
                : u
            ),
            sessionUserId: byEmail.id,
          });
          const updated = get().users.find((u) => u.id === byEmail.id)!;
          return { ok: true, user: toPublic(updated) };
        }

        const user: AuthUser = {
          id: `u-${uid()}`,
          role: "client",
          name,
          email,
          phone: "",
          passwordHash: hashPassword(`google:${sub}`),
          cityId: "dushanbe",
          address: "",
          partnerId: null,
          provider: "google",
          providerId: sub,
          createdAt: Date.now(),
        };
        set({ users: [...get().users, user], sessionUserId: user.id });
        return { ok: true, user: toPublic(user) };
      },

      loginWithProvider: (provider) => {
        const profile = OAUTH_PROFILES[provider];
        const existing = get().users.find(
          (u) => u.provider === provider && u.providerId === profile.providerId
        );
        if (existing) {
          set({ sessionUserId: existing.id });
          return { ok: true, user: toPublic(existing) };
        }
        const byEmail = get().users.find((u) => u.email === profile.email);
        if (byEmail) {
          set({
            users: get().users.map((u) =>
              u.id === byEmail.id
                ? { ...u, provider, providerId: profile.providerId }
                : u
            ),
            sessionUserId: byEmail.id,
          });
          return { ok: true, user: toPublic({ ...byEmail, provider, providerId: profile.providerId }) };
        }
        const user: AuthUser = {
          id: `u-${uid()}`,
          role: "client",
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          passwordHash: hashPassword(`oauth:${provider}:${profile.providerId}`),
          cityId: "dushanbe",
          address: "",
          partnerId: null,
          provider,
          providerId: profile.providerId,
          createdAt: Date.now(),
        };
        set({ users: [...get().users, user], sessionUserId: user.id });
        return { ok: true, user: toPublic(user) };
      },

      loginWithPhone: (phone) => {
        const normalized = normalizePhone(phone);
        if (normalized.replace(/\D/g, "").length < 9) {
          return { ok: false, error: "invalid" };
        }
        const existing = get().users.find(
          (u) =>
            (u.provider === "phone" && u.providerId === normalized) ||
            normalizePhone(u.phone) === normalized
        );
        if (existing) {
          set({
            users: get().users.map((u) =>
              u.id === existing.id
                ? { ...u, provider: u.provider === "email" ? "phone" : u.provider, providerId: u.providerId ?? normalized, phone: normalized }
                : u
            ),
            sessionUserId: existing.id,
          });
          const updated = get().users.find((u) => u.id === existing.id)!;
          return { ok: true, user: toPublic(updated) };
        }
        const user: AuthUser = {
          id: `u-${uid()}`,
          role: "client",
          name: normalized,
          email: `phone.${normalized.replace(/\D/g, "")}@jerib.oauth`,
          phone: normalized,
          passwordHash: hashPassword(`phone:${normalized}`),
          cityId: "dushanbe",
          address: "",
          partnerId: null,
          provider: "phone",
          providerId: normalized,
          createdAt: Date.now(),
        };
        set({ users: [...get().users, user], sessionUserId: user.id });
        return { ok: true, user: toPublic(user) };
      },

      logout: () => set({ sessionUserId: null }),

      updateProfile: (patch) => {
        const id = get().sessionUserId;
        if (!id) return;
        set({
          users: get().users.map((u) => (u.id === id ? { ...u, ...patch } : u)),
        });
      },
    }),
    {
      name: "jerib-auth",
      skipHydration: true,
      partialize: (s) => ({
        users: s.users,
        sessionUserId: s.sessionUserId,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<Pick<AuthState, "users" | "sessionUserId">>;
        return {
          ...current,
          users: mergeSeedUsers(p.users ?? current.users),
          sessionUserId: p.sessionUserId ?? current.sessionUserId,
        };
      },
    }
  )
);

/** True after jerib-auth has been rehydrated from localStorage */
export function useAuthHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const finish = () => setHydrated(true);
    if (useAuth.persist.hasHydrated()) {
      finish();
      return;
    }
    const unsub = useAuth.persist.onFinishHydration(finish);
    void useAuth.persist.rehydrate();
    return unsub;
  }, []);
  return hydrated;
}

export function useSessionUser(): PublicUser | null {
  const sessionUserId = useAuth((s) => s.sessionUserId);
  const users = useAuth((s) => s.users);
  if (!sessionUserId) return null;
  const u = users.find((x) => x.id === sessionUserId);
  return u ? toPublic(u) : null;
}

export function homeForRole(role: UserRole) {
  if (role === "partner") return "/partner";
  if (role === "admin") return "/admin";
  return "/account";
}

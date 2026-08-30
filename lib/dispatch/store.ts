"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  apiCreateOrder,
  apiDispatchTick,
  apiOrderAction,
  apiSetPartnerApproval,
  apiUpdatePartner,
  apiUpdateSettings,
} from "@/lib/api/client";
import type { CartItem } from "@/lib/types";
import { cityById } from "./cities";
import { calcFinance } from "./finance";
import { SEED_PARTNERS } from "./partners";
import { clientTotalForPartner } from "@/lib/pricing";
import { rankPartnersGeoFirst, type MatchContext } from "./scoring";
import type {
  AssignmentAttempt,
  CityId,
  DispatchOrder,
  Partner,
  PartnerApproval,
  PartnerOrderStatus,
  PlatformSettings,
  PrintMethod,
} from "./types";
import { DEFAULT_SETTINGS } from "./types";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function buildMatchCtx(order: DispatchOrder, excludeIds: string[]): MatchContext {
  const productIds = [...new Set(order.items.map((i) => i.productId))];
  const qty = order.items.reduce((n, i) => n + i.qty, 0);
  return {
    cityId: order.cityId,
    clientLat: order.clientLat,
    clientLng: order.clientLng,
    productIds,
    qty,
    printMethod: order.printMethod,
    excludeIds,
  };
}

function pushStatus(order: DispatchOrder, status: PartnerOrderStatus, at = Date.now()): DispatchOrder {
  const history = order.statusHistory ?? [];
  const last = history[history.length - 1];
  if (last?.status === status) return { ...order, status };
  return {
    ...order,
    status,
    statusHistory: [...history, { status, at }],
  };
}

function offerToPartner(
  order: DispatchOrder,
  partner: Partner,
  score: AssignmentAttempt["scoreBreakdown"],
  timeoutMs: number,
  now: number
): DispatchOrder {
  const attempt: AssignmentAttempt = {
    partnerId: partner.id,
    offeredAt: now,
    expiresAt: now + timeoutMs,
    outcome: "pending",
    score: score.total,
    scoreBreakdown: score,
  };
  const quote = clientTotalForPartner(partner, order.items);
  return pushStatus(
    {
      ...order,
      total: quote?.total ?? order.total,
      partnerId: partner.id,
      offerExpiresAt: attempt.expiresAt,
      assignmentHistory: [...order.assignmentHistory, attempt],
      adminAlert: false,
      clientAlert: false,
    },
    "offered",
    now
  );
}

function markFailed(order: DispatchOrder, now = Date.now()): DispatchOrder {
  return pushStatus(
    {
      ...order,
      partnerId: null,
      offerExpiresAt: null,
      adminAlert: true,
      clientAlert: true,
    },
    "failed_no_partner",
    now
  );
}

function tryAssign(order: DispatchOrder, partners: Partner[], settings: PlatformSettings, now: number) {
  const tried = order.assignmentHistory
    .filter((a) => a.outcome !== "skipped")
    .map((a) => a.partnerId);
  const ranked = rankPartnersGeoFirst(partners, buildMatchCtx(order, tried), settings);
  if (!ranked.length) return markFailed(order);
  const best = ranked[0];
  return offerToPartner(order, best.partner, best.score, settings.acceptTimeoutMs, now);
}

type DispatchState = {
  useApi: boolean;
  partners: Partner[];
  orders: DispatchOrder[];
  settings: PlatformSettings;
  activePartnerId: string | null;
  setUseApi: (value: boolean) => void;
  setActivePartner: (id: string | null) => void;
  /** Create order + auto-dispatch to best partner */
  createAndDispatch: (input: {
    userId?: string | null;
    name: string;
    email: string;
    address: string;
    cityId: CityId;
    items: CartItem[];
    total: number;
    printMethod?: PrintMethod;
  }) => string | Promise<string>;
  /** Expire stale offers and cascade */
  tickDispatch: () => void | Promise<void>;
  partnerAccept: (orderId: string, partnerId: string) => void | Promise<void>;
  partnerReject: (orderId: string, partnerId: string) => void | Promise<void>;
  partnerAdvance: (orderId: string, partnerId: string) => void | Promise<void>;
  adminReassign: (orderId: string, partnerId: string) => void | Promise<void>;
  adminSetPartnerApproval: (partnerId: string, approval: PartnerApproval) => void | Promise<void>;
  adminToggleAccepting: (partnerId: string) => void | Promise<void>;
  adminUpdatePartner: (partnerId: string, patch: Partial<Partner>) => void | Promise<void>;
  adminAddPartner: (partner: Omit<Partner, "id" | "createdAt">) => string;
  adminSetSettings: (patch: Partial<PlatformSettings>) => void | Promise<void>;
  adminSetLoad: (partnerId: string, load: number) => void | Promise<void>;
  adminMarkPayoutPaid: (orderId: string) => void | Promise<void>;
  /** Demo: force-expire current offer immediately */
  forceExpireOffer: (orderId: string) => void;
};

const NEXT_STATUS: Partial<Record<PartnerOrderStatus, PartnerOrderStatus>> = {
  accepted: "in_production",
  in_production: "quality_check",
  quality_check: "ready",
  ready: "packed",
  packed: "with_courier",
  with_courier: "delivered",
};

export const useDispatch = create<DispatchState>()(
  persist(
    (set, get) => ({
      useApi: false,
      partners: SEED_PARTNERS,
      orders: [],
      settings: DEFAULT_SETTINGS,
      activePartnerId: null,

      setUseApi: (value) => set({ useApi: value }),
      setActivePartner: (id) => set({ activePartnerId: id }),

      createAndDispatch: async ({ name, email, address, cityId, items, total, printMethod = "dtg", userId = null }) => {
        if (get().useApi) {
          const { order } = await apiCreateOrder({
            name,
            email,
            address,
            cityId,
            items,
            total,
            printMethod,
          });
          set({ orders: [order, ...get().orders] });
          return order.id;
        }
        const city = cityById(cityId);
        const id = `JR-${uid().toUpperCase()}`;
        const now = Date.now();
        let order: DispatchOrder = {
          id,
          userId,
          name,
          email,
          address,
          cityId,
          clientLat: city.lat,
          clientLng: city.lng,
          items,
          total,
          createdAt: now,
          printMethod,
          deadlineAt: now + 72 * 60 * 60 * 1000,
          partnerId: null,
          status: "searching",
          statusHistory: [{ status: "searching", at: now }],
          assignmentHistory: [],
          offerExpiresAt: null,
          finance: null,
          adminAlert: false,
          clientAlert: false,
          notes: "",
        };
        order = tryAssign(order, get().partners, get().settings, now);
        set({ orders: [order, ...get().orders] });
        return id;
      },

      tickDispatch: async () => {
        if (get().useApi) {
          const { orders } = await apiDispatchTick();
          set({ orders });
          return;
        }
        const now = Date.now();
        const { partners, settings } = get();
        let changed = false;
        const orders = get().orders.map((order) => {
          if (order.status !== "offered" || !order.offerExpiresAt) return order;
          if (now < order.offerExpiresAt) return order;
          changed = true;
          const history = order.assignmentHistory.map((a) =>
            a.outcome === "pending" && a.partnerId === order.partnerId
              ? { ...a, outcome: "expired" as const }
              : a
          );
          return tryAssign({ ...order, assignmentHistory: history, partnerId: null }, partners, settings, now);
        });
        if (changed) set({ orders });
      },

      partnerAccept: async (orderId, partnerId) => {
        if (get().useApi) {
          const { order } = await apiOrderAction(orderId, "accept");
          set({ orders: get().orders.map((o) => (o.id === orderId ? order : o)) });
          return;
        }
        const { partners, settings, orders } = get();
        const order = orders.find((o) => o.id === orderId);
        if (!order || order.partnerId !== partnerId || order.status !== "offered") return;
        const partner = partners.find((p) => p.id === partnerId);
        if (!partner) return;
        const history = order.assignmentHistory.map((a) =>
          a.outcome === "pending" && a.partnerId === partnerId
            ? { ...a, outcome: "accepted" as const }
            : a
        );
        const finance = calcFinance(order.total, partner, order.items, settings);
        const loadBump = Math.min(1, partner.currentLoad + 0.08);
        set({
          partners: partners.map((p) => (p.id === partnerId ? { ...p, currentLoad: loadBump } : p)),
          orders: orders.map((o) =>
            o.id === orderId
              ? pushStatus(
                  {
                    ...o,
                    offerExpiresAt: null,
                    assignmentHistory: history,
                    finance,
                  },
                  "accepted"
                )
              : o
          ),
        });
      },

      partnerReject: async (orderId, partnerId) => {
        if (get().useApi) {
          const { order } = await apiOrderAction(orderId, "reject");
          set({ orders: get().orders.map((o) => (o.id === orderId ? order : o)) });
          return;
        }
        const now = Date.now();
        const { partners, settings } = get();
        set({
          orders: get().orders.map((o) => {
            if (o.id !== orderId || o.partnerId !== partnerId || o.status !== "offered") return o;
            const history = o.assignmentHistory.map((a) =>
              a.outcome === "pending" && a.partnerId === partnerId
                ? { ...a, outcome: "rejected" as const }
                : a
            );
            return tryAssign(
              { ...o, assignmentHistory: history, partnerId: null, offerExpiresAt: null },
              partners,
              settings,
              now
            );
          }),
        });
      },

      partnerAdvance: async (orderId, partnerId) => {
        if (get().useApi) {
          const { order } = await apiOrderAction(orderId, "advance");
          set({ orders: get().orders.map((o) => (o.id === orderId ? order : o)) });
          return;
        }
        const { orders, partners } = get();
        const order = orders.find((o) => o.id === orderId);
        if (!order || order.partnerId !== partnerId) return;
        const next = NEXT_STATUS[order.status];
        if (!next) return;
        set({
          orders: orders.map((o) => (o.id === orderId ? pushStatus(o, next) : o)),
          partners:
            next === "delivered"
              ? partners.map((p) =>
                  p.id === partnerId
                    ? { ...p, currentLoad: Math.max(0, p.currentLoad - 0.08) }
                    : p
                )
              : partners,
        });
      },

      adminReassign: async (orderId, partnerId) => {
        if (get().useApi) {
          const { order } = await apiOrderAction(orderId, "reassign", { partnerId });
          set({ orders: get().orders.map((o) => (o.id === orderId ? order : o)) });
          return;
        }
        const now = Date.now();
        const partner = get().partners.find((p) => p.id === partnerId);
        if (!partner) return;
        const settings = get().settings;
        set({
          orders: get().orders.map((o) => {
            if (o.id !== orderId) return o;
            if (o.status === "delivered") return o;
            const history = o.assignmentHistory.map((a) =>
              a.outcome === "pending" ? { ...a, outcome: "skipped" as const } : a
            );
            // Manual assign bypasses full filter but still records score if rankable
            const ranked = rankPartnersGeoFirst(
              get().partners,
              buildMatchCtx(o, []),
              settings
            );
            const hit = ranked.find((r) => r.partner.id === partnerId);
            const score = hit?.score ?? {
              speed: 0,
              distance: 0,
              quality: 0,
              load: 0,
              price: 0,
              reliability: 0,
              total: 0,
            };
            return offerToPartner({ ...o, assignmentHistory: history }, partner, score, settings.acceptTimeoutMs, now);
          }),
        });
      },

      adminSetPartnerApproval: async (partnerId, approval) => {
        if (get().useApi) {
          const { partner } = await apiSetPartnerApproval(partnerId, approval);
          set({ partners: get().partners.map((p) => (p.id === partnerId ? partner : p)) });
          return;
        }
        set({
          partners: get().partners.map((p) => (p.id === partnerId ? { ...p, approval } : p)),
        });
      },

      adminToggleAccepting: (partnerId) => {
        set({
          partners: get().partners.map((p) =>
            p.id === partnerId ? { ...p, acceptingOrders: !p.acceptingOrders } : p
          ),
        });
      },

      adminUpdatePartner: (partnerId, patch) => {
        set({
          partners: get().partners.map((p) => (p.id === partnerId ? { ...p, ...patch } : p)),
        });
      },

      adminAddPartner: (data) => {
        const id = `p-${uid()}`;
        const partner: Partner = { ...data, id, createdAt: Date.now() };
        set({ partners: [...get().partners, partner] });
        return id;
      },

      adminSetSettings: async (patch) => {
        if (get().useApi) {
          const { settings } = await apiUpdateSettings(patch);
          set({ settings });
          return;
        }
        set({ settings: { ...get().settings, ...patch } });
      },

      adminSetLoad: (partnerId, load) => {
        set({
          partners: get().partners.map((p) =>
            p.id === partnerId ? { ...p, currentLoad: Math.max(0, Math.min(1, load)) } : p
          ),
        });
      },

      adminMarkPayoutPaid: async (orderId) => {
        if (get().useApi) {
          const { order } = await apiOrderAction(orderId, "markPaid");
          set({ orders: get().orders.map((o) => (o.id === orderId ? order : o)) });
          return;
        }
        set({
          orders: get().orders.map((o) => {
            if (o.id !== orderId || !o.finance) return o;
            return {
              ...o,
              finance: { ...o.finance, payoutStatus: "paid", paidAt: Date.now() },
            };
          }),
        });
      },

      forceExpireOffer: (orderId) => {
        const now = Date.now();
        const { partners, settings } = get();
        set({
          orders: get().orders.map((o) => {
            if (o.id !== orderId || o.status !== "offered") return o;
            const history = o.assignmentHistory.map((a) =>
              a.outcome === "pending" && a.partnerId === o.partnerId
                ? { ...a, outcome: "expired" as const, expiresAt: now }
                : a
            );
            return tryAssign(
              { ...o, assignmentHistory: history, partnerId: null, offerExpiresAt: null },
              partners,
              settings,
              now
            );
          }),
        });
      },
    }),
    { name: "jerib-dispatch", skipHydration: true }
  )
);

export function partnerById(partners: Partner[], id: string | null) {
  if (!id) return null;
  return partners.find((p) => p.id === id) ?? null;
}

import type { Lang } from "@/lib/i18n";

const STATUS_LABELS: Record<
  import("./types").PartnerOrderStatus,
  Record<Lang, string>
> = {
  searching: {
    en: "Finding partner",
    ru: "Поиск партнёра",
    tg: "Ҷустуҷӯи шарик",
  },
  offered: {
    en: "New order",
    ru: "Новый заказ",
    tg: "Фармоиши нав",
  },
  accepted: {
    en: "Accepted",
    ru: "Принят",
    tg: "Қабул шуд",
  },
  in_production: {
    en: "In production",
    ru: "В производстве",
    tg: "Дар истеҳсол",
  },
  quality_check: {
    en: "Quality check",
    ru: "Контроль качества",
    tg: "Санҷиши сифат",
  },
  ready: {
    en: "Ready",
    ru: "Готов",
    tg: "Омода",
  },
  packed: {
    en: "Packed",
    ru: "Упакован",
    tg: "Бастабандӣ шуд",
  },
  with_courier: {
    en: "With courier",
    ru: "У курьера",
    tg: "Дар курьер",
  },
  delivered: {
    en: "Delivered",
    ru: "Доставлен",
    tg: "Расонда шуд",
  },
  failed_no_partner: {
    en: "No partner available",
    ru: "Нет доступного партнёра",
    tg: "Шарики дастрас нест",
  },
};

export function statusLabel(status: import("./types").PartnerOrderStatus, lang: Lang = "en") {
  return STATUS_LABELS[status][lang] ?? STATUS_LABELS[status].en;
}

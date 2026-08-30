import type { CartItem } from "@/lib/types";
import { Prisma } from "@prisma/client";
import { clientTotalForPartner } from "@/lib/pricing";
import { cityById } from "@/lib/dispatch/cities";
import { calcFinance } from "@/lib/dispatch/finance";
import { rankPartnersGeoFirst, type MatchContext } from "@/lib/dispatch/scoring";
import type {
  AssignmentAttempt,
  DispatchOrder,
  Partner,
  PartnerApproval,
  PartnerOrderStatus,
  PlatformSettings,
  PrintMethod,
} from "@/lib/dispatch/types";

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

export function pushStatus(order: DispatchOrder, status: PartnerOrderStatus, at = Date.now()): DispatchOrder {
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

export function tryAssign(order: DispatchOrder, partners: Partner[], settings: PlatformSettings, now: number) {
  const tried = order.assignmentHistory
    .filter((a) => a.outcome !== "skipped")
    .map((a) => a.partnerId);
  const ranked = rankPartnersGeoFirst(partners, buildMatchCtx(order, tried), settings);
  if (!ranked.length) return markFailed(order, now);
  const best = ranked[0];
  return offerToPartner(order, best.partner, best.score, settings.acceptTimeoutMs, now);
}

export function createOrderDraft(input: {
  userId?: string | null;
  name: string;
  email: string;
  address: string;
  cityId: string;
  items: CartItem[];
  total: number;
  printMethod?: PrintMethod;
}): DispatchOrder {
  const city = cityById(input.cityId);
  const id = `JR-${uid().toUpperCase()}`;
  const now = Date.now();
  return {
    id,
    userId: input.userId ?? null,
    name: input.name,
    email: input.email,
    address: input.address,
    cityId: input.cityId,
    clientLat: city.lat,
    clientLng: city.lng,
    items: input.items,
    total: input.total,
    createdAt: now,
    printMethod: input.printMethod ?? "dtg",
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
}

const NEXT_STATUS: Partial<Record<PartnerOrderStatus, PartnerOrderStatus>> = {
  accepted: "in_production",
  in_production: "quality_check",
  quality_check: "ready",
  ready: "packed",
  packed: "with_courier",
  with_courier: "delivered",
};

export function tickOrders(orders: DispatchOrder[], partners: Partner[], settings: PlatformSettings) {
  const now = Date.now();
  let changed = false;
  const next = orders.map((order) => {
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
  return { orders: next, changed };
}

export function acceptOrder(
  order: DispatchOrder,
  partnerId: string,
  partner: Partner,
  settings: PlatformSettings
) {
  if (order.partnerId !== partnerId || order.status !== "offered") return null;
  const history = order.assignmentHistory.map((a) =>
    a.outcome === "pending" && a.partnerId === partnerId ? { ...a, outcome: "accepted" as const } : a
  );
  const finance = calcFinance(order.total, partner, order.items, settings);
  const loadBump = Math.min(1, partner.currentLoad + 0.08);
  const nextOrder = pushStatus(
    {
      ...order,
      offerExpiresAt: null,
      assignmentHistory: history,
      finance,
    },
    "accepted"
  );
  return { order: nextOrder, partnerLoad: loadBump };
}

export function rejectOrder(
  order: DispatchOrder,
  partnerId: string,
  partners: Partner[],
  settings: PlatformSettings
) {
  if (order.partnerId !== partnerId || order.status !== "offered") return null;
  const now = Date.now();
  const history = order.assignmentHistory.map((a) =>
    a.outcome === "pending" && a.partnerId === partnerId ? { ...a, outcome: "rejected" as const } : a
  );
  return tryAssign(
    { ...order, assignmentHistory: history, partnerId: null, offerExpiresAt: null },
    partners,
    settings,
    now
  );
}

export function advanceOrder(order: DispatchOrder, partnerId: string) {
  if (order.partnerId !== partnerId) return null;
  const next = NEXT_STATUS[order.status];
  if (!next) return null;
  const nextOrder = pushStatus(order, next);
  const loadDelta = next === "delivered" ? -0.08 : 0;
  return { order: nextOrder, loadDelta };
}

export function reassignOrder(
  order: DispatchOrder,
  partnerId: string,
  partners: Partner[],
  settings: PlatformSettings
) {
  if (order.status === "delivered") return null;
  const now = Date.now();
  const partner = partners.find((p) => p.id === partnerId);
  if (!partner) return null;
  const history = order.assignmentHistory.map((a) =>
    a.outcome === "pending" ? { ...a, outcome: "skipped" as const } : a
  );
  const ranked = rankPartnersGeoFirst(partners, buildMatchCtx(order, []), settings);
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
  return offerToPartner({ ...order, assignmentHistory: history }, partner, score, settings.acceptTimeoutMs, now);
}

export function orderToDb(order: DispatchOrder) {
  return {
    id: order.id,
    userId: order.userId,
    name: order.name,
    email: order.email,
    address: order.address,
    cityId: order.cityId,
    clientLat: order.clientLat,
    clientLng: order.clientLng,
    items: order.items as Prisma.InputJsonValue,
    total: order.total,
    printMethod: order.printMethod,
    deadlineAt: new Date(order.deadlineAt),
    partnerId: order.partnerId,
    status: order.status,
    statusHistory: order.statusHistory as Prisma.InputJsonValue,
    assignmentHistory: order.assignmentHistory as Prisma.InputJsonValue,
    offerExpiresAt: order.offerExpiresAt ? new Date(order.offerExpiresAt) : null,
    finance: order.finance ? (order.finance as Prisma.InputJsonValue) : Prisma.JsonNull,
    adminAlert: order.adminAlert,
    clientAlert: order.clientAlert,
    notes: order.notes,
    createdAt: new Date(order.createdAt),
  };
}

export function partnerToDb(partner: Partner) {
  return {
    id: partner.id,
    name: partner.name,
    cityId: partner.cityId,
    address: partner.address,
    lat: partner.lat,
    lng: partner.lng,
    serviceRadiusKm: partner.serviceRadiusKm,
    serviceCities: partner.serviceCities,
    acceptsRemoteDelivery: partner.acceptsRemoteDelivery,
    printMethods: partner.printMethods,
    products: partner.products,
    productionPrices: partner.productionPrices as Prisma.InputJsonValue,
    minOrderQty: partner.minOrderQty,
    capacityUnits: partner.capacityUnits,
    avgProductionHours: partner.avgProductionHours,
    workingHours: partner.workingHours as Prisma.InputJsonValue,
    currentLoad: partner.currentLoad,
    rating: partner.rating,
    qualityScore: partner.qualityScore,
    completionRate: partner.completionRate,
    cancelRate: partner.cancelRate,
    acceptingOrders: partner.acceptingOrders,
    approval: partner.approval,
    commissionOverride: partner.commissionOverride,
    createdAt: new Date(partner.createdAt),
  };
}

export type PartnerPatch = Partial<Partner> & { approval?: PartnerApproval };

import { prisma, hasDatabase } from "@/lib/prisma";
import { DEFAULT_SETTINGS_ROW, toOrder, toPartner, toSettings } from "@/lib/server/mappers";
import {
  acceptOrder,
  advanceOrder,
  createOrderDraft,
  orderToDb,
  partnerToDb,
  rejectOrder,
  reassignOrder,
  tickOrders,
  tryAssign,
} from "@/lib/server/dispatch";
import type { CartItem } from "@/lib/types";
import type { DispatchOrder, Partner, PartnerApproval, PlatformSettings, PrintMethod } from "@/lib/dispatch/types";

export async function ensureSettings() {
  const existing = await prisma.platformSettings.findUnique({ where: { id: 1 } });
  if (existing) return toSettings(existing);
  const created = await prisma.platformSettings.create({ data: DEFAULT_SETTINGS_ROW });
  return toSettings(created);
}

export async function loadPartners() {
  const rows = await prisma.partner.findMany({ orderBy: { createdAt: "asc" } });
  return rows.map(toPartner);
}

export async function loadOrders(filter?: { userId?: string; partnerId?: string }) {
  const rows = await prisma.order.findMany({
    where: {
      ...(filter?.userId ? { userId: filter.userId } : {}),
      ...(filter?.partnerId ? { partnerId: filter.partnerId } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toOrder);
}

export async function loadOrder(id: string) {
  const row = await prisma.order.findUnique({ where: { id } });
  return row ? toOrder(row) : null;
}

export async function saveOrder(order: DispatchOrder) {
  await prisma.order.upsert({
    where: { id: order.id },
    create: orderToDb(order),
    update: orderToDb(order),
  });
  return order;
}

export async function savePartner(partner: Partner) {
  await prisma.partner.upsert({
    where: { id: partner.id },
    create: partnerToDb(partner),
    update: partnerToDb(partner),
  });
  return partner;
}

export async function createAndDispatchOrder(input: {
  userId?: string | null;
  name: string;
  email: string;
  address: string;
  cityId: string;
  items: CartItem[];
  total: number;
  printMethod?: PrintMethod;
}) {
  const [partners, settings] = await Promise.all([loadPartners(), ensureSettings()]);
  let order = createOrderDraft(input);
  order = tryAssign(order, partners, settings, Date.now());
  await saveOrder(order);
  return order;
}

export async function runDispatchTick() {
  const [partners, settings, orders] = await Promise.all([
    loadPartners(),
    ensureSettings(),
    loadOrders(),
  ]);
  const { orders: next, changed } = tickOrders(orders, partners, settings);
  if (!changed) return next;
  await Promise.all(next.map((o) => saveOrder(o)));
  return next;
}

export async function partnerAcceptOrder(orderId: string, partnerId: string) {
  const [order, partners, settings] = await Promise.all([
    loadOrder(orderId),
    loadPartners(),
    ensureSettings(),
  ]);
  if (!order) return null;
  const partner = partners.find((p) => p.id === partnerId);
  if (!partner) return null;
  const result = acceptOrder(order, partnerId, partner, settings);
  if (!result) return null;
  await saveOrder(result.order);
  await savePartner({ ...partner, currentLoad: result.partnerLoad });
  return result.order;
}

export async function partnerRejectOrder(orderId: string, partnerId: string) {
  const [order, partners, settings] = await Promise.all([
    loadOrder(orderId),
    loadPartners(),
    ensureSettings(),
  ]);
  if (!order) return null;
  const next = rejectOrder(order, partnerId, partners, settings);
  if (!next) return null;
  await saveOrder(next);
  return next;
}

export async function partnerAdvanceOrder(orderId: string, partnerId: string) {
  const [order, partners] = await Promise.all([loadOrder(orderId), loadPartners()]);
  if (!order) return null;
  const result = advanceOrder(order, partnerId);
  if (!result) return null;
  await saveOrder(result.order);
  if (result.loadDelta) {
    const partner = partners.find((p) => p.id === partnerId);
    if (partner) {
      await savePartner({
        ...partner,
        currentLoad: Math.max(0, partner.currentLoad + result.loadDelta),
      });
    }
  }
  return result.order;
}

export async function adminReassignOrder(orderId: string, partnerId: string) {
  const [order, partners, settings] = await Promise.all([
    loadOrder(orderId),
    loadPartners(),
    ensureSettings(),
  ]);
  if (!order) return null;
  const next = reassignOrder(order, partnerId, partners, settings);
  if (!next) return null;
  await saveOrder(next);
  return next;
}

export async function adminUpdateSettings(patch: Partial<PlatformSettings>) {
  const current = await ensureSettings();
  const next = { ...current, ...patch, scoring: { ...current.scoring, ...patch.scoring } };
  await prisma.platformSettings.upsert({
    where: { id: 1 },
    create: { id: 1, ...next },
    update: next,
  });
  return next;
}

export async function adminUpdatePartner(partnerId: string, patch: Partial<Partner>) {
  const partners = await loadPartners();
  const partner = partners.find((p) => p.id === partnerId);
  if (!partner) return null;
  const next = { ...partner, ...patch };
  await savePartner(next);
  return next;
}

export async function adminSetPartnerApproval(partnerId: string, approval: PartnerApproval) {
  return adminUpdatePartner(partnerId, { approval });
}

export async function adminMarkPayoutPaid(orderId: string) {
  const order = await loadOrder(orderId);
  if (!order?.finance) return null;
  const next = {
    ...order,
    finance: { ...order.finance, payoutStatus: "paid" as const, paidAt: Date.now() },
  };
  await saveOrder(next);
  return next;
}

export function apiEnabled() {
  return hasDatabase();
}

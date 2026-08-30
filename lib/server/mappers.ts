import type { Partner as PrismaPartner, User as PrismaUser, Order as PrismaOrder } from "@prisma/client";
import type { PublicUser } from "@/lib/auth/types";
import type { CityId } from "@/lib/dispatch/types";
import { normalizeCityId } from "@/lib/dispatch/cities";
import type { DispatchOrder, Partner, PlatformSettings } from "@/lib/dispatch/types";
import type { CartItem } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/dispatch/types";

export function toPublicUser(user: PrismaUser): PublicUser {
  return {
    id: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    phone: user.phone,
    cityId: normalizeCityId(user.cityId),
    address: user.address,
    partnerId: user.partnerId,
    provider: user.provider,
    providerId: user.providerId,
    createdAt: user.createdAt.getTime(),
  };
}

export function toPartner(row: PrismaPartner): Partner {
  return {
    id: row.id,
    name: row.name,
    cityId: normalizeCityId(row.cityId),
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    serviceRadiusKm: row.serviceRadiusKm,
    serviceCities: row.serviceCities.map((id) => normalizeCityId(id)),
    acceptsRemoteDelivery: row.acceptsRemoteDelivery,
    printMethods: row.printMethods as Partner["printMethods"],
    products: row.products as Partner["products"],
    productionPrices: row.productionPrices as Partner["productionPrices"],
    minOrderQty: row.minOrderQty,
    capacityUnits: row.capacityUnits,
    avgProductionHours: row.avgProductionHours,
    workingHours: row.workingHours as Partner["workingHours"],
    currentLoad: row.currentLoad,
    rating: row.rating,
    qualityScore: row.qualityScore,
    completionRate: row.completionRate,
    cancelRate: row.cancelRate,
    acceptingOrders: row.acceptingOrders,
    approval: row.approval,
    commissionOverride: row.commissionOverride,
    createdAt: row.createdAt.getTime(),
  };
}

export function toOrder(row: PrismaOrder): DispatchOrder {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    email: row.email,
    address: row.address,
    cityId: normalizeCityId(row.cityId),
    clientLat: row.clientLat,
    clientLng: row.clientLng,
    items: row.items as CartItem[],
    total: row.total,
    createdAt: row.createdAt.getTime(),
    printMethod: row.printMethod as DispatchOrder["printMethod"],
    deadlineAt: row.deadlineAt.getTime(),
    partnerId: row.partnerId,
    status: row.status,
    statusHistory: row.statusHistory as DispatchOrder["statusHistory"],
    assignmentHistory: row.assignmentHistory as DispatchOrder["assignmentHistory"],
    offerExpiresAt: row.offerExpiresAt?.getTime() ?? null,
    finance: (row.finance as DispatchOrder["finance"]) ?? null,
    adminAlert: row.adminAlert,
    clientAlert: row.clientAlert,
    notes: row.notes,
  };
}

export function toSettings(row: {
  acceptTimeoutMs: number;
  paymentFeeRate: number;
  defaultDeliveryCost: number;
  defaultCommissionRate: number;
  otherCostFlat: number;
  scoring: unknown;
}): PlatformSettings {
  return {
    acceptTimeoutMs: row.acceptTimeoutMs,
    paymentFeeRate: row.paymentFeeRate,
    defaultDeliveryCost: row.defaultDeliveryCost,
    defaultCommissionRate: row.defaultCommissionRate,
    otherCostFlat: row.otherCostFlat,
    scoring: row.scoring as PlatformSettings["scoring"],
  };
}

export const DEFAULT_SETTINGS_ROW = {
  id: 1,
  ...DEFAULT_SETTINGS,
};

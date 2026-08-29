/** Local production partner dispatch — domain types */

import type { CartItem, ProductId } from "@/lib/types";
import type { City, CityId, CountryId } from "./cities";

export type { City, CityId, CountryId };

export type PrintMethod = "dtg" | "screen" | "embroidery" | "vinyl" | "sublimation";

export type PartnerApproval = "pending" | "approved" | "blocked";

export type PartnerOrderStatus =
  | "searching"
  | "offered"
  | "accepted"
  | "in_production"
  | "quality_check"
  | "ready"
  | "packed"
  | "with_courier"
  | "delivered"
  | "failed_no_partner";

export type AssignmentOutcome = "pending" | "accepted" | "expired" | "rejected" | "skipped";

export type WorkingHours = {
  /** Hour of day 0–23 */
  open: number;
  /** Hour of day 1–24 */
  close: number;
  /** 0 = Sun … 6 = Sat; empty = every day */
  days: number[];
};

export type Partner = {
  id: string;
  name: string;
  cityId: CityId;
  address: string;
  lat: number;
  lng: number;
  /** Primary service radius in km around GPS */
  serviceRadiusKm: number;
  /** Cities this partner covers (same-city first; extras = remote if allowed) */
  serviceCities: CityId[];
  /** Willing to fulfill orders for clients outside home city (within serviceCities) */
  acceptsRemoteDelivery: boolean;
  printMethods: PrintMethod[];
  products: ProductId[];
  /** Production cost charged to JERIB per unit */
  productionPrices: Partial<Record<ProductId, number>>;
  minOrderQty: number;
  /** Max units in active production */
  capacityUnits: number;
  avgProductionHours: number;
  workingHours: WorkingHours;
  /** 0–1 current occupancy */
  currentLoad: number;
  /** Public star rating 0–5 */
  rating: number;
  /** Internal quality 0–100 */
  qualityScore: number;
  completionRate: number;
  cancelRate: number;
  acceptingOrders: boolean;
  approval: PartnerApproval;
  /** Override platform commission 0–1; null = use global */
  commissionOverride: number | null;
  createdAt: number;
};

export type AssignmentAttempt = {
  partnerId: string;
  offeredAt: number;
  expiresAt: number;
  outcome: AssignmentOutcome;
  score: number;
  scoreBreakdown: ScoreBreakdown;
};

export type ScoreBreakdown = {
  speed: number;
  distance: number;
  quality: number;
  load: number;
  price: number;
  reliability: number;
  total: number;
};

export type OrderFinance = {
  clientTotal: number;
  productionCost: number;
  deliveryCost: number;
  paymentFee: number;
  otherCost: number;
  jeribRevenue: number;
  partnerPayout: number;
  payoutStatus: "pending" | "paid";
  paidAt: number | null;
};

export type StatusEvent = {
  status: PartnerOrderStatus;
  at: number;
};

export type DispatchOrder = {
  id: string;
  /** Registered client account */
  userId: string | null;
  name: string;
  email: string;
  address: string;
  cityId: CityId;
  clientLat: number;
  clientLng: number;
  items: CartItem[];
  total: number;
  createdAt: number;
  /** Preferred / required print method for this order */
  printMethod: PrintMethod;
  /** Absolute deadline for partner completion */
  deadlineAt: number;
  partnerId: string | null;
  status: PartnerOrderStatus;
  /** Chronological status changes for the client timeline */
  statusHistory: StatusEvent[];
  assignmentHistory: AssignmentAttempt[];
  offerExpiresAt: number | null;
  finance: OrderFinance | null;
  adminAlert: boolean;
  clientAlert: boolean;
  notes: string;
};

export type PlatformSettings = {
  acceptTimeoutMs: number;
  paymentFeeRate: number;
  defaultDeliveryCost: number;
  defaultCommissionRate: number;
  otherCostFlat: number;
  scoring: {
    speed: number;
    distance: number;
    quality: number;
    load: number;
    price: number;
    reliability: number;
  };
};

export type QualityStandard = {
  id: string;
  title: string;
  body: string;
};

export const PARTNER_STATUS_FLOW: PartnerOrderStatus[] = [
  "offered",
  "accepted",
  "in_production",
  "quality_check",
  "ready",
  "packed",
  "with_courier",
  "delivered",
];

export const DEFAULT_SETTINGS: PlatformSettings = {
  acceptTimeoutMs: 5 * 60 * 1000,
  paymentFeeRate: 0.029,
  defaultDeliveryCost: 0,
  defaultCommissionRate: 0.18,
  otherCostFlat: 0,
  scoring: {
    speed: 0.3,
    distance: 0.2,
    quality: 0.15,
    load: 0.15,
    price: 0.1,
    reliability: 0.1,
  },
};

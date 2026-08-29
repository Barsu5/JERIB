import type { ProductId } from "@/lib/types";
import { distanceKm } from "./cities";
import type {
  Partner,
  PlatformSettings,
  PrintMethod,
  ScoreBreakdown,
} from "./types";

export type MatchContext = {
  cityId: Partner["cityId"];
  clientLat: number;
  clientLng: number;
  productIds: ProductId[];
  qty: number;
  printMethod: PrintMethod;
  now?: Date;
  /** Partner ids already tried (expired/rejected) */
  excludeIds?: string[];
  /** When true, ignore working-hours gate (fallback if nobody is open) */
  allowOutsideHours?: boolean;
};

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function isWithinWorkingHours(partner: Partner, now = new Date()) {
  const day = now.getDay();
  const days = partner.workingHours.days;
  if (days.length && !days.includes(day)) return false;
  const h = now.getHours() + now.getMinutes() / 60;
  return h >= partner.workingHours.open && h < partner.workingHours.close;
}

export function partnerCoversClient(partner: Partner, ctx: MatchContext) {
  if (partner.approval !== "approved") return false;
  if (!partner.acceptingOrders) return false;
  if (ctx.excludeIds?.includes(partner.id)) return false;

  const sameCity = partner.serviceCities.includes(ctx.cityId);
  if (!sameCity) return false;

  const remote = partner.cityId !== ctx.cityId;
  if (remote && !partner.acceptsRemoteDelivery) return false;

  const dist = distanceKm(
    { lat: partner.lat, lng: partner.lng },
    { lat: ctx.clientLat, lng: ctx.clientLng }
  );
  if (!remote && dist > partner.serviceRadiusKm) return false;

  if (!partner.printMethods.includes(ctx.printMethod)) return false;
  for (const pid of ctx.productIds) {
    if (!partner.products.includes(pid)) return false;
    if (partner.productionPrices[pid] == null) return false;
  }
  if (ctx.qty < partner.minOrderQty) return false;

  const freeCapacity = partner.capacityUnits * (1 - partner.currentLoad);
  if (freeCapacity < ctx.qty) return false;

  if (!ctx.allowOutsideHours && !isWithinWorkingHours(partner, ctx.now ?? new Date())) {
    return false;
  }

  return true;
}

/**
 * Weighted score 0–100.
 * Weights (defaults): speed 30%, distance 20%, quality 15%, load 15%, price 10%, reliability 10%.
 */
export function scorePartner(
  partner: Partner,
  ctx: MatchContext,
  settings: PlatformSettings
): ScoreBreakdown {
  const w = settings.scoring;
  const dist = distanceKm(
    { lat: partner.lat, lng: partner.lng },
    { lat: ctx.clientLat, lng: ctx.clientLng }
  );

  // Faster avg hours → higher score (cap at 48h → 0)
  const speed = clamp01(1 - partner.avgProductionHours / 48) * 100;

  // Closer → higher; normalize against 50 km
  const distance = clamp01(1 - dist / 50) * 100;

  const quality = clamp01(partner.qualityScore / 100) * 100;

  // Lower load → higher
  const load = clamp01(1 - partner.currentLoad) * 100;

  // Outside hours soft penalty applied via reliability/speed already; boost if open
  const openNow = isWithinWorkingHours(partner, ctx.now ?? new Date());
  const hoursFactor = openNow ? 1 : 0.75;

  // Lower production price → higher score (normalize ~80–250 сом)
  const avgPrice =
    ctx.productIds.reduce((s, id) => s + (partner.productionPrices[id] ?? 120), 0) /
    Math.max(1, ctx.productIds.length);
  const price = clamp01(1 - avgPrice / 250) * 100;

  const reliability =
    (clamp01(partner.completionRate) * 70 +
      clamp01(1 - partner.cancelRate) * 15 +
      clamp01(partner.rating / 5) * 15) *
    hoursFactor;

  const total =
    (speed * w.speed +
      distance * w.distance +
      quality * w.quality +
      load * w.load +
      price * w.price +
      reliability * w.reliability) *
    (openNow ? 1 : 0.9);

  return {
    speed: Math.round(speed * 10) / 10,
    distance: Math.round(distance * 10) / 10,
    quality: Math.round(quality * 10) / 10,
    load: Math.round(load * 10) / 10,
    price: Math.round(price * 10) / 10,
    reliability: Math.round(reliability * 10) / 10,
    total: Math.round(total * 10) / 10,
  };
}

export type RankedPartner = {
  partner: Partner;
  score: ScoreBreakdown;
  distanceKm: number;
};

export function rankPartners(
  partners: Partner[],
  ctx: MatchContext,
  settings: PlatformSettings
): RankedPartner[] {
  return partners
    .filter((p) => partnerCoversClient(p, ctx))
    .map((partner) => ({
      partner,
      score: scorePartner(partner, ctx, settings),
      distanceKm: distanceKm(
        { lat: partner.lat, lng: partner.lng },
        { lat: ctx.clientLat, lng: ctx.clientLng }
      ),
    }))
    .sort((a, b) => b.score.total - a.score.total);
}

/** Prefer same-city partners; only then remote-capable from other cities serving this city */
export function rankPartnersGeoFirst(
  partners: Partner[],
  ctx: MatchContext,
  settings: PlatformSettings
): RankedPartner[] {
  const run = (allowOutsideHours: boolean) => {
    const local = rankPartners(
      partners.filter((p) => p.cityId === ctx.cityId),
      { ...ctx, allowOutsideHours },
      settings
    );
    if (local.length) return local;
    return rankPartners(
      partners.filter((p) => p.cityId !== ctx.cityId && p.acceptsRemoteDelivery),
      { ...ctx, allowOutsideHours },
      settings
    );
  };
  const open = run(false);
  if (open.length) return open;
  return run(true);
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { hasDatabase } from "@/lib/prisma";
import { requireUser } from "@/lib/server/auth";
import { dbUnavailable, badRequest, forbidden, unauthorized } from "@/lib/server/db-error";
import {
  adminMarkPayoutPaid,
  adminReassignOrder,
  adminUpdatePartner,
  adminUpdateSettings,
  createAndDispatchOrder,
  loadOrder,
  loadOrders,
  loadPartners,
  partnerAcceptOrder,
  partnerAdvanceOrder,
  partnerRejectOrder,
  runDispatchTick,
  ensureSettings,
} from "@/lib/server/orders";

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  address: z.string().min(1),
  cityId: z.string(),
  items: z.array(z.unknown()).min(1),
  total: z.number(),
  printMethod: z.string().optional(),
});

export async function GET() {
  if (!hasDatabase()) return dbUnavailable();
  const user = await requireUser();
  if (!user) return unauthorized();

  if (user.role === "admin") {
    const [orders, partners, settings] = await Promise.all([
      loadOrders(),
      loadPartners(),
      ensureSettings(),
    ]);
    return NextResponse.json({ orders, partners, settings });
  }

  if (user.role === "partner" && user.partnerId) {
    const orders = await loadOrders({ partnerId: user.partnerId });
    return NextResponse.json({ orders });
  }

  const orders = await loadOrders({ userId: user.id });
  return NextResponse.json({ orders });
}

export async function POST(req: Request) {
  if (!hasDatabase()) return dbUnavailable();
  const user = await requireUser(["client", "admin"]);
  if (!user) return forbidden();

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return badRequest("invalid", parsed.error.flatten());

    const order = await createAndDispatchOrder({
      userId: user.id,
      name: parsed.data.name,
      email: parsed.data.email,
      address: parsed.data.address,
      cityId: parsed.data.cityId,
      items: parsed.data.items as never,
      total: parsed.data.total,
      printMethod: parsed.data.printMethod as never,
    });

    return NextResponse.json({ order });
  } catch (err) {
    console.error("[POST /api/orders]", err);
    const detail =
      process.env.NODE_ENV === "development" && err instanceof Error ? err.message : undefined;
    return NextResponse.json({ error: "server_error", detail }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { hasDatabase } from "@/lib/prisma";
import { getSessionUser, requireUser } from "@/lib/server/auth";
import { dbUnavailable, forbidden, unauthorized } from "@/lib/server/db-error";
import { loadPartners, runDispatchTick } from "@/lib/server/orders";

export async function GET() {
  if (!hasDatabase()) return dbUnavailable();
  const user = await getSessionUser();
  const partners = await loadPartners();

  if (!user) {
    return NextResponse.json({ partners: partners.filter((p) => p.approval === "approved") });
  }
  if (user.role === "admin") return NextResponse.json({ partners });
  if (user.role === "partner" && user.partnerId) {
    const partner = partners.find((p) => p.id === user.partnerId);
    return NextResponse.json({ partners: partner ? [partner] : [] });
  }
  return NextResponse.json({ partners: partners.filter((p) => p.approval === "approved") });
}

export async function POST() {
  if (!hasDatabase()) return dbUnavailable();
  const user = await requireUser(["admin", "partner", "client"]);
  if (!user) return unauthorized();

  const orders = await runDispatchTick();
  if (user.role === "admin") return NextResponse.json({ orders });
  if (user.role === "partner" && user.partnerId) {
    return NextResponse.json({ orders: orders.filter((o) => o.partnerId === user.partnerId) });
  }
  return NextResponse.json({ orders: orders.filter((o) => o.userId === user.id) });
}

import { NextResponse } from "next/server";
import { hasDatabase } from "@/lib/prisma";
import { requireUser } from "@/lib/server/auth";
import { dbUnavailable, forbidden } from "@/lib/server/db-error";
import { adminUpdateSettings, ensureSettings } from "@/lib/server/orders";

export async function GET() {
  if (!hasDatabase()) return dbUnavailable();
  const settings = await ensureSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(req: Request) {
  if (!hasDatabase()) return dbUnavailable();
  const user = await requireUser(["admin"]);
  if (!user) return forbidden();

  const body = await req.json();
  const settings = await adminUpdateSettings(body);
  return NextResponse.json({ settings });
}

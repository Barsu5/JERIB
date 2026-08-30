import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server/auth";
import { hasDatabase } from "@/lib/prisma";
import { dbUnavailable } from "@/lib/server/db-error";

export async function GET() {
  if (!hasDatabase()) return dbUnavailable();
  const user = await getSessionUser();
  return NextResponse.json({ user });
}

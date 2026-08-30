import { NextResponse } from "next/server";
import { hasDatabase } from "@/lib/prisma";

export async function GET() {
  return NextResponse.json({
    ok: true,
    database: hasDatabase(),
    api: hasDatabase(),
  });
}

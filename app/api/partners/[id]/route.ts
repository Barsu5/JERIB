import { NextResponse } from "next/server";
import { hasDatabase } from "@/lib/prisma";
import { requireUser } from "@/lib/server/auth";
import { dbUnavailable, badRequest, forbidden, unauthorized } from "@/lib/server/db-error";
import { adminSetPartnerApproval, adminUpdatePartner } from "@/lib/server/orders";
import type { PartnerApproval } from "@/lib/dispatch/types";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  if (!hasDatabase()) return dbUnavailable();
  const user = await requireUser(["admin"]);
  if (!user) return forbidden();

  const { id } = await ctx.params;
  const body = (await req.json()) as {
    action?: string;
    approval?: PartnerApproval;
    patch?: Record<string, unknown>;
  };

  if (body.action === "approval" && body.approval) {
    const partner = await adminSetPartnerApproval(id, body.approval);
    if (!partner) return badRequest("not_found");
    return NextResponse.json({ partner });
  }

  if (body.patch) {
    const partner = await adminUpdatePartner(id, body.patch as never);
    if (!partner) return badRequest("not_found");
    return NextResponse.json({ partner });
  }

  return badRequest("invalid");
}

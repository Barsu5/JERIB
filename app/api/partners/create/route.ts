import { NextResponse } from "next/server";
import { z } from "zod";
import { hasDatabase } from "@/lib/prisma";
import { requireUser } from "@/lib/server/auth";
import { dbUnavailable, badRequest, forbidden } from "@/lib/server/db-error";
import { createPartnerAccount } from "@/lib/server/partner-accounts";

const schema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().trim().optional(),
  password: z.string().min(6),
  cityId: z.string().min(1),
  companyName: z.string().trim().min(1),
  address: z.string().trim().min(1),
  approval: z.enum(["pending", "approved", "blocked"]).optional(),
});

export async function POST(req: Request) {
  if (!hasDatabase()) return dbUnavailable();
  const user = await requireUser(["admin"]);
  if (!user) return forbidden();

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest("invalid", parsed.error.flatten());

  const result = await createPartnerAccount(parsed.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  return NextResponse.json({ partner: result.partner, user: result.user });
}

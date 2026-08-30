import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma, hasDatabase } from "@/lib/prisma";
import { requireUser } from "@/lib/server/auth";
import { dbUnavailable, badRequest, unauthorized } from "@/lib/server/db-error";
import { toPublicUser } from "@/lib/server/mappers";

const schema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  cityId: z.string().optional(),
  address: z.string().optional(),
});

export async function PATCH(req: Request) {
  if (!hasDatabase()) return dbUnavailable();
  const session = await requireUser();
  if (!session) return unauthorized();

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return badRequest("invalid");

    const user = await prisma.user.update({
      where: { id: session.id },
      data: {
        ...(parsed.data.name !== undefined ? { name: parsed.data.name.trim() } : {}),
        ...(parsed.data.phone !== undefined ? { phone: parsed.data.phone.trim() } : {}),
        ...(parsed.data.cityId !== undefined ? { cityId: parsed.data.cityId } : {}),
        ...(parsed.data.address !== undefined ? { address: parsed.data.address.trim() } : {}),
      },
    });

    return NextResponse.json({ user: toPublicUser(user) });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

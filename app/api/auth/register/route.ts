import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizeCityId } from "@/lib/dispatch/cities";
import { prisma, hasDatabase } from "@/lib/prisma";
import { hashPassword, setSessionCookie } from "@/lib/server/auth";
import { dbUnavailable, badRequest } from "@/lib/server/db-error";
import { toPublicUser } from "@/lib/server/mappers";

const clientSchema = z.object({
  role: z.literal("client").optional(),
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().trim().optional(),
  password: z.string().min(6),
  cityId: z.string().min(1),
  address: z.string().trim().optional(),
});

export async function POST(req: Request) {
  if (!hasDatabase()) return dbUnavailable();

  try {
    const body = await req.json();
    if (body?.role === "partner") {
      return NextResponse.json({ error: "partner_registration_closed" }, { status: 403 });
    }

    const parsed = clientSchema.safeParse(body);
    if (!parsed.success) return badRequest("invalid", parsed.error.flatten());

    const email = parsed.data.email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "exists" }, { status: 409 });

    const passwordHash = await hashPassword(parsed.data.password);

    const data = parsed.data;
    const user = await prisma.user.create({
      data: {
        role: "client",
        name: data.name.trim(),
        email,
        phone: data.phone?.trim() ?? "",
        passwordHash,
        cityId: normalizeCityId(data.cityId),
        address: data.address?.trim() ?? "",
        provider: "email",
      },
    });

    await setSessionCookie(user.id);
    return NextResponse.json({ user: toPublicUser(user) });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "exists" }, { status: 409 });
    }
    console.error("register error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

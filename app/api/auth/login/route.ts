import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma, hasDatabase } from "@/lib/prisma";
import { setSessionCookie, verifyPassword } from "@/lib/server/auth";
import { dbUnavailable, badRequest } from "@/lib/server/db-error";
import { toPublicUser } from "@/lib/server/mappers";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  if (!hasDatabase()) return dbUnavailable();

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return badRequest("invalid");

    const email = parsed.data.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
      return NextResponse.json({ error: "credentials" }, { status: 401 });
    }

    await setSessionCookie(user.id);
    return NextResponse.json({ user: toPublicUser(user) });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

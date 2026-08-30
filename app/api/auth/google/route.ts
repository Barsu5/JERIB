import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma, hasDatabase } from "@/lib/prisma";
import { hashPassword, setSessionCookie } from "@/lib/server/auth";
import { dbUnavailable, badRequest } from "@/lib/server/db-error";
import { toPublicUser } from "@/lib/server/mappers";

type GoogleUserInfo = {
  sub?: string;
  email?: string;
  email_verified?: boolean | string;
  name?: string;
  picture?: string;
  error?: string;
  error_description?: string;
};

export async function POST(req: Request) {
  if (!hasDatabase()) {
    try {
      const body = (await req.json()) as { accessToken?: string };
      const accessToken = body.accessToken?.trim();
      if (!accessToken) return NextResponse.json({ error: "missing_token" }, { status: 400 });

      const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      const data = (await res.json()) as GoogleUserInfo;
      if (!res.ok || !data.sub || !data.email) {
        return NextResponse.json(
          { error: data.error || "google_userinfo_failed", detail: data.error_description },
          { status: 401 }
        );
      }
      const verified =
        data.email_verified === true || data.email_verified === "true" || data.email_verified === undefined;
      if (!verified) return NextResponse.json({ error: "email_not_verified" }, { status: 403 });

      return NextResponse.json({
        sub: data.sub,
        email: data.email,
        name: data.name || data.email.split("@")[0],
        picture: data.picture || null,
      });
    } catch {
      return NextResponse.json({ error: "server_error" }, { status: 500 });
    }
  }

  try {
    const body = (await req.json()) as { accessToken?: string };
    const accessToken = body.accessToken?.trim();
    if (!accessToken) return badRequest("missing_token");

    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    const data = (await res.json()) as GoogleUserInfo;

    if (!res.ok || !data.sub || !data.email) {
      return NextResponse.json(
        { error: data.error || "google_userinfo_failed", detail: data.error_description },
        { status: 401 }
      );
    }

    const verified =
      data.email_verified === true || data.email_verified === "true" || data.email_verified === undefined;
    if (!verified) return NextResponse.json({ error: "email_not_verified" }, { status: 403 });

    const email = data.email.trim().toLowerCase();
    const sub = data.sub.trim();
    const name = (data.name || email.split("@")[0] || "Google").trim();

    let user =
      (await prisma.user.findFirst({
        where: { provider: "google", providerId: sub },
      })) ??
      (await prisma.user.findUnique({ where: { email } }));

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name, email, provider: "google", providerId: sub },
      });
    } else {
      user = await prisma.user.create({
        data: {
          role: "client",
          name,
          email,
          phone: "",
          passwordHash: await hashPassword(`google:${sub}`),
          cityId: "tj_dushanbe",
          address: "",
          provider: "google",
          providerId: sub,
        },
      });
    }

    await setSessionCookie(user.id);
    return NextResponse.json({
      sub,
      email,
      name,
      picture: data.picture || null,
      user: toPublicUser(user),
    });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

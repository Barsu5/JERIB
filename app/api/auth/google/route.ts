import { NextResponse } from "next/server";

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
  try {
    const body = (await req.json()) as { accessToken?: string };
    const accessToken = body.accessToken?.trim();
    if (!accessToken) {
      return NextResponse.json({ error: "missing_token" }, { status: 400 });
    }

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

    if (!verified) {
      return NextResponse.json({ error: "email_not_verified" }, { status: 403 });
    }

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

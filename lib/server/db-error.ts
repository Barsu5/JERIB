import { NextResponse } from "next/server";

export function dbUnavailable() {
  return NextResponse.json(
    { error: "database_unavailable", message: "DATABASE_URL is not configured" },
    { status: 503 }
  );
}

export function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: "forbidden" }, { status: 403 });
}

export function badRequest(error: string, detail?: unknown) {
  return NextResponse.json({ error, detail }, { status: 400 });
}

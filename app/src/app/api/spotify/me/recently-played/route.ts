import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: Request) {
  const token = await getToken({ req: req as any });
  if (!token?.accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = "https://api.spotify.com/v1/me/player/recently-played?limit=20";
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token.accessToken}` }, cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

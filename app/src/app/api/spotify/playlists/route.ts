import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: Request) {
  const token = await getToken({ req: req as any });
  if (!token?.accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await fetch("https://api.spotify.com/v1/me/playlists?limit=20", {
    headers: { Authorization: `Bearer ${token.accessToken}` },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

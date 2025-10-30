import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function POST(req: Request) {
  const token = await getToken({ req: req as any });
  if (!token?.accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await fetch("https://api.spotify.com/v1/me/player/play", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token.accessToken}` },
  });

  return NextResponse.json({ ok: res.status === 204 }, { status: res.status === 204 ? 200 : res.status });
}

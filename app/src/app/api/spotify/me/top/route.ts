import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: Request) {
  const token = await getToken({ req: req as any });
  if (!token?.accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = (searchParams.get("type") || "tracks") as "tracks"|"artists";
  const range = searchParams.get("range") || "medium_term"; // short_term|medium_term|long_term
  const limit = Number(searchParams.get("limit") || 20);

  const url = `https://api.spotify.com/v1/me/top/${type}?time_range=${range}&limit=${limit}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token.accessToken}` }, cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

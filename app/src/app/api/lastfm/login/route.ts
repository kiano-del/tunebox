import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.LASTFM_API_KEY!;
  const cb = process.env.LASTFM_CALLBACK!;
  const url = new URL("https://www.last.fm/api/auth/");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("cb", cb);
  return NextResponse.redirect(url.toString(), { status: 302 });
}

import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: Request) {
  const token = await getToken({ req: req as any });
  if (!token) return NextResponse.json({ authenticated: false }, { status: 200 });
  const scopes = typeof token.scope === "string" ? token.scope.split(" ") : [];
  return NextResponse.json({
    authenticated: true,
    expires: token.exp,
    scopes,
    hasPlaybackModify: scopes.includes("user-modify-playback-state"),
    hasReadEmail: scopes.includes("user-read-email")
  });
}

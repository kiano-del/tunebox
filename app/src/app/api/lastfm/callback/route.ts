import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { buildApiSig } from "@/lib/lastfm/sign";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) {
    // Kein Token => zurück zur App
    return NextResponse.redirect(new URL("/", url.origin));
  }

  // User muss in der App eingeloggt sein (NextAuth), damit wir sein Profil updaten können
  const auth = await getToken({ req: req as any });
  if (!auth) {
    // Noch nicht eingeloggt? Zur Signin-Seite, danach wiederkommen
    const signin = new URL("/api/auth/signin", url.origin);
    return NextResponse.redirect(signin.toString());
  }
  const userId = (auth as any).sub;

  const apiKey = process.env.LASTFM_API_KEY!;
  const secret = process.env.LASTFM_API_SECRET!;

  // Signatur für auth.getSession berechnen
  const params = {
    api_key: apiKey,
    method: "auth.getSession",
    token,
  };
  const api_sig = buildApiSig(params, secret);

  const sessionUrl = new URL("https://ws.audioscrobbler.com/2.0/");
  sessionUrl.searchParams.set("method", "auth.getSession");
  sessionUrl.searchParams.set("api_key", apiKey);
  sessionUrl.searchParams.set("token", token);
  sessionUrl.searchParams.set("api_sig", api_sig);
  sessionUrl.searchParams.set("format", "json");

  const rsp = await fetch(sessionUrl.toString(), { cache: "no-store" });
  const json = await rsp.json().catch(() => ({}));

  if (!rsp.ok || !json?.session?.key) {
    // Fehler? Zurück mit kurzer Meldung
    const back = new URL("/", url.origin);
    back.searchParams.set("lfm_error", "auth_failed");
    return NextResponse.redirect(back.toString());
  }

  const sessionKey = json.session.key as string;
  const username   = json.session.name as string;

  // In deinem Profil speichern
  const { error } = await (await import("@/lib/supabaseAdmin")).supabaseAdmin
    .from("profiles")
    .update({ lastfm_username: username, lastfm_session_key: sessionKey })
    .eq("id", userId);

  // Zurück zu /me
  const redirect = new URL("/me", url.origin);
  if (error) redirect.searchParams.set("lfm", "save_error");
  else redirect.searchParams.set("lfm", "linked");
  return NextResponse.redirect(redirect.toString());
}

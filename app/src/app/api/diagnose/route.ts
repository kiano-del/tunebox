import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import fs from "fs";
import path from "path";

function exists(p: string) {
  try { return fs.existsSync(path.join(process.cwd(), p)); } catch { return false; }
}
async function spotifyGET(url: string, accessToken: string) {
  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    const ct = res.headers.get("content-type");
    const body = ct && ct.includes("application/json") ? await res.json().catch(() => ({})) : {};
    return { ok: res.ok, status: res.status, body };
  } catch (e:any) {
    return { ok: false, status: 0, error: String(e) };
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const host = url.origin;

  // 1) ENV-Check (nur Booleans)
  const env = (k:string)=> Boolean(process.env[k]);
  const envReport = {
    NEXTAUTH_URL: env("NEXTAUTH_URL"),
    NEXTAUTH_SECRET: env("NEXTAUTH_SECRET"),
    SPOTIFY_CLIENT_ID: env("SPOTIFY_CLIENT_ID"),
    SPOTIFY_CLIENT_SECRET: env("SPOTIFY_CLIENT_SECRET"),
  };

  // 2) Files/Struktur
  const files = {
    "tailwind.config.js": exists("tailwind.config.js"),
    "next.config.mjs": exists("next.config.mjs"),
    "src/app/layout.tsx": exists("src/app/layout.tsx"),
    "src/app/providers.tsx": exists("src/app/providers.tsx"),
    "src/app/globals.css": exists("src/app/globals.css"),
    "src/app/page.tsx": exists("src/app/page.tsx"),
    "src/app/playlists/page.tsx": exists("src/app/playlists/page.tsx"),
    "src/app/player/page.tsx": exists("src/app/player/page.tsx"),
    "src/app/api/spotify/playlists/route.ts": exists("src/app/api/spotify/playlists/route.ts"),
    "src/app/api/spotify/player/play/route.ts": exists("src/app/api/spotify/player/play/route.ts"),
    "src/app/api/spotify/player/pause/route.ts": exists("src/app/api/spotify/player/pause/route.ts"),
    "src/app/api/spotify/player/next/route.ts": exists("src/app/api/spotify/player/next/route.ts"),
    "src/app/api/health/route.ts": exists("src/app/api/health/route.ts"),
    "src/app/api/debug/token/route.ts": exists("src/app/api/debug/token/route.ts"),
    "src/app/api/diagnose/route.ts": exists("src/app/api/diagnose/route.ts"),
  };

  // 3) Tailwind content-Pfade grob prüfen
  let tailwindContentOK = false;
  try {
    const tcfg = fs.readFileSync("tailwind.config.js", "utf8");
    tailwindContentOK = ["./src/app", "./src/components", "./src/lib"].every(p => tcfg.includes(p));
  } catch {}

  // 4) Next experimental.allowedDevOrigins (nur Hinweis)
  let hasAllowedDevOrigins = false;
  try {
    const ncfg = fs.readFileSync("next.config.mjs", "utf8");
    hasAllowedDevOrigins = ncfg.includes("allowedDevOrigins");
  } catch {}

  // 5) Runtime/Node
  const runtime = {
    node: process.versions.node,
    platform: process.platform,
    arch: process.arch
  };

  // 6) Auth/Token & Spotify Tests
  const token = await getToken({ req: req as any });
  const authenticated = Boolean(token);
  const scopes = token?.scope ? String(token.scope).split(" ") : [];
  const hasPlaybackModify = scopes.includes("user-modify-playback-state");
  const hasReadEmail = scopes.includes("user-read-email");

  let me:any = null, playlists:any = null, player:any = null;
  if (token?.accessToken) {
    me = await spotifyGET("https://api.spotify.com/v1/me", token.accessToken as string);
    playlists = await spotifyGET("https://api.spotify.com/v1/me/playlists?limit=1", token.accessToken as string);
    player = await spotifyGET("https://api.spotify.com/v1/me/player", token.accessToken as string);
  }

  // 7) Sanity: stimmt NEXTAUTH_URL grob mit Host?
  const nextauthUrl = process.env.NEXTAUTH_URL || "";
  const nextauthMatchesHost = nextauthUrl ? nextauthUrl.includes("localhost:3000") || nextauthUrl.includes("127.0.0.1:3000") : false;

  return NextResponse.json({
    ok: true,
    host,
    runtime,
    env: envReport,
    files,
    tailwindContentOK,
    hasAllowedDevOrigins,
    auth: {
      authenticated,
      expires: token?.exp ?? null,
      scopes,
      hasPlaybackModify,
      hasReadEmail
    },
    nextauth: {
      NEXTAUTH_URL: nextauthUrl || null,
      nextauthMatchesHost
    },
    spotify: {
      me,
      playlists,
      player
    }
  });
}

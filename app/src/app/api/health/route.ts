import { NextResponse } from "next/server";

export async function GET() {
  const env = (k:string) => (process.env[k] ? true : false);
  return NextResponse.json({
    ok: true,
    tailwindCss: true, // wir haben globals.css angelegt
    env: {
      NEXTAUTH_URL: env("NEXTAUTH_URL"),
      NEXTAUTH_SECRET: env("NEXTAUTH_SECRET"),
      SPOTIFY_CLIENT_ID: env("SPOTIFY_CLIENT_ID"),
      SPOTIFY_CLIENT_SECRET: env("SPOTIFY_CLIENT_SECRET"),
    }
  });
}

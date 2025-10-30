import type { NextAuthOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

async function refreshSpotifyToken(token: any) {
  try {
    const params = new URLSearchParams();
    params.set("grant_type", "refresh_token");
    params.set("refresh_token", token.refreshToken);

    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await res.json();
    if (!res.ok) throw data;

    return {
      ...token,
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? token.refreshToken,
      expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
    };
  } catch (e) {
    return { ...token, error: "RefreshAccessTokenError" as const };
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            "user-read-email",
            "user-read-private",
            "playlist-read-private",
            "user-read-playback-state",
            "user-modify-playback-state"
          ].join(" "),
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken  = (account as any).access_token;
        token.refreshToken = (account as any).refresh_token;
        token.expiresAt    = ((account as any).expires_at ?? 0) * 1000;
        return token;
      }
      if (token.expiresAt && Date.now() < (token.expiresAt as number)) {
        return token;
      }
      return await refreshSpotifyToken(token);
    },
    async session({ session, token }) {
      (session as any).accessToken  = (token as any).accessToken;
      (session as any).refreshToken = (token as any).refreshToken;
      (session as any).expiresAt    = (token as any).expiresAt;
      (session as any).error        = (token as any).error ?? null;
      return session;
    },
  },
};

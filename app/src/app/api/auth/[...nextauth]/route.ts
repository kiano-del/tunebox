import NextAuth, { NextAuthOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            "user-read-email",
            "playlist-read-private",
            "user-top-read",
            "user-read-recently-played",
            "user-library-read",
            "user-read-playback-state" // optional, fuer Statusanzeigen
          ].join(" "),
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        // @ts-ignore
        token.accessToken = account.access_token;
        // @ts-ignore
        token.refreshToken = account.refresh_token;
        // @ts-ignore
        token.expires_at = account.expires_at;
        // @ts-ignore
        token.scope = account.scope;
      }
      return token;
    },
    async session({ session, token }) {
      // @ts-ignore
      session.accessToken = token.accessToken;
      // @ts-ignore
      session.scope = token.scope;
      return session;
    },
  },
};
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

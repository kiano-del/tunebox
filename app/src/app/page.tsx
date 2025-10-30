"use client";
import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    (async () => {
      if (session && !synced) {
        await fetch("/api/profile/sync", { method: "POST" });
        setSynced(true);
      }
    })();
  }, [session, synced]);

  if (status === "loading") return <main className="p-6">Lade Sessionâ€¦</main>;

  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-bold">tunebox í¾§</h1>

      {session ? (
        <div className="space-y-4">
          <p>Angemeldet als <b>{session.user?.email ?? session.user?.name ?? "Unbekannt"}</b></p>
          <div className="flex gap-3">
            <button onClick={() => signOut()} className="px-3 py-2 bg-neutral-800 rounded hover:bg-neutral-700">Sign out</button>
            <Link href="/playlists" className="px-3 py-2 bg-emerald-600 rounded hover:bg-emerald-500">Meine Playlists</Link>
            <Link href="/player" className="px-3 py-2 bg-sky-600 rounded hover:bg-sky-500">Player</Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p>Nicht angemeldet.</p>
          <button onClick={() => signIn("spotify")} className="px-3 py-2 bg-emerald-600 rounded hover:bg-emerald-500">
            Mit Spotify anmelden
          </button>
        </div>
      )}
    </main>
  );
}

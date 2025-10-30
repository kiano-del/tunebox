"use client";
import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();
  const [tracks, setTracks] = useState<any>(null);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    async function sync() {
      if (session && !synced) {
        await fetch("/api/profile/sync", { method: "POST" });
        setSynced(true);
      }
    }
    sync();
  }, [session, synced]);

  async function loadTopTracks() {
    const res = await fetch("/api/spotify/top-tracks");
    const json = await res.json();
    setTracks(json);
  }

  if (status === "loading") return <main style={{ padding: 24 }}>Lade Sessionâ€¦</main>;

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>tunebox í¾§</h1>

      {session ? (
        <>
          <p>Angemeldet als <b>{session.user?.email ?? session.user?.name ?? "Unbekannt"}</b></p>
          <button onClick={() => signOut()} style={{ marginTop: 12, padding: "8px 12px" }}>
            Sign out
          </button>
          <button onClick={loadTopTracks} style={{ marginLeft: 8, padding: "8px 12px" }}>
            Meine Top-Tracks laden
          </button>
          <pre style={{ marginTop: 16, background: "#111", color: "#0f0", padding: 12, overflowX: "auto" }}>
{JSON.stringify(session, null, 2)}
          </pre>
          <pre style={{ marginTop: 16, whiteSpace: "pre-wrap" }}>
{tracks ? JSON.stringify(tracks, null, 2) : "Noch keine Tracks geladen."}
          </pre>
        </>
      ) : (
        <>
          <p>Nicht angemeldet.</p>
          <button onClick={() => signIn("spotify")} style={{ marginTop: 12, padding: "8px 12px" }}>
            Mit Spotify anmelden
          </button>
        </>
      )}
    </main>
  );
}

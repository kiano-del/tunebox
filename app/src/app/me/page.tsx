"use client";
import { useEffect, useState } from "react";

type Item = any;

export default function MePage() {
  const [topTracks, setTopTracks] = useState<Item[]>([]);
  const [topArtists, setTopArtists] = useState<Item[]>([]);
  const [recent, setRecent] = useState<Item[]>([]);
  const [saved, setSaved] = useState<Item[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [lfmMsg, setLfmMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [tt, ta, rp, st] = await Promise.all([
          fetch("/api/spotify/me/top?type=tracks&range=medium_term&limit=10").then(r=>r.json()),
          fetch("/api/spotify/me/top?type=artists&range=medium_term&limit=10").then(r=>r.json()),
          fetch("/api/spotify/me/recently-played").then(r=>r.json()),
          fetch("/api/spotify/library/saved-tracks?limit=10").then(r=>r.json()),
        ]);
        setTopTracks(tt.items ?? []);
        setTopArtists(ta.items ?? []);
        setRecent(rp.items ?? []);
        setSaved(st.items ?? []);
      } catch (e:any) {
        setErr(e.message || "Unbekannter Fehler");
      } finally {
        setLoading(false);
      }
    })();

    const u = new URL(window.location.href);
    const m = u.searchParams.get("lfm");
    if (m) setLfmMsg(m === "linked" ? "Last.fm verbunden!" : "Fehler beim Verknüpfen.");
  }, []);

  if (loading) return <main className="p-6">Lade dein Profil…</main>;
  if (err) return <main className="p-6 text-red-400">Fehler: {err}</main>;

  return (
    <main className="space-y-8">
      <h1 className="text-2xl font-semibold">Dein Musik-Dashboard</h1>

      <section className="space-y-3">
        <h2 className="text-xl font-medium">Top Tracks (medium term)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {topTracks.map((t:any)=>(
            <div key={t.id} className="p-3 rounded bg-neutral-900">
              <div className="font-medium">{t.name}</div>
              <div className="text-sm text-neutral-400">{t.artists?.map((a:any)=>a.name).join(", ")}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-medium">Top Artists (medium term)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {topArtists.map((a:any)=>(
            <div key={a.id} className="p-3 rounded bg-neutral-900">
              <div className="font-medium">{a.name}</div>
              <div className="text-sm text-neutral-400">{a.genres?.slice(0,2).join(", ")}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-medium">Recently Played (Spotify)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {recent.map((r:any)=>(
            <div key={r.played_at+ (r.track?.id||Math.random())} className="p-3 rounded bg-neutral-900">
              <div className="font-medium">{r.track?.name}</div>
              <div className="text-sm text-neutral-400">{r.track?.artists?.map((a:any)=>a.name).join(", ")}</div>
              <div className="text-xs text-neutral-500 mt-1">Played: {new Date(r.played_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-medium">Last.fm (kostenlos verbinden)</h2>
        <div className="flex items-center gap-3">
          <a href="/api/lastfm/login" className="px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-500">
            Mit Last.fm verknüpfen
          </a>
          <button
            onClick={async ()=>{
              const res = await fetch("/api/lastfm/import?limit=50",{ method:"POST" });
              const j = await res.json().catch(()=> ({}));
              alert(res.ok ? `Importiert: ${j.imported ?? 0}` : (j.error || res.status));
            }}
            className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700"
          >
            Scrobbles importieren
          </button>
        </div>
        {lfmMsg && <div className="text-sm text-neutral-400">{lfmMsg}</div>}
      </section>
    </main>
  );
}

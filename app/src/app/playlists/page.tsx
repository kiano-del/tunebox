"use client";
import { useEffect, useState } from "react";

type Playlist = { id: string; name: string; images?: { url: string }[]; tracks?: { total: number } };

export default function PlaylistsPage() {
  const [items, setItems] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch("/api/spotify/playlists");
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || res.statusText);
        setItems(json.items ?? []);
      } catch (e:any) {
        setErr(e.message ?? "Unbekannter Fehler");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <main className="p-6">Lade Playlists…</main>;
  if (err) return <main className="p-6 text-red-400">Fehler: {err}</main>;

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Meine Playlists</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((p) => (
          <div key={p.id} className="flex items-center gap-4 p-3 rounded bg-neutral-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.images?.[0]?.url ?? "/favicon.ico"} alt={p.name} className="w-16 h-16 rounded object-cover" />
            <div>
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-neutral-400">{p.tracks?.total ?? 0} Tracks</div>
            </div>
          </div>
        ))}
        {!items.length && <div className="text-neutral-400">Keine Playlists gefunden.</div>}
      </div>
    </main>
  );
}

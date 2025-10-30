"use client";
async function call(url: string) {
  const res = await fetch(url, { method: "POST" });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    alert("Fehler: " + (j.error ?? res.status));
  }
}
export default function PlayerPage() {
  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Player</h1>
      <div className="flex gap-3">
        <button onClick={() => call("/api/spotify/player/play")} className="px-3 py-2 bg-emerald-600 rounded hover:bg-emerald-500">Play</button>
        <button onClick={() => call("/api/spotify/player/pause")} className="px-3 py-2 bg-amber-600 rounded hover:bg-amber-500">Pause</button>
        <button onClick={() => call("/api/spotify/player/next")} className="px-3 py-2 bg-sky-600 rounded hover:bg-sky-500">Next ▶</button>
      </div>
      <p className="text-neutral-400 text-sm">Hinweis: Ein aktives Spotify-Device muss laufen (App offen & ausgewählt).</p>
    </main>
  );
}

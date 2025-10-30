"use client";
import { useEffect, useState } from "react";

export default function RatingsPage() {
  const [ratings, setRatings] = useState<any[]>([]);
  const [rating, setRating] = useState<number>(8);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/ratings");
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || res.statusText);
      setRatings(j.items || []);
    } catch (e:any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function save() {
    const payload = {
      entity_type: "album",
      entity_id: "spotify:album:test",
      rating,
      note,
    };
    const res = await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = await res.json().catch(()=> ({}));
    if (!res.ok) return alert(j.error || res.status);
    setNote("");
    await load();
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Ratings (Server-API)</h1>

      <div className="flex gap-2">
        <input
          type="number" min={1} max={10}
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="px-2 py-1 rounded bg-neutral-800 w-24"
        />
        <input
          placeholder="Notiz"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="px-2 py-1 rounded bg-neutral-800 flex-1"
        />
        <button onClick={save} className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500">
          Speichern
        </button>
      </div>

      {loading && <div>Lade…</div>}
      {err && <div className="text-red-400">Fehler: {err}</div>}

      <div className="space-y-3">
        {ratings.map((r) => (
          <div key={r.id} className="p-3 rounded bg-neutral-900">
            <div className="font-medium">{r.entity_type}: {r.entity_id}</div>
            <div>⭐ {r.rating}/10</div>
            {r.note && <div className="text-neutral-400">{r.note}</div>}
            <div className="text-xs text-neutral-500">{new Date(r.created_at).toLocaleString()}</div>
          </div>
        ))}
        {!loading && !ratings.length && <div className="text-neutral-400">Noch keine Ratings.</div>}
      </div>
    </main>
  );
}

"use client";
import Link from "next/link";
export default function Home() {
  return (
    <main className="min-h-[40vh] grid place-items-center">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold">tunebox</h1>
        <p className="text-neutral-400">Dein Musik-Dashboard (read-only)</p>
        <div className="flex justify-center gap-3">
          <Link href="/me" className="px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-500">Zu /me</Link>
          <Link href="/playlists" className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700">Playlists</Link>
        </div>
      </div>
    </main>
  );
}

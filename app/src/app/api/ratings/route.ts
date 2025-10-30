import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  const token = await getToken({ req: req as any });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // mappe NextAuth -> unsere profiles.id (auth.uid Äquivalent)
  const userId = (token as any).sub || (token as any).uid || (token as any).userId;
  if (!userId) return NextResponse.json({ error: "Missing user id" }, { status: 400 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? undefined;
  const entity = searchParams.get("entity_id") ?? undefined;

  let q = supabaseAdmin.from("ratings").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (type) q = q.eq("entity_type", type);
  if (entity) q = q.eq("entity_id", entity);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request) {
  const token = await getToken({ req: req as any });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (token as any).sub || (token as any).uid || (token as any).userId;
  if (!userId) return NextResponse.json({ error: "Missing user id" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const { entity_type, entity_id, rating, note } = body || {};

  if (!entity_type || !entity_id || !rating) {
    return NextResponse.json({ error: "entity_type, entity_id, rating required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("ratings")
    .upsert(
      { user_id: userId, entity_type, entity_id, rating, note },
      { onConflict: "user_id,entity_type,entity_id" }
    )
    .select("*");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, item: data?.[0] ?? null });
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const email = session.user.email;
  const display_name = session.user.name ?? null;
  const avatar_url = session.user.image ?? null;

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .upsert({ email, display_name, avatar_url }, { onConflict: "email" })
    .select()
    .single();

  if (error) return NextResponse.json({ ok: false, error }, { status: 500 });
  return NextResponse.json({ ok: true, profile: data });
}

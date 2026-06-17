import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const runtime = "nodejs";

async function authedClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );
}

export async function POST(req: NextRequest) {
  const supabase = await authedClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { logId, challengeId, hide } = await req.json();
  if (!logId || !challengeId) return NextResponse.json({ error: "missing fields" }, { status: 400 });

  const { data: challenge } = await supabase
    .from("challenges")
    .select("created_by")
    .eq("id", challengeId)
    .single();

  const isHost = challenge?.created_by === user.id;

  const { data: log } = await supabase.from("logs").select("member_id").eq("id", logId).single();
  if (!log) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { data: member } = await supabase
    .from("members")
    .select("user_id")
    .eq("id", log.member_id)
    .single();

  const isOwner = member?.user_id === user.id;
  if (!isHost && !isOwner) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  if (hide && isHost) {
    const { error } = await supabase.from("logs").update({ hidden: true }).eq("id", logId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, hidden: true });
  }

  const { error } = await supabase.from("logs").delete().eq("id", logId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

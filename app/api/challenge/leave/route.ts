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
    },
  );
}

export async function POST(req: NextRequest) {
  const supabase = await authedClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { challengeId } = await req.json();
  if (!challengeId) {
    return NextResponse.json({ error: "missing challengeId" }, { status: 400 });
  }

  const { data: member, error: findErr } = await supabase
    .from("members")
    .select("id")
    .eq("challenge_id", challengeId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (findErr) return NextResponse.json({ error: findErr.message }, { status: 400 });
  if (!member) return NextResponse.json({ error: "not a member" }, { status: 404 });

  const { error } = await supabase.from("members").delete().eq("id", member.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}

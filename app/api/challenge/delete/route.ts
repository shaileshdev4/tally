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

  const { data: challenge } = await supabase
    .from("challenges")
    .select("created_by, is_demo, slug")
    .eq("id", challengeId)
    .single();

  if (!challenge || challenge.created_by !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (challenge.is_demo) {
    return NextResponse.json({ error: "demo challenges cannot be deleted" }, { status: 400 });
  }

  const { error } = await supabase.from("challenges").delete().eq("id", challengeId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, slug: challenge.slug });
}

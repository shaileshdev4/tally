import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { challengeId, memberId } = await req.json();
  if (!challengeId || !memberId) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const admin = supabaseAdmin();
  if (!admin)
    return NextResponse.json({ error: "server config" }, { status: 503 });

  const { data: integration } = await admin
    .from("member_integrations")
    .select("access_token")
    .eq("user_id", user.id)
    .eq("provider", "strava")
    .maybeSingle();

  if (!integration)
    return NextResponse.json(
      { error: "strava not connected" },
      { status: 400 },
    );

  const after = Math.floor((Date.now() - 7 * 86400000) / 1000);
  const actRes = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=20`,
    { headers: { Authorization: `Bearer ${integration.access_token}` } },
  );

  if (!actRes.ok)
    return NextResponse.json({ error: "strava fetch failed" }, { status: 502 });

  const activities = (await actRes.json()) as {
    distance?: number;
    name?: string;
  }[];
  const miles = activities.reduce((s, a) => s + (a.distance ?? 0) / 1609.34, 0);
  const rounded = Math.round(miles * 10) / 10;

  if (rounded <= 0) return NextResponse.json({ imported: 0, miles: 0 });

  const { data: challenge } = await admin
    .from("challenges")
    .select("unit")
    .eq("id", challengeId)
    .single();
  const amount =
    challenge?.unit === "km"
      ? Math.round(
          activities.reduce((s, a) => s + (a.distance ?? 0) / 1000, 0) * 10,
        ) / 10
      : rounded;

  await admin.from("logs").insert({
    member_id: memberId,
    challenge_id: challengeId,
    amount,
    note: `Strava sync -${activities.length} activities`,
  });

  return NextResponse.json({ imported: activities.length, amount });
}

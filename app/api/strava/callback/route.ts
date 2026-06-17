import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const origin = req.nextUrl.origin;
  const next = state ? decodeURIComponent(state) : "/profile/settings";

  if (!code) return NextResponse.redirect(`${origin}${next}?strava=denied`);

  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${origin}${next}?strava=unconfigured`);
  }

  const tokenRes = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
    }),
  });

  const token = await tokenRes.json();
  if (!token.access_token) return NextResponse.redirect(`${origin}${next}?strava=failed`);

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${origin}/auth/complete?next=${encodeURIComponent(next)}`);

  const admin = supabaseAdmin();
  if (admin) {
    await admin.from("member_integrations").upsert(
      {
        user_id: user.id,
        provider: "strava",
        access_token: token.access_token,
        refresh_token: token.refresh_token,
        expires_at: new Date(token.expires_at * 1000).toISOString(),
        athlete_id: String(token.athlete?.id ?? ""),
      },
      { onConflict: "user_id,provider" }
    );
  }

  return NextResponse.redirect(`${origin}${next}?strava=connected`);
}

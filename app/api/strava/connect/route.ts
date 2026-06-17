import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const origin = req.nextUrl.origin;
  const next = req.nextUrl.searchParams.get("next") ?? "/profile/settings";

  if (!clientId) {
    return NextResponse.redirect(`${origin}/profile/settings?strava=unconfigured`);
  }

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: `${origin}/api/strava/callback`,
    approval_prompt: "auto",
    scope: "activity:read",
    state: encodeURIComponent(next),
  });

  return NextResponse.redirect(`https://www.strava.com/oauth/authorize?${params}`);
}

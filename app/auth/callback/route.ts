import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (all: { name: string; value: string; options: CookieOptions }[]) => {
            all.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          },
        },
      }
    );
    const { data: sessionData } = await supabase.auth.exchangeCodeForSession(code);
    const user = sessionData?.session?.user;
    if (user) {
      const isNewUser = Date.now() - new Date(user.created_at).getTime() < 60000;
      try {
        await fetch("https://data.pendo.io/data/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-pendo-integration-key": "0e1e4fd5-4549-44f4-b518-d179ee03238c",
          },
          body: JSON.stringify({
            type: "track",
            event: "sign_in_completed",
            visitorId: user.id,
            accountId: user.id,
            timestamp: Date.now(),
            properties: {
              auth_method: user.app_metadata?.provider ?? "unknown",
              is_new_user: isNewUser,
              redirect_destination: next,
            },
          }),
        });
      } catch {}
    }
  }

  const complete = `/auth/complete?next=${encodeURIComponent(next)}`;
  return NextResponse.redirect(`${origin}${complete}`);
}

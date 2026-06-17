import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const admin = supabaseAdmin();
  if (!admin) return NextResponse.json({ error: "server config" }, { status: 503 });

  const { event, properties, userId: clientUserId } = await req.json();
  if (!event) return NextResponse.json({ error: "missing event" }, { status: 400 });

  let userId: string | null = typeof clientUserId === "string" ? clientUserId : null;

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (all: { name: string; value: string; options: CookieOptions }[]) => {
          try {
            all.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            /* noop */
          }
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (user) userId = user.id;

  await admin.from("analytics_events").insert({
    event: String(event).slice(0, 64),
    properties: properties ?? {},
    user_id: userId,
  });

  return NextResponse.json({ ok: true });
}

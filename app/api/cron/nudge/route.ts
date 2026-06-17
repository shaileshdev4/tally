import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = supabaseAdmin();
  if (!admin) return NextResponse.json({ ok: false, reason: "no admin" });

  const today = new Date().toISOString().slice(0, 10);

  const { data: challenges } = await admin
    .from("challenges")
    .select("id, name, slug")
    .eq("status", "active")
    .gt("ends_at", new Date().toISOString());

  let sent = 0;

  for (const c of challenges ?? []) {
    const { data: board } = await admin
      .from("leaderboard")
      .select("*")
      .eq("challenge_id", c.id);
    if (!board?.length) continue;

    const needNudge = board.filter(
      (r) => !r.logged_today && Number(r.current_streak) > 0,
    );
    if (!needNudge.length) continue;

    for (const row of needNudge) {
      if (!row.user_id) continue;
      const { data: userData } = await admin.auth.admin.getUserById(
        row.user_id,
      );
      const email = userData.user?.email;
      if (!email) continue;

      const ok = await sendEmail({
        to: email,
        subject: `Keep your ${row.current_streak}-day streak alive`,
        html: `<p>Hey ${row.display_name} -you haven't logged today in <strong>${c.name}</strong>.</p><p><a href="${SITE}/c/${c.slug}">Log now</a></p>`,
      });
      if (ok) sent++;
    }
  }

  return NextResponse.json({ ok: true, sent, date: today });
}

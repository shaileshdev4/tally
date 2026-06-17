import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/email";
import { groqText } from "@/lib/groq";

export const runtime = "nodejs";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = supabaseAdmin();
  if (!admin) return NextResponse.json({ ok: false, reason: "no admin" });

  const { data: challenges } = await admin
    .from("challenges")
    .select("id, name, slug, unit, cadence")
    .eq("status", "active")
    .gt("ends_at", new Date().toISOString());

  let sent = 0;

  for (const c of challenges ?? []) {
    const { data: board } = await admin
      .from("leaderboard")
      .select("*")
      .eq("challenge_id", c.id);
    if (!board?.length) continue;

    const { data: activity } = await admin
      .from("logs")
      .select("amount, note, created_at, member:members(display_name)")
      .eq("challenge_id", c.id)
      .eq("hidden", false)
      .order("created_at", { ascending: false })
      .limit(8);

    const ranked = [...board]
      .sort((a, b) => Number(b.total) - Number(a.total))
      .map((r, i) => `${i + 1}. ${r.display_name}: ${r.total} ${c.unit}`)
      .join("\n");

    const notes = (activity ?? [])
      .map((a) => {
        const m = a.member as
          | { display_name: string }
          | { display_name: string }[]
          | null;
        const name = Array.isArray(m) ? m[0]?.display_name : m?.display_name;
        return name
          ? `${name}: ${a.amount} ${c.unit}${a.note ? ` -"${a.note}"` : ""}`
          : null;
      })
      .filter(Boolean)
      .join("\n");

    const recap =
      (await groqText(
        "Write a playful 2-3 sentence weekly recap for a friend group challenge. Name people. No emojis.",
        `Challenge: ${c.name}\nLeaderboard:\n${ranked}\n\nRecent activity:\n${notes || "Quiet week."}`,
      )) ??
      `Week in review for ${c.name}: the board moved. Log something this week.`;

    const { data: members } = await admin
      .from("members")
      .select("user_id")
      .eq("challenge_id", c.id)
      .not("user_id", "is", null);

    const userIds = Array.from(
      new Set((members ?? []).map((m) => m.user_id).filter(Boolean)),
    ) as string[];

    for (const uid of userIds) {
      const { data: userData } = await admin.auth.admin.getUserById(uid);
      const email = userData.user?.email;
      if (!email) continue;

      const ok = await sendEmail({
        to: email,
        subject: `Weekly recap: ${c.name}`,
        html: `<p>${recap}</p><p><a href="${SITE}/c/${c.slug}">Open leaderboard</a></p>`,
      });
      if (ok) sent++;
    }
  }

  return NextResponse.json({ ok: true, sent, ranAt: new Date().toISOString() });
}

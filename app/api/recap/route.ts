import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { groqText } from "@/lib/groq";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!rateLimit(`recap:${clientKey(req)}`, 10)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { challengeId } = await req.json();
  if (!challengeId)
    return NextResponse.json({ error: "missing challengeId" }, { status: 400 });

  const { data: challenge } = await supabase
    .from("challenges")
    .select("*")
    .eq("id", challengeId)
    .single();
  const { data: board } = await supabase
    .from("leaderboard")
    .select("*")
    .eq("challenge_id", challengeId);

  if (!challenge || !board || board.length === 0) {
    return NextResponse.json({
      recap: "No activity yet -log something and check back.",
    });
  }

  const isDaily = challenge.cadence === "daily";
  const ranked = [...board]
    .sort((a, b) =>
      isDaily
        ? Number(b.current_streak) - Number(a.current_streak)
        : Number(b.total) - Number(a.total),
    )
    .map((r, i) => {
      const score = isDaily
        ? `${r.current_streak}-day streak`
        : `${r.total} ${challenge.unit}`;
      return `${i + 1}. ${r.display_name}: ${score}${r.logged_today ? " (logged today)" : ""}`;
    })
    .join("\n");

  const { data: activity } = await supabase
    .from("logs")
    .select(
      "amount, note, created_at, flag_count, member:members(display_name)",
    )
    .eq("challenge_id", challengeId)
    .eq("hidden", false)
    .order("created_at", { ascending: false })
    .limit(10);

  const notes = (activity ?? [])
    .map((a) => {
      const m = a.member as
        | { display_name: string }
        | { display_name: string }[]
        | null;
      const name = Array.isArray(m) ? m[0]?.display_name : m?.display_name;
      if (!name) return null;
      const flag = a.flag_count >= 2 ? " [flagged]" : "";
      return `${name}: ${a.amount} ${challenge.unit}${a.note ? ` -"${a.note}"` : ""}${flag}`;
    })
    .filter(Boolean)
    .join("\n");

  const fallback = () => {
    const leader = [...board].sort(
      (a, b) => Number(b.total) - Number(a.total),
    )[0];
    return `${leader.display_name} is running away with it in "${challenge.name}". Everyone else: the gap isn't closing itself.`;
  };

  const recap = await groqText(
    "You're the smack-talking commentator for a friendly group challenge. Write 2-3 funny sentences. Playful, never mean. Reference specific people and recent notes. No emojis.",
    `Challenge: "${challenge.name}" (${challenge.unit}, ${challenge.cadence})\nLeaderboard:\n${ranked}\n\nRecent logs:\n${notes || "No notes yet."}`,
  );

  return NextResponse.json({ recap: recap ?? fallback() });
}

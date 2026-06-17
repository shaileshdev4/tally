import type { Challenge, LeaderboardRow } from "@/lib/supabase";

export type BadgeId =
  | "leader"
  | "halfway"
  | "goal"
  | "streak7"
  | "streak3"
  | "consistent"
  | "today";

export type Badge = {
  id: BadgeId;
  label: string;
  tone: "ember" | "gold" | "mint";
};

// Derive badges for every member from the current leaderboard snapshot.
// Pure + deterministic -no new tables, works retroactively on seeded data.
export function badgesForBoard(
  challenge: Challenge,
  rows: LeaderboardRow[],
): Record<string, Badge[]> {
  const result: Record<string, Badge[]> = {};
  if (rows.length === 0) return result;

  const sorted = [...rows].sort((a, b) => Number(b.total) - Number(a.total));
  const leaderId = sorted[0]?.member_id;
  const maxActiveDays = Math.max(...rows.map((r) => Number(r.active_days)));

  const target = challenge.goal ?? defaultTarget(challenge.unit);

  for (const r of rows) {
    const badges: Badge[] = [];
    const total = Number(r.total);
    const activeDays = Number(r.active_days);

    if (r.member_id === leaderId && total > 0) {
      badges.push({ id: "leader", label: "In the lead", tone: "ember" });
    }
    if (target && total >= target * 0.5 && total < target) {
      badges.push({ id: "halfway", label: "Halfway there", tone: "gold" });
    }
    if (target && total >= target) {
      badges.push({ id: "goal", label: "Goal smashed", tone: "mint" });
    }
    if (activeDays >= 7) {
      badges.push({ id: "streak7", label: "7-day streak", tone: "ember" });
    } else if (activeDays >= 3) {
      badges.push({ id: "streak3", label: "On a roll", tone: "gold" });
    }
    if (activeDays === maxActiveDays && maxActiveDays >= 3 && rows.length > 1) {
      badges.push({ id: "consistent", label: "Most consistent", tone: "mint" });
    }
    if (r.logged_today) {
      badges.push({ id: "today", label: "Logged today", tone: "mint" });
    }

    if (badges.length) result[r.member_id] = dedupe(badges);
  }
  return result;
}

function defaultTarget(unit: string): number {
  switch (unit) {
    case "pages":
      return 500;
    case "miles":
      return 100;
    case "days":
      return 30;
    case "reps":
      return 1000;
    case "minutes":
      return 600;
    default:
      return 100;
  }
}

function dedupe(badges: Badge[]): Badge[] {
  const seen = new Set<string>();
  return badges.filter((b) =>
    seen.has(b.id) ? false : (seen.add(b.id), true),
  );
}

import { createServerSupabase } from "@/lib/auth-server";

export { profileInitials } from "@/lib/display-name";

export type ChallengeSummary = {
  id: string;
  slug: string;
  name: string;
  unit: string;
  ends_at: string | null;
  status?: string;
  category: string;
  cover_type: string;
  cover_value: string | null;
  created_at?: string;
};

export type ActivityLog = {
  log_id: string;
  amount: number;
  note: string | null;
  logged_on: string;
  created_at: string;
  challenge_slug: string;
  challenge_name: string;
  challenge_unit: string;
};

export type ProfileStats = {
  joinedCount: number;
  hostedCount: number;
  logCount: number;
};

export type ProfileContext = {
  joined: ChallengeSummary[];
  hosted: ChallengeSummary[];
  hostedOnly: ChallengeSummary[];
};

function normalizeChallenges(
  memberships: { challenge: unknown }[] | null
): ChallengeSummary[] {
  return (memberships ?? [])
    .map((m) => {
      const c = m.challenge as unknown;
      return Array.isArray(c) ? c[0] : c;
    })
    .filter(Boolean) as ChallengeSummary[];
}

export async function fetchProfileContext(userId: string): Promise<ProfileContext> {
  const supabase = createServerSupabase();

  const [{ data: memberships }, { data: hosted }] = await Promise.all([
    supabase.from("members").select("challenge:challenges(*)").eq("user_id", userId),
    supabase
      .from("challenges")
      .select("*")
      .eq("created_by", userId)
      .order("created_at", { ascending: false }),
  ]);

  const joined = normalizeChallenges(memberships);
  const hostedList = (hosted ?? []) as ChallengeSummary[];
  const joinedIds = new Set(joined.map((c) => c.id));

  return {
    joined,
    hosted: hostedList,
    hostedOnly: hostedList.filter((c) => !joinedIds.has(c.id)),
  };
}

export async function fetchProfileStats(userId: string): Promise<ProfileStats> {
  const supabase = createServerSupabase();
  const { joined, hosted } = await fetchProfileContext(userId);

  const { count: logCount } = await supabase
    .from("user_recent_logs")
    .select("log_id", { count: "exact", head: true })
    .eq("user_id", userId);

  return {
    joinedCount: joined.length,
    hostedCount: hosted.length,
    logCount: logCount ?? 0,
  };
}

export async function fetchProfileActivity(
  userId: string,
  limit = 50
): Promise<ActivityLog[]> {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("user_recent_logs")
    .select(
      "log_id, amount, note, logged_on, created_at, challenge_slug, challenge_name, challenge_unit"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as ActivityLog[];
}

export async function fetchStravaConnected(userId: string): Promise<boolean> {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("member_integrations")
    .select("id")
    .eq("user_id", userId)
    .eq("provider", "strava")
    .maybeSingle();
  return Boolean(data);
}

import { supabase, type Challenge, type LeaderboardRow } from "@/lib/supabase";

export async function getChallengeBySlug(slug: string): Promise<Challenge | null> {
  const { data } = await supabase.from("challenges").select("*").eq("slug", slug).single();
  return (data as Challenge) ?? null;
}

export async function getBoard(challengeId: string): Promise<LeaderboardRow[]> {
  const { data } = await supabase.from("leaderboard").select("*").eq("challenge_id", challengeId);
  return (data as LeaderboardRow[]) ?? [];
}

export async function getDemo(): Promise<Challenge | null> {
  const { data } = await supabase
    .from("challenges")
    .select("*")
    .eq("is_demo", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return (data as Challenge) ?? null;
}

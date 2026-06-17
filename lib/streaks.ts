import { supabase } from "@/lib/supabase";

export async function currentStreak(memberId: string): Promise<number> {
  const { data } = await supabase
    .from("member_streaks")
    .select("current_streak")
    .eq("member_id", memberId)
    .maybeSingle();
  return (data?.current_streak as number) ?? 0;
}

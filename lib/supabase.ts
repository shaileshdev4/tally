import { createBrowserClient } from "@supabase/ssr";

// Fallbacks keep `next build` from throwing when env vars aren't present at
// build time (e.g. CI). Real values are injected on Vercel at runtime.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

// Cookie-based client so middleware + server components share the same session.
export const supabase = createBrowserClient(url, anon);

export type LeaderboardRow = {
  member_id: string;
  challenge_id: string;
  display_name: string;
  user_id: string | null;
  avatar_seed: string | null;
  total: number;
  logged_today: boolean;
  active_days: number;
  proof_count: number;
  flag_total: number;
  current_streak: number;
};

export type Challenge = {
  id: string;
  slug: string;
  name: string;
  unit: string;
  goal: number | null;
  ends_at: string | null;
  is_demo: boolean;
  created_at: string;
  category: string;
  template_id: string | null;
  cover_type: string;
  cover_value: string | null;
  cadence: string;
  created_by: string | null;
  status?: string;
  strava_enabled?: boolean;
};

export type Log = {
  id: string;
  member_id: string;
  challenge_id: string;
  amount: number;
  logged_on: string;
  created_at: string;
  note: string | null;
  proof_path: string | null;
  flag_count: number;
  flagged_by: string[] | null;
};

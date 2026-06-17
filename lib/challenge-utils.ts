import type { Challenge } from "@/lib/supabase";

export function isChallengeEnded(challenge: Challenge): boolean {
  if (challenge.status === "ended") return true;
  if (challenge.ends_at && new Date(challenge.ends_at).getTime() < Date.now()) return true;
  return false;
}

export function isHost(challenge: Challenge, userId: string | null | undefined): boolean {
  return Boolean(userId && challenge.created_by && challenge.created_by === userId);
}

const FLAG_THRESHOLD = 2;

export function isLogDisputed(flagCount: number): boolean {
  return flagCount >= FLAG_THRESHOLD;
}

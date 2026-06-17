import {
  fetchProfileContext,
  fetchProfileActivity,
  profileInitials,
  type ChallengeSummary,
  type ActivityLog,
} from "@/lib/profile-data";

export type { ChallengeSummary, ActivityLog as RecentLog };
export { profileInitials };

export async function fetchMeDashboard(userId: string) {
  const { joined, hosted, hostedOnly } = await fetchProfileContext(userId);
  const recentLogs = await fetchProfileActivity(userId, 12);
  return { joined, hosted, hostedOnly, recentLogs };
}

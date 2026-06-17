import { getServerUser } from "@/lib/auth-server";
import { fetchProfileActivity, fetchProfileStats } from "@/lib/profile-data";
import ProfileActivityList from "@/components/profile/ProfileActivityList";

export default async function ProfileHistoryPage() {
  const user = await getServerUser();
  if (!user) return null;

  const [logs, stats] = await Promise.all([
    fetchProfileActivity(user.id, 100),
    fetchProfileStats(user.id),
  ]);

  return (
    <div className="animate-fade-in">
      <div>
        <h1 className="text-title text-2xl sm:text-3xl">History</h1>
        <p className="text-meta mt-1 normal-case tracking-normal">
          {stats.logCount === 0
            ? "Your logged entries will show up here."
            : `${stats.logCount} ${stats.logCount === 1 ? "entry" : "entries"} across your challenges.`}
        </p>
      </div>

      <div className="mt-8">
        <ProfileActivityList
          logs={logs}
          timeline
          emptyMessage="No activity yet. Log progress in a challenge to build your history."
        />
      </div>

      {logs.length >= 100 && (
        <p className="text-meta mt-4 text-center">
          Showing your 100 most recent entries
        </p>
      )}
    </div>
  );
}

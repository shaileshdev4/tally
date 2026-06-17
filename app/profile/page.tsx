import Link from "next/link";
import { HiArrowRight } from "react-icons/hi2";
import { getServerUser } from "@/lib/auth-server";
import {
  fetchProfileActivity,
  fetchProfileContext,
  fetchProfileStats,
} from "@/lib/profile-data";
import ProfileStatsCards from "@/components/profile/ProfileStatsCards";
import ProfileChallengeRow from "@/components/profile/ProfileChallengeRow";
import ProfileActivityList from "@/components/profile/ProfileActivityList";

export default async function ProfileOverviewPage() {
  const user = await getServerUser();
  if (!user) return null;

  const [stats, { joined, hosted }, recentLogs] = await Promise.all([
    fetchProfileStats(user.id),
    fetchProfileContext(user.id),
    fetchProfileActivity(user.id, 6),
  ]);

  const activeJoined = joined.filter((c) => c.status !== "ended").slice(0, 3);
  const recentHosted = hosted.slice(0, 3);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-title text-2xl sm:text-3xl">Overview</h1>
          <p className="text-meta mt-1 normal-case tracking-normal">
            Your challenges and latest activity at a glance.
          </p>
        </div>
        <Link href="/create" className="btn-primary text-sm lg:hidden">
          New challenge
        </Link>
      </div>

      <div className="mt-6">
        <ProfileStatsCards stats={stats} />
      </div>

      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-label">Active challenges</h2>
          {joined.length > 0 && (
            <Link
              href="/profile/challenges"
              className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted transition hover:text-accent"
            >
              View all
              <HiArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          )}
        </div>
        {!activeJoined.length ? (
          <div className="glass-panel border-dashed p-6 text-sm text-muted">
            No active challenges.{" "}
            <Link href="/" className="text-accent underline">
              Join one
            </Link>{" "}
            or{" "}
            <Link href="/create" className="text-accent underline">
              create your own
            </Link>
            .
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {activeJoined.map((c) => (
              <li key={c.id}>
                <ProfileChallengeRow challenge={c} badge="Joined" featured />
              </li>
            ))}
          </ul>
        )}
      </section>

      {recentHosted.length > 0 && (
        <section className="mt-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-label">Hosting</h2>
            <Link
              href="/profile/challenges"
              className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted transition hover:text-accent"
            >
              View all
              <HiArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          </div>
          <ul className="flex flex-col gap-3">
            {recentHosted.map((c) => (
              <li key={`host-${c.id}`}>
                <ProfileChallengeRow challenge={c} badge="Hosted" featured />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-label">Recent activity</h2>
          {stats.logCount > 0 && (
            <Link
              href="/profile/history"
              className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted transition hover:text-accent"
            >
              Full history
              <HiArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          )}
        </div>
        <ProfileActivityList
          logs={recentLogs}
          emptyMessage="No logs yet. Join a challenge and log your first entry."
        />
      </section>
    </div>
  );
}

import Link from "next/link";
import { getServerUser } from "@/lib/auth-server";
import { fetchProfileContext } from "@/lib/profile-data";
import ProfileChallengeRow from "@/components/profile/ProfileChallengeRow";

export default async function ProfileChallengesPage() {
  const user = await getServerUser();
  if (!user) return null;

  const { joined, hosted, hostedOnly } = await fetchProfileContext(user.id);
  const joinedIds = new Set(joined.map((c) => c.id));

  const joinedActive = joined.filter((c) => c.status !== "ended");
  const joinedEnded = joined.filter((c) => c.status === "ended");

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-title text-2xl sm:text-3xl">Challenges</h1>
          <p className="text-meta mt-1 normal-case tracking-normal">
            Every challenge you&apos;ve joined or hosted.
          </p>
        </div>
        <Link href="/create" className="btn-primary text-sm">
          New challenge
        </Link>
      </div>

      <section className="mt-10">
        <h2 className="section-label mb-3">Joined · {joined.length}</h2>
        {!joined.length ? (
          <div className="glass-panel border-dashed p-6 text-sm text-muted">
            You haven&apos;t joined any challenges yet. Open an invite link from a friend to get
            started.
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {joinedActive.length > 0 && (
              <div>
                <h3 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted/80">
                  Active
                </h3>
                <ul className="flex flex-col gap-3">
                  {joinedActive.map((c) => (
                    <li key={c.id}>
                      <ProfileChallengeRow challenge={c} badge="Joined" featured manage="leave" />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {joinedEnded.length > 0 && (
              <div>
                <h3 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted/80">
                  Ended
                </h3>
                <ul className="flex flex-col gap-3">
                  {joinedEnded.map((c) => (
                    <li key={`ended-${c.id}`}>
                      <ProfileChallengeRow challenge={c} badge="Joined" manage="leave" />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="section-label mb-3">Hosted · {hosted.length}</h2>
        {!hosted.length ? (
          <div className="glass-panel border-dashed p-6 text-sm text-muted">
            <Link href="/create" className="text-accent underline">
              Create a challenge
            </Link>{" "}
            to host one for your group.
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {hosted.map((c) => (
              <li key={`host-${c.id}`}>
                <ProfileChallengeRow
                  challenge={c}
                  badge="Hosted"
                  featured
                  manage={joinedIds.has(c.id) ? "both" : "delete"}
                />
              </li>
            ))}
          </ul>
        )}
        {hostedOnly.length > 0 && (
          <p className="glass-panel mt-4 px-4 py-3 text-xs text-muted">
            You&apos;re hosting {hostedOnly.length}{" "}
            {hostedOnly.length === 1 ? "challenge" : "challenges"} you haven&apos;t joined yet.
            Open the challenge page to appear on the leaderboard.
          </p>
        )}
      </section>
    </div>
  );
}

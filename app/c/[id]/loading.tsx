import { LeaderboardSkeleton } from "@/components/Skeleton";

export default function ChallengeLoading() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <div className="mb-6 h-44 animate-pulse rounded-2xl bg-line/40" />
      <LeaderboardSkeleton />
    </main>
  );
}

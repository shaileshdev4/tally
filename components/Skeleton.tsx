export default function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-line/60 ${className}`} aria-hidden />;
}

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-16 w-full" />
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}

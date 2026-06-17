import type { ProfileStats } from "@/lib/profile-data";

/** Compact stats row - main stats live in identity rail; this is optional duplicate for overview */
export default function ProfileStatsCards({ stats }: { stats: ProfileStats }) {
  const items = [
    { label: "Joined", value: stats.joinedCount, hint: "challenges" },
    { label: "Hosted", value: stats.hostedCount, hint: "you run" },
    { label: "Logs", value: stats.logCount, hint: "entries" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 lg:hidden">
      {items.map((item) => (
        <div
          key={item.label}
          className="glass-panel bg-mesh px-3 py-4 text-center"
        >
          <div className="font-display text-2xl font-bold text-ink">
            {item.value}
          </div>
          <div className="text-meta mt-0.5">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

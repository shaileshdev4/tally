import Link from "next/link";
import type { ActivityLog } from "@/lib/profile-data";
import { timeAgo, fmt } from "@/lib/utils";

export default function ProfileActivityList({
  logs,
  emptyMessage,
  timeline = false,
}: {
  logs: ActivityLog[];
  emptyMessage: string;
  timeline?: boolean;
}) {
  if (!logs.length) {
    return (
      <div className="glass-panel rounded-2xl border-dashed p-8 text-center text-sm text-muted">
        {emptyMessage}
      </div>
    );
  }

  if (!timeline) {
    return (
      <ul className="flex flex-col gap-2">
        {logs.map((log) => (
          <li key={log.log_id}>
            <ActivityRow log={log} compact />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="timeline-rail flex flex-col gap-1">
      {logs.map((log) => (
        <li key={log.log_id} className="relative pb-4">
          <span className="timeline-dot" aria-hidden />
          <ActivityRow log={log} />
        </li>
      ))}
    </ul>
  );
}

function ActivityRow({ log, compact }: { log: ActivityLog; compact?: boolean }) {
  return (
    <Link
      href={`/c/${log.challenge_slug}`}
      className={`card-standard block transition hover:border-muted ${
        compact ? "px-4 py-3" : "px-4 py-3.5"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm">
            <span className="text-title">
              +{fmt(log.amount)} {log.challenge_unit}
            </span>
            <span className="text-muted"> · {log.challenge_name}</span>
          </div>
          {log.note && (
            <div className="mt-0.5 truncate text-xs text-muted/90">
              &ldquo;{log.note}&rdquo;
            </div>
          )}
          {!compact && (
            <div className="text-meta mt-1.5 opacity-80">Logged for {log.logged_on}</div>
          )}
        </div>
        <span className="text-meta shrink-0 uppercase tracking-wider">
          {timeAgo(log.created_at)}
        </span>
      </div>
    </Link>
  );
}

import Link from "next/link";
import Cover from "@/components/Cover";
import CategoryTheme from "@/components/CategoryTheme";
import ChallengeManageActions from "@/components/ChallengeManageActions";
import { isCategory } from "@/lib/categories";
import type { ChallengeSummary } from "@/lib/profile-data";
import { daysLeft } from "@/lib/utils";

export default function ProfileChallengeRow({
  challenge,
  badge,
  featured,
  manage,
}: {
  challenge: ChallengeSummary;
  badge?: "Joined" | "Hosted";
  featured?: boolean;
  /** Show leave / delete controls */
  manage?: "leave" | "delete" | "both" | false;
}) {
  const cat = isCategory(challenge.category) ? challenge.category : "custom";

  return (
    <CategoryTheme category={cat}>
      <div
        className={`${featured ? "card-featured" : "card-standard"} flex overflow-hidden`}
      >
        <Link href={`/c/${challenge.slug}`} className="flex min-w-0 flex-1 overflow-hidden">
          <div className="relative h-20 w-24 shrink-0 sm:h-24 sm:w-28">
            <Cover
              type={challenge.cover_type}
              value={challenge.cover_value}
              seed={challenge.slug}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-surface/80" />
          </div>
          <div className="relative flex min-w-0 flex-1 items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <div className="truncate text-title">{challenge.name}</div>
                {badge && (
                  <span className="rounded-full border border-line/60 bg-canvas/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">
                    {badge}
                  </span>
                )}
              </div>
              <div className="text-meta mt-0.5">counting {challenge.unit}</div>
            </div>
            <div className="text-meta shrink-0 text-right">
              {challenge.status === "ended" ? (
                <span className="text-gold">Ended</span>
              ) : challenge.ends_at ? (
                <>{daysLeft(challenge.ends_at)}d left</>
              ) : null}
            </div>
          </div>
        </Link>
        {manage && (
          <div className="flex shrink-0 flex-col justify-center border-l border-line px-3 py-2">
            <ChallengeManageActions
              challengeId={challenge.id}
              slug={challenge.slug}
              variant={manage}
              layout="stack"
            />
          </div>
        )}
      </div>
    </CategoryTheme>
  );
}

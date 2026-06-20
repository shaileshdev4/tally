"use client";

import ChallengeManageActions from "@/components/ChallengeManageActions";

export default function MemberControls({
  challengeId,
  slug,
}: {
  challengeId: string;
  slug: string;
}) {
  return (
    <details className="group rounded-xl border border-line/60 bg-surface/30 text-sm">
      <summary className="cursor-pointer list-none px-4 py-3 font-mono text-xs uppercase tracking-widest text-muted marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="group-open:text-ink">Your membership</span>
      </summary>
      <div className="border-t border-line/60 px-4 pb-4 pt-3">
        <p className="text-muted">
          Leave if you no longer want to track this challenge. Your logs will be removed
          from the board.
        </p>
        <div className="mt-3">
          <ChallengeManageActions
            challengeId={challengeId}
            slug={slug}
            variant="leave"
            onDone={() => window.location.reload()}
          />
        </div>
      </div>
    </details>
  );
}

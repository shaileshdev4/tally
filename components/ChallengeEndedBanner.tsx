import { HiLockClosed } from "react-icons/hi2";

export default function ChallengeEndedBanner({ name }: { name: string }) {
  return (
    <div className="mb-6 flex items-center gap-3 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3">
      <HiLockClosed className="h-5 w-5 shrink-0 text-gold" aria-hidden />
      <div>
        <div className="font-display font-medium text-ink">Challenge ended</div>
        <p className="text-sm text-muted">
          {name} is finished -the board is read-only.
        </p>
      </div>
    </div>
  );
}

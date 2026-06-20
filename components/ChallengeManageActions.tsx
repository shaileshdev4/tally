"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { HiArrowPath, HiTrash } from "react-icons/hi2";
import { track } from "@/lib/analytics";

type Props = {
  challengeId: string;
  slug: string;
  variant: "leave" | "delete" | "both";
  layout?: "row" | "stack";
  onDone?: () => void;
};

export default function ChallengeManageActions({
  challengeId,
  slug,
  variant,
  layout = "row",
  onDone,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<"leave" | "delete" | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function leave() {
    if (
      !confirm(
        "Leave this challenge? Your entries will be removed from the leaderboard.",
      )
    ) {
      return;
    }
    setBusy("leave");
    setErr(null);
    const res = await fetch("/api/challenge/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId }),
    });
    setBusy(null);
    if (!res.ok) {
      const d = await res.json();
      setErr(d.error ?? "Could not leave");
      return;
    }
    track("challenge_left", { slug });
    window.pendo?.track("challenge_left", {
      slug,
    });
    onDone?.();
    router.refresh();
  }

  async function remove() {
    if (
      !confirm(
        "Delete this challenge permanently? Everyone loses access and all logs are removed.",
      )
    ) {
      return;
    }
    setBusy("delete");
    setErr(null);
    const res = await fetch("/api/challenge/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId }),
    });
    setBusy(null);
    if (!res.ok) {
      const d = await res.json();
      setErr(d.error ?? "Could not delete");
      return;
    }
    track("challenge_deleted", { slug });
    window.pendo?.track("challenge_deleted", {
      slug,
    });
    onDone?.();
    router.push("/profile/challenges");
    router.refresh();
  }

  const showLeave = variant === "leave" || variant === "both";
  const showDelete = variant === "delete" || variant === "both";

  return (
    <div
      className={
        layout === "stack"
          ? "flex flex-col gap-2"
          : "flex flex-wrap items-center gap-2"
      }
      onClick={(e) => e.preventDefault()}
    >
      {showLeave && (
        <button
          type="button"
          onClick={leave}
          disabled={busy !== null}
          className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-50"
        >
          {busy === "leave" ? (
            <HiArrowPath className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : null}
          Leave
        </button>
      )}
      {showDelete && (
        <button
          type="button"
          onClick={remove}
          disabled={busy !== null}
          className="inline-flex items-center gap-1 rounded-xl border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition hover:bg-accent/20 disabled:opacity-50"
        >
          {busy === "delete" ? (
            <HiArrowPath className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : (
            <HiTrash className="h-3.5 w-3.5" aria-hidden />
          )}
          Delete
        </button>
      )}
      {err && <p className="w-full font-mono text-xs text-accent">{err}</p>}
    </div>
  );
}

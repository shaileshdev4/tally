"use client";

import { useState } from "react";
import { HiArrowPath, HiStop } from "react-icons/hi2";
import type { Challenge } from "@/lib/supabase";
import { track } from "@/lib/analytics";

export default function HostPanel({
  challenge,
  userId,
}: {
  challenge: Challenge;
  userId: string;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!challenge.created_by || challenge.created_by !== userId) return null;

  async function endChallenge() {
    if (!confirm("End this challenge now? The board becomes read-only.")) return;
    setBusy(true);
    const res = await fetch("/api/challenge/end", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId: challenge.id }),
    });
    setBusy(false);
    if (res.ok) {
      track("challenge_ended", { slug: challenge.slug });
      pendo?.track("challenge_ended", {
        slug: challenge.slug,
        category: challenge.category,
        cadence: challenge.cadence,
        unit: challenge.unit,
      });
      setMsg("Challenge ended.");
      window.location.reload();
    } else {
      const d = await res.json();
      setMsg(d.error ?? "Failed");
    }
  }

  return (
    <details className="group rounded-xl border border-line/60 bg-surface/30 text-sm">
      <summary className="cursor-pointer list-none px-4 py-3 font-mono text-xs uppercase tracking-widest text-muted marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="group-open:text-ink">Host controls</span>
      </summary>
      <div className="border-t border-line/60 px-4 pb-4 pt-3">
        <p className="text-muted">End early or hide disputed logs from the feed.</p>
        <button
          type="button"
          onClick={endChallenge}
          disabled={busy || challenge.status === "ended"}
          className="btn-secondary mt-3 text-sm disabled:opacity-50"
        >
          {busy ? <HiArrowPath className="h-4 w-4 animate-spin" /> : <HiStop className="h-4 w-4" />}
          End challenge
        </button>
        {msg && <p className="mt-2 font-mono text-xs text-muted">{msg}</p>}
      </div>
    </details>
  );
}

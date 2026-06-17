"use client";

import { useEffect, useState } from "react";
import { HiFire } from "react-icons/hi2";
import { supabase } from "@/lib/supabase";

export default function StreakNudge({
  memberId,
  onLog,
}: {
  memberId: string;
  onLog: () => void;
}) {
  const [show, setShow] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data: todayLog } = await supabase
        .from("logs")
        .select("id")
        .eq("member_id", memberId)
        .eq("logged_on", today)
        .limit(1);
      const { data: st } = await supabase
        .from("member_streaks")
        .select("current_streak")
        .eq("member_id", memberId)
        .maybeSingle();
      setStreak((st?.current_streak as number) ?? 0);
      setShow(!todayLog?.length);
    })();
  }, [memberId]);

  if (!show) return null;

  return (
    <div
      className="flex items-center justify-between gap-3 border-t border-line/60 px-4 py-3"
      style={{ background: "var(--accent-soft)" }}
    >
      <span className="text-sm text-ink">
        {streak > 0 ? (
          <span className="inline-flex items-center gap-1.5">
            <HiFire className="h-4 w-4 shrink-0 text-accent" aria-hidden />
            Keep your <b>{streak}-day streak</b> alive -log today.
          </span>
        ) : (
          "You haven't logged today. Get on the board."
        )}
      </span>
      <button
        type="button"
        onClick={onLog}
        className="shrink-0 rounded-lg px-3 py-1.5 font-display text-sm font-medium text-canvas"
        style={{ background: "var(--accent)" }}
      >
        Log now
      </button>
    </div>
  );
}

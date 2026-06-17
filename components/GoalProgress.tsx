"use client";

import { useEffect } from "react";
import { fmt } from "@/lib/utils";

export default function GoalProgress({
  current,
  goal,
  unit,
  label,
}: {
  current: number;
  goal: number;
  unit: string;
  label?: string;
}) {
  const pct = Math.min(100, Math.round((current / Math.max(goal, 1)) * 100));

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">
          {label ?? "Progress"}
        </span>
        <span className="font-mono tabular-nums text-ink">
          {fmt(current)}
          <span className="text-muted"> / {fmt(goal)} {unit}</span>
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-line/80">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: "var(--accent)",
            boxShadow: pct > 0 ? "0 0 12px color-mix(in srgb, var(--accent) 50%, transparent)" : undefined,
          }}
        />
      </div>
    </div>
  );
}

export function useGoalTarget(goal: number | null, unit: string, cadence: string): number | null {
  if (goal != null && goal > 0) return goal;
  return null;
}

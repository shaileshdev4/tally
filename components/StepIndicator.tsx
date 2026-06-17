"use client";

import { HiCheck } from "react-icons/hi2";

export default function StepIndicator({ step, total = 2 }: { step: number; total?: number }) {
  return (
    <div className="mb-6 flex items-center gap-2" aria-label={`Step ${step} of ${total}`}>
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <div key={n} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full font-mono text-xs font-bold transition ${
                active || done ? "text-canvas" : "border border-line text-muted"
              }`}
              style={active || done ? { background: "var(--accent)" } : undefined}
            >
              {done ? <HiCheck className="h-3.5 w-3.5" aria-hidden /> : n}
            </div>
            {n < total && (
              <div
                className="h-px w-8 sm:w-12"
                style={{ background: done ? "var(--accent)" : "#2A2F38" }}
              />
            )}
          </div>
        );
      })}
      <span className="ml-2 font-mono text-xs text-muted">
        Step {step} of {total}
      </span>
    </div>
  );
}

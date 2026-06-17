"use client";

import { useEffect } from "react";
import { HiCheck } from "react-icons/hi2";

export default function Toast({
  message,
  onClear,
}: {
  message: string | null;
  onClear: () => void;
}) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClear, 2400);
    return () => clearTimeout(t);
  }, [message, onClear]);

  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-line bg-canvas/95 px-4 py-2.5 shadow-lg backdrop-blur-md sm:bottom-8"
    >
      <HiCheck className="h-4 w-4 shrink-0 text-mint" aria-hidden />
      <span className="font-display text-sm text-ink">{message}</span>
    </div>
  );
}

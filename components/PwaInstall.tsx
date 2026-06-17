"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HiArrowDownTray } from "react-icons/hi2";
import LogoMark from "@/components/LogoMark";
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};

export default function PwaInstall() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferred || dismissed) return null;

  return (
    <div className="border-b border-line bg-surface/80 px-5 py-2 text-center text-sm">
      <button
        type="button"
        onClick={async () => {
          await deferred.prompt();
          setDismissed(true);
        }}
        className="inline-flex items-center gap-2 font-display text-accent hover:underline"
      >
        <LogoMark size={18} className="shadow-[0_0_10px_-2px_rgba(255,107,53,0.45)]" />
        <HiArrowDownTray className="h-4 w-4" />
        Install Tally for quick logging
      </button>
      <span className="mx-2 text-muted">·</span>
      <button type="button" onClick={() => setDismissed(true)} className="text-muted hover:text-ink">
        Dismiss
      </button>
    </div>
  );
}

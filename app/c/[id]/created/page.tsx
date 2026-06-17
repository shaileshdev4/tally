"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { HiCheck, HiLink, HiShare } from "react-icons/hi2";
import Toast from "@/components/Toast";

export default function ChallengeCreatedPage() {
  const params = useParams();
  const slug = params.id as string;
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const inviteUrl =
    typeof window !== "undefined" ? `${window.location.origin}/c/${slug}/join` : "";

  useEffect(() => {
    if (!slug || typeof window === "undefined") return;
    const url = `${window.location.origin}/c/${slug}/join`;
    if (typeof navigator.share === "function") return;
    void navigator.clipboard.writeText(url).then(() => setCopied(true));
  }, [slug]);

  async function share() {
    const url = `${window.location.origin}/c/${slug}/join`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join my Tally challenge",
          text: "Jump on the leaderboard with me",
          url,
        });
        setToast("Invite shared");
        return;
      } catch {
        /* cancelled */
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setToast("Invite link copied");
  }

  return (
    <main className="mx-auto max-w-md px-5 py-16 text-center sm:py-24">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-mint/15 ring-1 ring-mint/40">
        <HiCheck className="h-8 w-8 text-mint" aria-hidden />
      </div>
      <h1 className="font-display text-3xl font-bold text-ink">Challenge is live</h1>
      <p className="mt-2 text-muted">Share this link so friends can join and log progress.</p>

      <div className="mt-6 break-all rounded-xl border border-line bg-surface px-4 py-3 font-mono text-sm text-muted">
        {inviteUrl || `…/c/${slug}/join`}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button type="button" onClick={share} className="btn-primary">
          {typeof navigator !== "undefined" && typeof navigator.share === "function" ? (
            <HiShare className="h-4 w-4" />
          ) : (
            <HiLink className="h-4 w-4" />
          )}
          {copied ? "Link copied" : "Share invite link"}
        </button>
        <Link href={`/c/${slug}/join`} className="btn-secondary">
          Continue to join
        </Link>
      </div>

      <Link href={`/c/${slug}`} className="mt-6 inline-block text-sm text-muted underline hover:text-ink">
        Open challenge board
      </Link>

      <Toast message={toast} onClear={() => setToast(null)} />
    </main>
  );
}

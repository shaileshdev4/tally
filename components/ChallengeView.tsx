"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { HiArrowPath, HiCheck, HiLink, HiPlus, HiShare } from "react-icons/hi2";
import Leaderboard from "@/components/Leaderboard";
import LogModal from "@/components/LogModal";
import ActivityFeed from "@/components/ActivityFeed";
import StreakNudge from "@/components/StreakNudge";
import CoverHero from "@/components/CoverHero";
import CategoryTheme from "@/components/CategoryTheme";
import Toast from "@/components/Toast";
import HostPanel from "@/components/HostPanel";
import ChallengeEndedBanner from "@/components/ChallengeEndedBanner";
import ActivityLiveToast from "@/components/ActivityLiveToast";
import { supabase, type Challenge, type LeaderboardRow } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { daysLeft, fmt } from "@/lib/utils";
import { isChallengeEnded } from "@/lib/challenge-utils";
import { track } from "@/lib/analytics";
import { isCategory, type Category } from "@/lib/categories";

export default function ChallengeView({
  challenge,
  initialRows,
}: {
  challenge: Challenge;
  initialRows: LeaderboardRow[];
}) {
  const [memberId, setMemberId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [liveMsg, setLiveMsg] = useState<string | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [recap, setRecap] = useState<string | null>(null);
  const [recapBusy, setRecapBusy] = useState(false);
  const [stravaBusy, setStravaBusy] = useState(false);

  const ended = isChallengeEnded(challenge);
  const isDaily = challenge.cadence === "daily";
  const isFitness = challenge.category === "fitness";
  const isHost = Boolean(userId && challenge.created_by === userId);

  useEffect(() => {
    track("challenge_view", { slug: challenge.slug });
    (async () => {
      const u = await getUser();
      if (!u) return;
      setUserId(u.id);
      const { data } = await supabase
        .from("members")
        .select("id")
        .eq("challenge_id", challenge.id)
        .eq("user_id", u.id)
        .maybeSingle();
      setMemberId(data?.id ?? null);
    })();
  }, [challenge.id, challenge.slug]);

  useEffect(() => {
    const channel = supabase
      .channel(`live:${challenge.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "logs",
          filter: `challenge_id=eq.${challenge.id}`,
        },
        async (payload) => {
          const row = payload.new as { member_id: string; amount: number };
          const { data: m } = await supabase
            .from("members")
            .select("display_name")
            .eq("id", row.member_id)
            .maybeSingle();
          const name = m?.display_name ?? "Someone";
          setLiveMsg(`${name} logged ${row.amount} ${challenge.unit}`);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [challenge.id, challenge.unit]);

  const shareInvite = useCallback(async () => {
    const url = `${window.location.origin}/c/${challenge.slug}/join`;
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function"
    ) {
      try {
        await navigator.share({
          title: challenge.name,
          text: `Join my Tally challenge: ${challenge.name}`,
          url,
        });
        track("invite_shared", { slug: challenge.slug });
        setToast("Invite shared");
        return;
      } catch {
        /* cancelled */
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    track("invite_copied", { slug: challenge.slug });
    setToast("Invite link copied");
    setTimeout(() => setCopied(false), 1600);
  }, [challenge.name, challenge.slug]);

  async function syncStrava() {
    if (!memberId) return;
    setStravaBusy(true);
    const res = await fetch("/api/strava/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId: challenge.id, memberId }),
    });
    const data = await res.json();
    setStravaBusy(false);
    if (res.ok) {
      track("strava_synced", { slug: challenge.slug, amount: data.amount });
      setToast(`Imported ${data.amount} ${challenge.unit} from Strava`);
    } else {
      setToast(
        data.error === "strava not connected"
          ? "Connect Strava from My challenges"
          : "Strava sync failed",
      );
    }
  }

  async function getRecap() {
    setRecapBusy(true);
    setRecap(null);
    try {
      const res = await fetch("/api/recap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: challenge.id }),
      });
      const data = await res.json();
      setRecap(data.recap ?? "Couldn't generate a recap right now.");
    } catch {
      setRecap("Couldn't generate a recap right now.");
    }
    setRecapBusy(false);
  }

  const dleft = daysLeft(challenge.ends_at);
  const subtitle = [
    `counting ${challenge.unit}`,
    isDaily ? "streak" : null,
    challenge.goal ? `goal ${fmt(challenge.goal)}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const openLog = () => setLogOpen(true);

  return (
    <CategoryTheme
      category={isCategory(challenge.category) ? challenge.category : "custom"}
    >
      <ActivityLiveToast message={liveMsg} />

      <main className="page-shell px-5 py-8 pb-28 sm:py-10 sm:pb-12">
        {ended && <ChallengeEndedBanner name={challenge.name} />}

        <CoverHero
          type={challenge.cover_type}
          value={challenge.cover_value}
          seed={challenge.slug}
          title={challenge.name}
          subtitle={subtitle}
          badge={
            dleft !== null && !ended ? (
              <span className="rounded-full border border-line/80 bg-canvas/80 px-3 py-1 font-mono text-xs text-muted backdrop-blur-sm">
                {dleft} days left
              </span>
            ) : undefined
          }
        />

        {/* Action bar - one place for share, log, join */}
        {!ended && (
          <div className="glass-panel-strong mt-4 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={shareInvite}
                  className="btn-secondary px-3 py-2 text-sm"
                >
                  {copied ? (
                    <>
                      <HiCheck className="h-4 w-4 text-mint" aria-hidden />
                      Copied
                    </>
                  ) : (
                    <>
                      {typeof navigator !== "undefined" &&
                      typeof navigator.share === "function" ? (
                        <HiShare className="h-4 w-4" aria-hidden />
                      ) : (
                        <HiLink className="h-4 w-4" aria-hidden />
                      )}
                      Share
                    </>
                  )}
                </button>
                {memberId && isFitness && (
                  <button
                    type="button"
                    onClick={syncStrava}
                    disabled={stravaBusy}
                    className="btn-secondary px-3 py-2 text-sm disabled:opacity-50"
                  >
                    {stravaBusy ? (
                      <HiArrowPath className="h-4 w-4 animate-spin" />
                    ) : (
                      "Strava"
                    )}
                  </button>
                )}
              </div>
              {memberId ? (
                <button
                  type="button"
                  onClick={openLog}
                  className="btn-primary px-4 py-2 text-sm sm:inline-flex"
                >
                  <HiPlus className="h-4 w-4" aria-hidden />
                  Log progress
                </button>
              ) : (
                <Link
                  href={`/c/${challenge.slug}/join`}
                  className="btn-primary px-4 py-2 text-sm"
                >
                  Join to log
                </Link>
              )}
            </div>
            {memberId && <StreakNudge memberId={memberId} onLog={openLog} />}
          </div>
        )}

        {ended && (
          <div className="mt-4">
            <button
              type="button"
              onClick={shareInvite}
              className="btn-secondary px-4 py-2.5 text-sm"
            >
              <HiLink className="h-4 w-4" aria-hidden />
              Share invite
            </button>
          </div>
        )}

        {logOpen && memberId && (
          <LogModal
            challenge={challenge}
            memberId={memberId}
            onClose={() => setLogOpen(false)}
            onLogged={() => setToast("Progress logged")}
            readOnly={ended}
          />
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
          <section className="rounded-2xl border border-line bg-surface/30 p-5 sm:p-6">
            <div className="mb-4 section-label">Leaderboard</div>
            <Leaderboard
              challenge={challenge}
              initialRows={initialRows}
              highlightMemberId={memberId}
            />
          </section>

          <aside className="flex flex-col gap-4">
            <div className="rounded-2xl border border-line bg-surface/30 p-5">
              <ActivityFeed
                challenge={challenge}
                memberId={memberId}
                userId={userId}
                isHost={isHost}
                onToast={setToast}
              />
            </div>

            <div className="rounded-2xl border border-line bg-surface/30 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="section-label">Recap</div>
                  <p className="mt-1 text-xs text-muted">
                    AI summary from the board
                  </p>
                </div>
                <button
                  type="button"
                  onClick={getRecap}
                  disabled={recapBusy}
                  className="btn-secondary shrink-0 px-3 py-1.5 text-xs disabled:opacity-50"
                >
                  {recapBusy ? (
                    <HiArrowPath className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Generate"
                  )}
                </button>
              </div>
              {recap && (
                <p className="mt-3 animate-fade-in text-sm leading-relaxed text-ink">
                  {recap}
                </p>
              )}
            </div>

            {userId && <HostPanel challenge={challenge} userId={userId} />}
          </aside>
        </div>
      </main>

      {memberId && !ended && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-canvas/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:hidden">
          <button
            type="button"
            onClick={openLog}
            className="btn-primary w-full"
          >
            <HiPlus className="h-4 w-4" aria-hidden />
            Log progress
          </button>
        </div>
      )}

      <Toast message={toast} onClear={() => setToast(null)} />
    </CategoryTheme>
  );
}

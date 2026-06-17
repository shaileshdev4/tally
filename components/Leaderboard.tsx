"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiCheckCircle, HiFire, HiShieldCheck } from "react-icons/hi2";
import { supabase, type LeaderboardRow, type Challenge } from "@/lib/supabase";
import { fmt } from "@/lib/utils";
import { badgesForBoard, type Badge } from "@/lib/badges";
import BadgeIcon from "@/components/BadgeIcon";
import GoalProgress from "@/components/GoalProgress";
import MemberAvatar from "@/components/MemberAvatar";

function rankColor(i: number) {
  if (i === 0) return "text-accent";
  if (i === 1) return "text-gold";
  if (i === 2) return "text-mint";
  return "text-muted";
}

function toneClass(tone: Badge["tone"]) {
  switch (tone) {
    case "ember":
      return "bg-accent/15 text-accent";
    case "gold":
      return "bg-gold/15 text-gold";
    case "mint":
      return "bg-mint/15 text-mint";
  }
}

function BadgeChip({ badge }: { badge: Badge }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide ${toneClass(
        badge.tone,
      )}`}
    >
      <BadgeIcon id={badge.id} />
      {badge.label}
    </span>
  );
}

export default function Leaderboard({
  challenge,
  initialRows,
  highlightMemberId,
}: {
  challenge: Challenge;
  initialRows: LeaderboardRow[];
  highlightMemberId?: string | null;
}) {
  const [rows, setRows] = useState<LeaderboardRow[]>(initialRows);
  const [toast, setToast] = useState<Badge | null>(null);
  const prevBadgeIds = useRef<Set<string> | null>(null);
  const isDaily = challenge.cadence === "daily";

  async function refresh() {
    const { data } = await supabase
      .from("leaderboard")
      .select("*")
      .eq("challenge_id", challenge.id);
    if (data) setRows(data as LeaderboardRow[]);
  }

  useEffect(() => {
    const channel = supabase
      .channel(`board:${challenge.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "logs",
          filter: `challenge_id=eq.${challenge.id}`,
        },
        () => refresh(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "members",
          filter: `challenge_id=eq.${challenge.id}`,
        },
        () => refresh(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge.id]);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) =>
      isDaily
        ? b.current_streak - a.current_streak || b.total - a.total
        : b.total - a.total || a.display_name.localeCompare(b.display_name),
    );
  }, [rows, isDaily]);

  const badges = useMemo(
    () => badgesForBoard(challenge, rows),
    [challenge, rows],
  );

  useEffect(() => {
    if (!highlightMemberId) return;
    const mine = badges[highlightMemberId] ?? [];
    const ids = new Set(mine.map((b) => b.id));
    if (prevBadgeIds.current) {
      const fresh = mine.find((b) => !prevBadgeIds.current!.has(b.id));
      if (fresh) {
        setToast(fresh);
        const t = setTimeout(() => setToast(null), 3200);
        prevBadgeIds.current = ids;
        return () => clearTimeout(t);
      }
    }
    prevBadgeIds.current = ids;
  }, [badges, highlightMemberId]);

  const groupTotal = useMemo(
    () => rows.reduce((s, r) => s + Number(r.total), 0),
    [rows],
  );
  const bestStreak = useMemo(
    () =>
      rows.length ? Math.max(...rows.map((r) => Number(r.current_streak))) : 0,
    [rows],
  );
  const loggedToday = rows.filter((r) => r.logged_today).length;
  const scoreOf = (r: LeaderboardRow) =>
    isDaily ? Number(r.current_streak) : Number(r.total);
  const max = Math.max(1, ...sorted.map(scoreOf));

  const goal = challenge.goal;
  const groupProgress = isDaily ? bestStreak : groupTotal;
  const myRow = highlightMemberId
    ? rows.find((r) => r.member_id === highlightMemberId)
    : null;
  const myProgress = myRow ? scoreOf(myRow) : 0;

  return (
    <div className="relative">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2"
          >
            <div className="flex items-center gap-2 rounded-full border border-accent/40 bg-canvas/95 px-4 py-2 shadow-lg">
              <BadgeIcon id={toast.id} className="h-4 w-4 text-accent" />
              <span className="font-display text-sm font-medium text-ink">
                Badge unlocked:{" "}
                <span className="text-accent">{toast.label}</span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-muted">
            {isDaily ? "Longest streak" : "Group total"}
          </div>
          <div className="font-display text-4xl font-bold tabular-nums text-ink sm:text-5xl">
            {fmt(isDaily ? bestStreak : groupTotal)}{" "}
            <span className="text-xl text-muted sm:text-2xl">
              {isDaily ? (bestStreak === 1 ? "day" : "days") : challenge.unit}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-xs uppercase tracking-widest text-muted">
            Logged today
          </div>
          <div className="font-display text-xl font-bold text-mint sm:text-2xl">
            {loggedToday}
            <span className="text-muted">/{rows.length}</span>
          </div>
        </div>
      </div>

      {goal != null && goal > 0 && (
        <div className="mb-5 space-y-3 rounded-xl border border-line/60 bg-canvas/40 p-4">
          <GoalProgress
            current={groupProgress}
            goal={goal}
            unit={isDaily ? "day streak" : challenge.unit}
            label="Group goal"
          />
          {myRow && (
            <GoalProgress
              current={myProgress}
              goal={goal}
              unit={isDaily ? "day streak" : challenge.unit}
              label="Your progress"
            />
          )}
        </div>
      )}

      <ol className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {sorted.map((r, i) => {
            const score = scoreOf(r);
            const pct = (score / max) * 100;
            const mine = highlightMemberId && r.member_id === highlightMemberId;
            const myBadges = badges[r.member_id] ?? [];
            return (
              <motion.li
                key={r.member_id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
                className={`relative overflow-hidden rounded-lg border ${
                  mine
                    ? "border-accent/60"
                    : Number(r.flag_total) >= 2
                      ? "border-gold/40 opacity-75"
                      : "border-line"
                } bg-surface`}
              >
                <motion.div
                  layout
                  className={`absolute inset-y-0 left-0 ${
                    i === 0 ? "bg-accent/15" : "bg-white/[0.03]"
                  }`}
                  initial={false}
                  animate={{ width: `${pct}%` }}
                  transition={{ type: "spring", stiffness: 200, damping: 30 }}
                />
                <div className="relative flex items-center gap-4 px-4 py-3">
                  <MemberAvatar
                    seed={r.avatar_seed ?? r.display_name}
                    name={r.display_name}
                    size={36}
                  />
                  <div
                    className={`w-6 shrink-0 font-mono text-lg font-bold sm:w-8 ${rankColor(i)}`}
                  >
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 truncate font-display font-medium text-ink">
                      {r.display_name}
                      {mine && (
                        <span className="rounded bg-accent/20 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-accent">
                          you
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 font-mono text-[11px] text-muted">
                      <span>
                        {r.active_days} active{" "}
                        {r.active_days === 1 ? "day" : "days"}
                      </span>
                      {r.logged_today && (
                        <>
                          <span aria-hidden>·</span>
                          <span className="inline-flex items-center gap-0.5 text-mint">
                            <HiCheckCircle className="h-3 w-3" aria-hidden />
                            logged today
                          </span>
                        </>
                      )}
                      {r.current_streak > 0 && (
                        <>
                          <span aria-hidden>·</span>
                          <span className="inline-flex items-center gap-0.5 text-accent">
                            <HiFire className="h-3 w-3" aria-hidden />
                            {r.current_streak}-day
                          </span>
                        </>
                      )}
                      {r.proof_count > 0 && (
                        <>
                          <span aria-hidden>·</span>
                          <span className="inline-flex items-center gap-0.5">
                            <HiShieldCheck className="h-3 w-3" aria-hidden />
                            {r.proof_count} verified
                          </span>
                        </>
                      )}
                    </div>
                    {myBadges.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {myBadges.map((b) => (
                          <BadgeChip key={b.id} badge={b} />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-right font-mono">
                    {isDaily ? (
                      <>
                        <span className="inline-flex items-center gap-1 text-xl font-bold tabular-nums text-ink">
                          <HiFire className="h-4 w-4 text-accent" aria-hidden />
                          {fmt(Number(r.current_streak))}
                        </span>
                        <div className="text-[10px] text-muted">
                          {fmt(Number(r.total))} {challenge.unit}
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-xl font-bold tabular-nums text-ink">
                          {fmt(Number(r.total))}
                        </span>
                        <span className="ml-1 text-xs text-muted">
                          {challenge.unit}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>

      {sorted.length === 0 && (
        <div className="rounded-lg border border-dashed border-line p-8 text-center text-muted">
          No one&apos;s joined yet. Be the first -share the link.
        </div>
      )}
    </div>
  );
}

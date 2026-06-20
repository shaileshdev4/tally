"use client";

import { useEffect, useState } from "react";
import { HiCheck, HiFlag, HiTrash, HiXMark } from "react-icons/hi2";
import { supabase, type Challenge } from "@/lib/supabase";
import { timeAgo } from "@/lib/utils";
import { isLogDisputed } from "@/lib/challenge-utils";
import MemberAvatar from "@/components/MemberAvatar";

type Entry = {
  id: string;
  member_id: string;
  amount: number;
  note: string | null;
  proof_path: string | null;
  flag_count: number;
  flagged_by: string[] | null;
  hidden: boolean;
  created_at: string;
  member: { display_name: string; avatar_seed?: string | null } | null;
};

export default function ActivityFeed({
  challenge,
  memberId,
  userId,
  isHost,
  onToast,
  className = "",
}: {
  challenge: Challenge;
  memberId?: string | null;
  userId?: string | null;
  isHost?: boolean;
  onToast?: (msg: string) => void;
  className?: string;
}) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [flagged, setFlagged] = useState<Set<string>>(new Set());

  async function load() {
    const { data } = await supabase
      .from("logs")
      .select(
        "id, member_id, amount, note, proof_path, flag_count, flagged_by, hidden, created_at, member:members(display_name, avatar_seed)",
      )
      .eq("challenge_id", challenge.id)
      .eq("hidden", false)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) {
      setEntries(
        data.map((row) => {
          const member = row.member as
            | { display_name: string; avatar_seed?: string | null }
            | { display_name: string; avatar_seed?: string | null }[]
            | null;
          const resolved = Array.isArray(member) ? (member[0] ?? null) : member;
          return { ...row, member: resolved } as Entry;
        }),
      );
    }
  }

  useEffect(() => {
    load();
    const ch = supabase
      .channel(`feed:${challenge.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "logs",
          filter: `challenge_id=eq.${challenge.id}`,
        },
        load,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "flags",
          filter: `challenge_id=eq.${challenge.id}`,
        },
        load,
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge.id]);

  async function flag(logId: string) {
    if (!userId) {
      onToast?.("Sign in to flag an entry");
      return;
    }
    if (flagged.has(logId)) return;
    await supabase.rpc("add_flag", {
      p_log: logId,
      p_challenge: challenge.id,
      p_user: userId,
    });
    setFlagged((s) => new Set(s).add(logId));
    window.pendo?.track("log_flagged", {
      slug: challenge.slug,
      log_id: logId,
    });
    onToast?.("Entry flagged for review");
    load();
  }

  async function removeLog(logId: string, hide = false) {
    const res = await fetch("/api/log/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logId, challengeId: challenge.id, hide }),
    });
    if (res.ok) {
      window.pendo?.track("log_deleted", {
        slug: challenge.slug,
        log_id: logId,
        action_type: hide ? "hide" : "delete",
        is_host_action: hide,
      });
      onToast?.(hide ? "Entry hidden from board" : "Log removed");
      load();
    } else {
      const d = await res.json();
      onToast?.(d.error ?? "Could not remove");
    }
  }

  const proofUrl = (p: string) =>
    supabase.storage.from("proofs").getPublicUrl(p).data.publicUrl;

  return (
    <div className={className}>
      <div className="mb-3 section-label">Recent activity</div>

      {!entries.length ? (
        <div className="rounded-lg border border-dashed border-line p-6 text-center text-sm text-muted">
          No logs yet -be the first to post progress.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((e) => {
            const disputed = isLogDisputed(e.flag_count);
            const alreadyFlagged =
              flagged.has(e.id) ||
              (userId != null && e.flagged_by?.includes(userId));
            const isOwn = memberId === e.member_id;
            return (
              <div
                key={e.id}
                className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 ${
                  disputed
                    ? "border-gold/50 bg-gold/5 opacity-80"
                    : "border-line bg-surface"
                }`}
              >
                <MemberAvatar
                  seed={e.member?.avatar_seed ?? e.member?.display_name ?? "?"}
                  name={e.member?.display_name}
                  size={36}
                  className="mt-0.5 shrink-0"
                />
                {e.proof_path && (
                  <button
                    type="button"
                    onClick={() => setLightbox(proofUrl(e.proof_path!))}
                    className="shrink-0 overflow-hidden rounded-md ring-1 ring-line transition hover:ring-muted"
                  >
                    <img
                      src={proofUrl(e.proof_path)}
                      alt="Proof"
                      className="h-12 w-12 object-cover"
                    />
                  </button>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-ink">
                    <b>{e.member?.display_name ?? "Someone"}</b> logged{" "}
                    <b
                      style={{ color: disputed ? "#F5C242" : "var(--accent)" }}
                    >
                      {e.amount} {challenge.unit}
                    </b>
                    {disputed && (
                      <span className="ml-1 font-mono text-[10px] uppercase text-gold">
                        disputed
                      </span>
                    )}
                  </div>
                  {e.note && (
                    <div className="truncate text-xs text-muted">
                      &ldquo;{e.note}&rdquo;
                    </div>
                  )}
                  <div className="mt-0.5 font-mono text-[10px] text-muted">
                    {timeAgo(e.created_at)}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => flag(e.id)}
                    disabled={alreadyFlagged}
                    title="Flag entry"
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-xs ${
                      alreadyFlagged
                        ? "text-mint"
                        : "text-muted hover:bg-surface2"
                    }`}
                  >
                    {alreadyFlagged ? (
                      <HiCheck className="h-3.5 w-3.5" />
                    ) : (
                      <HiFlag className="h-3.5 w-3.5" />
                    )}
                    {e.flag_count > 0 ? e.flag_count : null}
                  </button>
                  {(isOwn || isHost) && (
                    <button
                      type="button"
                      onClick={() => removeLog(e.id, isHost && !isOwn)}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-xs text-muted hover:bg-surface2 hover:text-ink"
                      title={
                        isHost && !isOwn ? "Hide from board" : "Delete your log"
                      }
                    >
                      <HiTrash className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-label="Proof image"
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 rounded-full bg-surface p-2"
            aria-label="Close"
          >
            <HiXMark className="h-5 w-5" />
          </button>
          <img
            src={lightbox}
            alt="Proof full size"
            className="max-h-[85vh] max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

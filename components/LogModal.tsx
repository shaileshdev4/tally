"use client";

import { useEffect, useRef, useState } from "react";
import { HiArrowPath, HiCamera, HiCheck, HiMinus, HiPlus, HiSparkles } from "react-icons/hi2";
import { supabase, type Challenge } from "@/lib/supabase";
import { track } from "@/lib/analytics";
import { queueLog, getQueue } from "@/lib/offline-queue";

export default function LogModal({
  challenge,
  memberId,
  onClose,
  onLogged,
  readOnly = false,
}: {
  challenge: Challenge;
  memberId: string;
  onClose: () => void;
  onLogged: () => void;
  readOnly?: boolean;
}) {
  const [amount, setAmount] = useState(1);
  const [note, setNote] = useState("");
  const [nl, setNl] = useState("");
  const [proofPath, setProofPath] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const conversationId = useRef(crypto.randomUUID());

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!navigator.onLine) return;
    void flushQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function flushQueue() {
    const mine = getQueue().filter(
      (x) => x.challengeId === challenge.id && x.memberId === memberId
    );
    if (!mine.length) return;
    for (const item of mine) {
      await supabase.from("logs").insert({
        member_id: item.memberId,
        challenge_id: item.challengeId,
        amount: item.amount,
        note: item.note,
        proof_path: item.proofPath,
      });
    }
    const rest = getQueue().filter(
      (x) => !(x.challengeId === challenge.id && x.memberId === memberId)
    );
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("tally:offline-logs", JSON.stringify(rest));
    }
  }

  async function parseNl() {
    if (!nl.trim()) return;
    setParsing(true);
    setErr(null);

    const promptMessageId = crypto.randomUUID();
    window.pendo?.trackAgent("prompt", {
      agentId: "kaszrNv-vnPcNcrzb_mRLQF5_-c",
      conversationId: conversationId.current,
      messageId: promptMessageId,
      content: nl,
      suggestedPrompt: false,
    });

    try {
      const res = await fetch("/api/log/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: nl, unit: challenge.unit, cadence: challenge.cadence }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "parse failed");

      window.pendo?.trackAgent("agent_response", {
        agentId: "kaszrNv-vnPcNcrzb_mRLQF5_-c",
        conversationId: conversationId.current,
        messageId: crypto.randomUUID(),
        content: JSON.stringify(data),
        modelUsed: "llama-3.3-70b-versatile",
      });

      if (challenge.cadence !== "daily") setAmount(data.amount);
      if (data.note) setNote(data.note);
      setNl("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not parse");
    }
    setParsing(false);
  }

  async function uploadProof(file: File) {
    setUploading(true);
    const path = `proofs/${challenge.id}/${crypto.randomUUID()}`;
    const { error } = await supabase.storage.from("proofs").upload(path, file);
    if (!error) {
      setProofPath(path);
      const url = supabase.storage.from("proofs").getPublicUrl(path).data.publicUrl;
      setProofUrl(url);
      if (challenge.cadence !== "daily") {
        const visionPromptId = crypto.randomUUID();
        window.pendo?.trackAgent("prompt", {
          agentId: "kaszrNv-vnPcNcrzb_mRLQF5_-c",
          conversationId: conversationId.current,
          messageId: visionPromptId,
          content: `Extract ${challenge.unit} from uploaded image`,
          fileUploaded: true,
        });

        const res = await fetch("/api/log/vision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: url, unit: challenge.unit }),
        });
        if (res.ok) {
          const data = await res.json();

          window.pendo?.trackAgent("agent_response", {
            agentId: "kaszrNv-vnPcNcrzb_mRLQF5_-c",
            conversationId: conversationId.current,
            messageId: crypto.randomUUID(),
            content: JSON.stringify(data),
            modelUsed: "llama-3.2-90b-vision-preview",
          });

          setAmount(data.amount);
          if (data.note) setNote(data.note);
        }
      }
    }
    setUploading(false);
  }

  async function submit() {
    if (readOnly) return;
    setBusy(true);
    setErr(null);
    const payload = {
      member_id: memberId,
      challenge_id: challenge.id,
      amount: challenge.cadence === "daily" ? 1 : amount,
      note: note.trim() || null,
      proof_path: proofPath,
    };

    if (!navigator.onLine) {
      queueLog({
        memberId,
        challengeId: challenge.id,
        amount: payload.amount,
        note: payload.note,
        proofPath: proofPath,
        queuedAt: new Date().toISOString(),
      });
      track("log_queued_offline", { slug: challenge.slug });
      setBusy(false);
      onLogged();
      onClose();
      return;
    }

    const { error } = await supabase.from("logs").insert(payload);
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    track("log_created", { slug: challenge.slug });
    onLogged();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="log-modal-title"
    >
      <div
        className="animate-slide-up w-full max-w-md rounded-t-2xl border border-line bg-surface p-5 shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div id="log-modal-title" className="font-display text-xl font-bold text-ink">
          {readOnly ? "Challenge ended" : "Log progress"}
        </div>

        {readOnly ? (
          <p className="mt-2 text-muted">This challenge is read-only.</p>
        ) : (
          <>
            <div className="mt-3">
              <label className="section-label flex items-center gap-1">
                <HiSparkles className="h-3.5 w-3.5" /> Quick log
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  value={nl}
                  onChange={(e) => setNl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && parseNl()}
                  placeholder={`e.g. ran 3 ${challenge.unit}`}
                  className="input-field min-w-0 flex-1 text-sm"
                />
                <button type="button" onClick={parseNl} disabled={parsing} className="btn-secondary px-3 text-sm">
                  {parsing ? <HiArrowPath className="h-4 w-4 animate-spin" /> : "Parse"}
                </button>
              </div>
            </div>

            {challenge.cadence === "daily" ? (
              <p className="mt-3 text-muted">
                Mark today done for <span className="font-medium text-ink">{challenge.name}</span>.
              </p>
            ) : (
              <div className="mt-4 flex items-center gap-2">
                <button type="button" onClick={() => setAmount((a) => Math.max(1, a - 1))} className="flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-surface2" aria-label="Decrease">
                  <HiMinus className="h-4 w-4" />
                </button>
                <input type="number" min={1} value={amount} onChange={(e) => setAmount(Math.max(1, Number(e.target.value) || 1))} className="input-field h-11 w-24 text-center font-mono" />
                <button type="button" onClick={() => setAmount((a) => a + 1)} className="flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-surface2" aria-label="Increase">
                  <HiPlus className="h-4 w-4" />
                </button>
                <span className="font-mono text-sm text-muted">{challenge.unit}</span>
              </div>
            )}

            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note (optional)" rows={2} className="input-field mt-4 w-full resize-none text-sm" />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-line px-3 py-2.5 text-sm text-muted hover:text-ink disabled:opacity-50">
              {uploading ? <HiArrowPath className="h-4 w-4 animate-spin" /> : proofPath ? <HiCheck className="h-4 w-4 text-mint" /> : <HiCamera className="h-4 w-4" />}
              {uploading ? "Uploading" : proofPath ? "Proof attached (AI read)" : "Attach proof (optional)"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && uploadProof(e.target.files[0])} />
            {err && <p className="mt-2 font-mono text-sm text-accent">{err}</p>}
          </>
        )}

        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 py-3">Cancel</button>
          {!readOnly && (
            <button type="button" onClick={submit} disabled={busy} className="btn-primary flex-1 py-3 disabled:opacity-50">
              {busy ? "Logging…" : "Log it"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

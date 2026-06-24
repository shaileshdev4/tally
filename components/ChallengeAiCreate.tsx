"use client";

import { useRef, useState } from "react";
import { HiArrowPath, HiMicrophone, HiSparkles, HiStop } from "react-icons/hi2";
import type { ChallengeDraft } from "@/lib/challenge-draft";

export default function ChallengeAiCreate({
  onDraft,
  disabled,
}: {
  onDraft: (draft: ChallengeDraft, coverUrls: string[]) => void;
  disabled?: boolean;
}) {
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRecognition | null>(null);
  const conversationId = useRef(crypto.randomUUID());

  async function generate(fromText?: string) {
    const text = (fromText ?? prompt).trim();
    if (!text) return setErr("Describe your challenge first.");
    setBusy(true);
    setErr(null);

    const promptMessageId = crypto.randomUUID();
    window.pendo?.trackAgent("prompt", {
      agentId: "ThfKvSebcVKMbGH8pzE8X2N2r9I",
      conversationId: conversationId.current,
      messageId: promptMessageId,
      content: text,
      suggestedPrompt: false,
    });

    try {
      const res = await fetch("/api/challenge/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not parse that.");

      const responseContent = data.draft.follow_up
        ? data.draft.follow_up
        : JSON.stringify(data.draft);
      window.pendo?.trackAgent("agent_response", {
        agentId: "ThfKvSebcVKMbGH8pzE8X2N2r9I",
        conversationId: conversationId.current,
        messageId: crypto.randomUUID(),
        content: responseContent,
        modelUsed: "llama-3.3-70b-versatile",
      });

      if (data.draft.follow_up) {
        setErr(data.draft.follow_up);
        setPrompt(text);
        setBusy(false);
        return;
      }
      onDraft(data.draft, data.cover_urls ?? []);
      setPrompt("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    }
    setBusy(false);
  }

  function toggleVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return setErr("Voice input is not supported in this browser.");
    if (listening && recRef.current) {
      recRef.current.stop();
      setListening(false);
      return;
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.onresult = (ev) => {
      const said = ev.results[0]?.[0]?.transcript ?? "";
      setPrompt(said);
      setListening(false);
      void generate(said);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  }

  return (
    <div className="rounded-2xl border border-accent/30 bg-accent/5 p-5">
      <div className="flex items-center gap-2 section-label">
        <HiSparkles className="h-4 w-4 text-accent" aria-hidden />
        Create with AI
      </div>
      <p className="mt-1 text-sm text-muted">
        One sentence -e.g. &ldquo;100-mile month with my running club&rdquo;
      </p>
      <div className="mt-3 flex gap-2">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !busy && generate()}
          placeholder="Describe your challenge…"
          disabled={busy || disabled}
          className="input-field min-w-0 flex-1"
        />
        <button
          type="button"
          onClick={toggleVoice}
          disabled={busy || disabled}
          title={listening ? "Stop listening" : "Speak your challenge"}
          className={`btn-secondary shrink-0 px-3 ${listening ? "border-accent text-accent" : ""}`}
        >
          {listening ? (
            <HiStop className="h-5 w-5" />
          ) : (
            <HiMicrophone className="h-5 w-5" />
          )}
        </button>
        <button
          type="button"
          onClick={() => generate()}
          disabled={busy || disabled || !prompt.trim()}
          className="btn-primary shrink-0 px-4"
        >
          {busy ? <HiArrowPath className="h-4 w-4 animate-spin" /> : "Go"}
        </button>
      </div>
      {err && <p className="mt-2 font-mono text-sm text-accent">{err}</p>}
    </div>
  );
}

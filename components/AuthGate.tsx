"use client";

import { useEffect, useState } from "react";
import { HiArrowPath } from "react-icons/hi2";
import { FcGoogle } from "react-icons/fc";
import { supabase } from "@/lib/supabase";
import { signInWithEmail, signInWithGoogle } from "@/lib/auth";

export default function AuthGate({
  redirectTo,
  onUser,
  skipInitialSession = false,
}: {
  redirectTo: string;
  onUser: (u: { id: string; email?: string }) => void;
  /** When true, only notify after a fresh sign-in - avoids reload loops on /profile */
  skipInitialSession?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!skipInitialSession) {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) onUser({ id: data.user.id, email: data.user.email });
      });
    }

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (!s?.user) return;
      if (skipInitialSession) {
        if (event === "SIGNED_IN") {
          onUser({ id: s.user.id, email: s.user.email });
        }
        return;
      }
      onUser({ id: s.user.id, email: s.user.email });
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function magic() {
    if (!email.trim()) return;
    setBusy(true);
    await signInWithEmail(email.trim(), redirectTo);
    setSent(true);
    setBusy(false);
  }

  if (sent) {
    return (
      <div className="animate-fade-in rounded-xl border border-line bg-surface2/50 p-4 text-sm text-ink">
        <div className="font-display font-medium">Check your inbox</div>
        <p className="mt-1 text-muted">
          We sent a sign-in link. Open it, then return here to join.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => signInWithGoogle(redirectTo)}
        className="btn-secondary w-full py-3"
      >
        <FcGoogle className="h-5 w-5" aria-hidden />
        Continue with Google
      </button>
      <div className="flex items-center gap-3 text-xs text-muted">
        <div className="h-px flex-1 bg-line" />
        or email
        <div className="h-px flex-1 bg-line" />
      </div>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && magic()}
        placeholder="you@email.com"
        type="email"
        className="input-field w-full"
      />
      <button
        type="button"
        onClick={magic}
        disabled={busy}
        className="btn-primary disabled:opacity-50"
      >
        {busy ? (
          <>
            <HiArrowPath className="h-4 w-4 animate-spin" aria-hidden />
            Sending
          </>
        ) : (
          "Email me a link"
        )}
      </button>
    </div>
  );
}

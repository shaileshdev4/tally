"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGate from "@/components/AuthGate";
import Logo from "@/components/Logo";

export default function ProfileGuest() {
  const router = useRouter();
  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?next=/profile`
      : "/auth/callback?next=/profile";

  return (
    <main className="relative mx-auto max-w-lg px-5 py-16 sm:py-24">
      <div className="relative text-center">
        <Logo
          href="/"
          orientation="stacked"
          size={72}
          wordmarkSize="lg"
          markClassName="shadow-[0_0_32px_-6px_rgba(255,107,53,0.5)]"
        />
        <h1 className="mt-8 font-display text-3xl font-bold text-ink">Your profile</h1>
        <p className="mt-2 text-muted">
          Sign in to track challenges you&apos;ve joined, hosted, and your full activity history.
        </p>
      </div>

      <div className="glass-panel-strong relative mt-8 p-6">
        <AuthGate
          redirectTo={redirectTo}
          skipInitialSession
          onUser={() => router.refresh()}
        />
      </div>

      <div className="mt-6 text-center text-sm text-muted">
        <Link href="/" className="transition hover:text-ink">
          ← Back to home
        </Link>
      </div>
    </main>
  );
}

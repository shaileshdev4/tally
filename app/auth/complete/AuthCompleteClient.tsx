"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HiArrowPath } from "react-icons/hi2";
import Logo from "@/components/Logo";

export default function AuthCompleteClient() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";

  useEffect(() => {
    const t = setTimeout(() => router.replace(next), 600);
    return () => clearTimeout(t);
  }, [next, router]);

  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-5 py-32 text-center">
      <Logo
        orientation="stacked"
        size={56}
        showWordmark
        wordmarkSize="md"
        markClassName="shadow-[0_0_24px_-4px_rgba(255,107,53,0.5)]"
      />
      <div className="mt-6 flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface">
        <HiArrowPath className="h-5 w-5 animate-spin text-accent" aria-hidden />
      </div>
      <h1 className="mt-4 font-display text-2xl font-bold text-ink">
        Signing you in
      </h1>
      <p className="mt-2 text-sm text-muted">
        One moment - redirecting you back to Tally.
      </p>
    </main>
  );
}

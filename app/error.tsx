"use client";

import Link from "next/link";
import Logo from "@/components/Logo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-canvas px-5 text-center text-ink">
        <Logo
          href="/"
          orientation="stacked"
          size={48}
          wordmarkSize="md"
          className="mb-6"
        />
        <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 max-w-md text-sm text-muted">{error.message || "An unexpected error occurred."}</p>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={reset} className="btn-primary">
            Try again
          </button>
          <Link href="/" className="btn-secondary">
            Home
          </Link>
        </div>
      </body>
    </html>
  );
}

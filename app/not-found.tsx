import Link from "next/link";
import { HiArrowLeft, HiPlus } from "react-icons/hi2";
import Logo from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-5 py-24 text-center sm:py-32">
      <Logo
        href="/"
        orientation="stacked"
        size={56}
        wordmarkSize="lg"
        markClassName="shadow-[0_0_24px_-4px_rgba(255,107,53,0.5)]"
      />
      <p className="text-meta mt-3">404</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink">Challenge not found</h1>
      <p className="mt-2 text-muted">That link may be wrong or the challenge was removed.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">
          <HiArrowLeft className="h-4 w-4" aria-hidden />
          Back to Tally
        </Link>
        <Link href="/create" className="btn-secondary">
          <HiPlus className="h-4 w-4" aria-hidden />
          Create your own
        </Link>
      </div>
    </main>
  );
}

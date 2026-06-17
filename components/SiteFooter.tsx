import Link from "next/link";
import Logo from "@/components/Logo";

export default function SiteFooter() {
  return (
    <footer className="relative mt-auto border-t border-line bg-surface/60">
      <div className="page-shell relative flex flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Logo
            href="/"
            size={28}
            wordmarkSize="sm"
            markClassName="shadow-[0_0_16px_-4px_rgba(255,107,53,0.4)]"
          />
          <p className="mt-2 max-w-sm text-sm text-muted">
            Group challenges that don&apos;t live in a spreadsheet.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 font-mono text-xs uppercase tracking-widest text-muted">
          <Link href="/create" className="transition hover:text-accent">
            Create
          </Link>
          <Link href="/profile" className="transition hover:text-accent">
            Profile
          </Link>
          <Link href="/privacy" className="transition hover:text-accent">
            Privacy
          </Link>
          <Link href="/terms" className="transition hover:text-accent">
            Terms
          </Link>
        </div>
      </div>
      <div className="relative border-t border-line px-5 py-4 text-center font-mono text-[11px] text-muted">
        Built for World Product Day · #EveryoneShipsNow
      </div>
    </footer>
  );
}

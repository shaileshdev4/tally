import Link from "next/link";
import Logo from "@/components/Logo";
import ProfileMenu from "@/components/ProfileMenu";

export default function SiteHeader() {
  return (
    <header className="header-glass sticky top-0 z-40">
      <div className="page-shell flex items-center justify-between px-5 py-3">
        <Logo href="/" size={32} wordmarkSize="md" />
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/profile/challenges"
            className="hidden font-mono text-xs uppercase tracking-widest text-muted transition hover:text-ink sm:inline"
          >
            My challenges
          </Link>
          <Link
            href="/categories"
            className="hidden font-mono text-xs uppercase tracking-widest text-muted transition hover:text-ink sm:inline"
          >
            Categories
          </Link>
          <Link href="/create" className="btn-primary px-4 py-2 text-sm">
            Start challenge
          </Link>
          <Link
            href="/profile"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface/80 text-muted transition hover:border-muted hover:text-ink sm:hidden"
            aria-label="Profile"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0115 0" />
            </svg>
          </Link>
          <ProfileMenu />
        </nav>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiClock,
  HiCog6Tooth,
  HiHome,
  HiSquares2X2,
} from "react-icons/hi2";

const LINKS: {
  href: string;
  label: string;
  icon: typeof HiHome;
  exact?: boolean;
}[] = [
  { href: "/profile", label: "Overview", icon: HiHome, exact: true },
  { href: "/profile/challenges", label: "Challenges", icon: HiSquares2X2 },
  { href: "/profile/history", label: "History", icon: HiClock },
  { href: "/profile/settings", label: "Settings", icon: HiCog6Tooth },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function ProfileNav({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      className={
        compact
          ? "flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          : "flex flex-col gap-1"
      }
      aria-label="Profile"
    >
      {LINKS.map(({ href, label, icon: Icon, exact }) => {
        const active = isActive(pathname, href, exact);
        return (
          <Link
            key={href}
            href={href}
            className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition ${
              active
                ? "bg-accent/12 font-medium text-accent shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--accent)_35%,transparent)]"
                : "text-muted hover:bg-surface/50 hover:text-ink"
            } ${compact ? "whitespace-nowrap" : ""}`}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

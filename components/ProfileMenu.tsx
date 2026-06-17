"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  HiArrowRightOnRectangle,
  HiChevronDown,
  HiClock,
  HiCog6Tooth,
  HiHome,
  HiSquares2X2,
} from "react-icons/hi2";
import { supabase } from "@/lib/supabase";
import { getUser, signOut } from "@/lib/auth";
import { getProfile } from "@/lib/profile";
import { defaultDisplayName } from "@/lib/display-name";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import type { Profile } from "@/lib/auth-server";

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getUser().then(async (u) => {
      if (!u) {
        setLoading(false);
        return;
      }
      setEmail(u.email ?? null);
      setUserId(u.id);
      const p = await getProfile(u.id);
      setProfile(p);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
      const u = session?.user;
      if (!u) {
        setEmail(null);
        setUserId(null);
        setProfile(null);
        return;
      }
      setEmail(u.email ?? null);
      setUserId(u.id);
      const p = await getProfile(u.id);
      setProfile(p);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  async function logout() {
    setSigningOut(true);
    await signOut();
    window.location.href = "/";
  }

  if (loading) {
    return <div className="hidden h-9 w-9 sm:block" aria-hidden />;
  }

  if (!email || !userId) {
    return (
      <Link
        href="/profile"
        className="hidden font-mono text-xs uppercase tracking-widest text-muted transition hover:text-ink sm:inline"
      >
        Sign in
      </Link>
    );
  }

  const displayName = defaultDisplayName(profile, { email });

  const links = [
    { href: "/profile", label: "Overview", icon: HiHome },
    { href: "/profile/challenges", label: "Challenges", icon: HiSquares2X2 },
    { href: "/profile/history", label: "History", icon: HiClock },
    { href: "/profile/settings", label: "Settings", icon: HiCog6Tooth },
  ];

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-line bg-surface/50 py-1 pl-1 pr-2.5 transition hover:border-muted hover:bg-surface"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <ProfileAvatar profile={profile} user={{ email }} size={32} />
        <span className="max-w-[100px] truncate font-display text-sm font-medium text-ink">
          {displayName.split(" ")[0]}
        </span>
        <HiChevronDown
          className={`h-3.5 w-3.5 text-muted transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 overflow-hidden rounded-xl border border-line bg-canvas shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)]"
        >
          <div className="border-b border-line px-4 py-3">
            <div className="truncate font-display text-sm font-semibold text-ink">
              {displayName}
            </div>
            <div className="truncate text-xs text-muted">{email}</div>
          </div>
          <div className="p-1.5">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-surface/80 hover:text-ink"
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </Link>
            ))}
          </div>
          <div className="border-t border-line p-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={logout}
              disabled={signingOut}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-surface/80 hover:text-ink disabled:opacity-50"
            >
              <HiArrowRightOnRectangle className="h-4 w-4" aria-hidden />
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function MeSignOutButton() {
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await signOut();
    window.location.href = "/";
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={busy}
      className="btn-secondary text-sm disabled:opacity-50"
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}

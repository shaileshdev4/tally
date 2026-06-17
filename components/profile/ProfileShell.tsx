import type { ReactNode } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/auth-server";
import { defaultDisplayName } from "@/lib/display-name";
import type { ProfileStats } from "@/lib/profile-data";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import ProfileNav from "@/components/profile/ProfileNav";

export default function ProfileShell({
  user,
  profile,
  stats,
  children,
}: {
  user: User;
  profile: Profile | null;
  stats?: ProfileStats;
  children: ReactNode;
}) {
  const displayName = defaultDisplayName(profile, user);

  return (
    <main className="page-shell relative px-5 py-8 sm:py-12">
      <div className="relative lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10">
        {/* Identity rail */}
        <aside className="mb-8 lg:sticky lg:top-24 lg:mb-0 lg:self-start">
          <div className="identity-rail">
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="ring-2 ring-accent/30 ring-offset-2 ring-offset-canvas rounded-full">
                  <ProfileAvatar profile={profile} user={user} size={56} />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-title text-lg">{displayName}</div>
                  <div className="truncate text-meta">{user.email}</div>
                </div>
              </div>

              {stats && (
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {[
                    { label: "Joined", value: stats.joinedCount },
                    { label: "Hosted", value: stats.hostedCount },
                    { label: "Logs", value: stats.logCount },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-xl border border-line bg-surface2 px-2 py-2.5 text-center"
                    >
                      <div className="font-display text-lg font-bold text-ink">{s.value}</div>
                      <div className="text-[9px] font-mono uppercase tracking-widest text-muted">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5 hidden lg:block">
                <ProfileNav />
              </div>
            </div>
          </div>

          <Link href="/create" className="btn-primary mt-4 hidden w-full text-sm lg:inline-flex">
            New challenge
          </Link>
        </aside>

        <div className="min-w-0">
          <div className="mb-6 lg:hidden">
            <ProfileNav compact />
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}

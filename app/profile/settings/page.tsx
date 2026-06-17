import Link from "next/link";
import { HiCheckCircle } from "react-icons/hi2";
import { getServerUser, getServerProfile } from "@/lib/auth-server";
import { defaultDisplayName } from "@/lib/display-name";
import { fetchStravaConnected } from "@/lib/profile-data";
import ProfileSettingsForm from "@/components/profile/ProfileSettingsForm";
import { MeSignOutButton } from "@/components/ProfileMenu";

export default async function ProfileSettingsPage({
  searchParams,
}: {
  searchParams: { strava?: string };
}) {
  const user = await getServerUser();
  if (!user) return null;

  const profile = await getServerProfile(user.id);
  const displayName = defaultDisplayName(profile, user);
  const stravaConnected = await fetchStravaConnected(user.id);
  const stravaNotice = searchParams.strava;

  return (
    <div className="animate-fade-in">
      <div>
        <h1 className="text-title text-2xl sm:text-3xl">Settings</h1>
        <p className="text-meta mt-1 normal-case tracking-normal">
          Manage your profile, connections, and account.
        </p>
      </div>

      {stravaNotice === "unconfigured" && (
        <div className="glass-panel mt-6 px-4 py-3 text-sm text-muted">
          Strava isn&apos;t configured on this deployment. Add{" "}
          <code className="text-ink">STRAVA_CLIENT_ID</code> and{" "}
          <code className="text-ink">STRAVA_CLIENT_SECRET</code> to enable it.
        </div>
      )}

      <div className="mt-8">
        <ProfileSettingsForm
          userId={user.id}
          initialName={displayName}
          email={user.email ?? profile?.email ?? null}
          memberSince={profile?.created_at ?? user.created_at}
        />
      </div>

      <section className="settings-module mt-6">
        <div className="relative flex items-center gap-2">
          <span className="h-8 w-1 rounded-full bg-sky-500" aria-hidden />
          <div>
            <h2 className="text-title text-lg">Integrations</h2>
            <p className="text-meta mt-0.5">
              Connect apps to sync fitness activity into challenges.
            </p>
          </div>
        </div>

        <div className="glass-panel relative mt-5 flex flex-wrap items-center justify-between gap-4 p-4">
          <div>
            <div className="text-title">Strava</div>
            <div className="text-meta mt-0.5 normal-case">
              Auto-sync runs and rides into fitness challenges.
            </div>
          </div>
          {stravaConnected ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line/60 bg-canvas/50 px-3 py-1.5 font-mono text-xs text-muted">
              <HiCheckCircle className="h-4 w-4 text-accent" aria-hidden />
              Connected
            </span>
          ) : (
            <Link
              href="/api/strava/connect?next=/profile/settings"
              className="btn-secondary text-sm"
            >
              Connect Strava
            </Link>
          )}
        </div>
      </section>

      <section className="settings-module mt-6">
        <div className="relative flex items-center gap-2">
          <span className="h-8 w-1 rounded-full bg-accent/80" aria-hidden />
          <div>
            <h2 className="text-title text-lg">Account</h2>
            <p className="text-meta mt-0.5">Sign out of Tally on this device.</p>
          </div>
        </div>
        <div className="relative mt-4">
          <MeSignOutButton />
        </div>
      </section>
    </div>
  );
}

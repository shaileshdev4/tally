import { getServerUser, getServerProfile } from "@/lib/auth-server";
import { fetchProfileStats } from "@/lib/profile-data";
import ProfileShell from "@/components/profile/ProfileShell";
import ProfileGuest from "@/components/profile/ProfileGuest";

export const dynamic = "force-dynamic";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerUser();

  if (!user) {
    return <ProfileGuest />;
  }

  const [profile, stats] = await Promise.all([
    getServerProfile(user.id),
    fetchProfileStats(user.id),
  ]);

  return (
    <ProfileShell user={user} profile={profile} stats={stats}>
      {children}
    </ProfileShell>
  );
}

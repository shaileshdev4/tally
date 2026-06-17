import { profileInitials } from "@/lib/display-name";
import type { Profile } from "@/lib/auth-server";
import { defaultDisplayName } from "@/lib/display-name";

export default function ProfileAvatar({
  profile,
  user,
  size = 40,
  className = "",
}: {
  profile: Profile | null;
  user?: { email?: string | null; user_metadata?: Record<string, unknown> } | null;
  size?: number;
  className?: string;
}) {
  const displayName = defaultDisplayName(profile, user);
  const avatarUrl = profile?.avatar_url?.trim();

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        width={size}
        height={size}
        className={`shrink-0 rounded-full object-cover ring-2 ring-line ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  const initials = profileInitials(profile, user);
  const seed = encodeURIComponent(displayName || "user");
  const fallback = `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&backgroundColor=1c2027&shape1Color=ff6b35&shape2Color=3b82f6&shape3Color=2dd4bf`;

  return (
    <img
      src={fallback}
      alt=""
      width={size}
      height={size}
      className={`shrink-0 rounded-full object-cover ring-2 ring-line ${className}`}
      style={{ width: size, height: size }}
      title={initials}
    />
  );
}

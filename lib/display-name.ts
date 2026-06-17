import type { Profile } from "@/lib/auth-server";

export function defaultDisplayName(
  profile: Profile | null,
  user?: { email?: string | null; user_metadata?: Record<string, unknown> } | null
): string {
  if (profile?.display_name?.trim()) return profile.display_name.trim();
  const meta = user?.user_metadata;
  const fromMeta =
    (typeof meta?.full_name === "string" && meta.full_name) ||
    (typeof meta?.name === "string" && meta.name) ||
    "";
  if (fromMeta.trim()) return fromMeta.trim();
  const email = profile?.email ?? user?.email;
  if (email) return email.split("@")[0];
  return "You";
}

export function profileInitials(
  profile: Profile | null,
  user?: { email?: string | null; user_metadata?: Record<string, unknown> } | null
): string {
  const name = defaultDisplayName(profile, user);
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

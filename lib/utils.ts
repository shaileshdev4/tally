export function slugify(name: string): string {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 32) || "challenge";
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

export function daysLeft(ends_at: string | null): number | null {
  if (!ends_at) return null;
  const ms = new Date(ends_at).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
}

export function fmt(n: number): string {
  return Number.isInteger(n)
    ? n.toLocaleString()
    : n.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

export function formatEndDate(daysFromNow: number): string {
  const d = new Date(Date.now() + daysFromNow * 86400000);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function timeAgo(iso: string): string {
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function friendlyDbError(msg: string): string {
  if (/duplicate key|unique constraint/i.test(msg)) {
    return "That name is taken -try a slightly different challenge name.";
  }
  if (/row-level security|violates.*policy/i.test(msg)) {
    return "Sign in to continue - creating and joining challenges requires an account.";
  }
  if (/schema cache|could not find.*column|relation.*profiles/i.test(msg)) {
    return "Database needs an update - run supabase/migrations/003_ship.sql and 004_auth_production.sql in the Supabase SQL editor, then try again.";
  }
  return msg;
}

// localStorage key for "who am I in this challenge"
export function memberKey(challengeId: string) {
  return `tally:member:${challengeId}`;
}

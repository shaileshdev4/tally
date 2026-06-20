"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HiArrowPath, HiArrowRight, HiUsers } from "react-icons/hi2";
import { supabase, type Challenge } from "@/lib/supabase";
import { track } from "@/lib/analytics";
import AuthGate from "@/components/AuthGate";
import Cover from "@/components/Cover";
import CategoryTheme from "@/components/CategoryTheme";
import Logo from "@/components/Logo";
import { getUser } from "@/lib/auth";
import { getProfile } from "@/lib/profile";
import { isCategory } from "@/lib/categories";

export default function JoinForm({
  challenge,
  memberCount,
}: {
  challenge: Challenge;
  memberCount: number;
}) {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const redirect =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?next=/c/${challenge.slug}/join`
      : "/";

  useEffect(() => {
    if (!user) {
      setChecking(false);
      return;
    }
    (async () => {
      const { data: existing } = await supabase
        .from("members")
        .select("id, display_name")
        .eq("challenge_id", challenge.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        router.replace(`/c/${challenge.slug}`);
        return;
      }

      const profile = await getProfile(user.id);
      const fullUser = await getUser();
      const suggested =
        profile?.display_name?.trim() ||
        (fullUser?.user_metadata?.full_name as string | undefined)?.trim() ||
        fullUser?.email?.split("@")[0] ||
        "";
      if (suggested && !name) setName(suggested);
      setChecking(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, challenge.id, challenge.slug]);

  async function join() {
    const clean = name.trim();
    if (!clean) return setErr("Pick a display name.");
    if (!user) return setErr("Sign in first.");
    setBusy(true);
    setErr(null);

    const { data: existing } = await supabase
      .from("members")
      .select("id")
      .eq("challenge_id", challenge.id)
      .eq("user_id", user.id)
      .maybeSingle();

    let memberId = existing?.id;
    if (!memberId) {
      const { data, error } = await supabase
        .from("members")
        .insert({
          challenge_id: challenge.id,
          display_name: clean,
          user_id: user.id,
          avatar_seed: clean,
        })
        .select("id")
        .single();
      if (error || !data) {
        setErr(error?.message ?? "Error");
        setBusy(false);
        return;
      }
      memberId = data.id;
    }

    router.push(`/c/${challenge.slug}`);
    track("member_joined", { slug: challenge.slug });
    window.pendo?.track("member_joined", {
      slug: challenge.slug,
      category: challenge.category,
      member_count: memberCount + 1,
    });
  }

  return (
    <CategoryTheme
      category={isCategory(challenge.category) ? challenge.category : "custom"}
    >
      <main className="mx-auto max-w-md px-5 py-10 sm:py-16">
        <div className="mb-6 flex justify-center">
          <Logo href="/" size={28} wordmarkSize="sm" />
        </div>
        <div className="overflow-hidden rounded-2xl border border-line bg-surface/50 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
          <div className="relative h-28 w-full">
            <Cover
              type={challenge.cover_type}
              value={challenge.cover_value}
              seed={challenge.slug}
              className="h-full w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
          </div>
          <div className="p-6 sm:p-8">
            <div className="section-label">Joining</div>
            <h1 className="mt-1 font-display text-2xl font-bold text-ink sm:text-3xl">
              {challenge.name}
            </h1>
            <p className="mt-2 text-sm text-muted">
              Counting {challenge.unit}. Sign in once -your progress follows you
              across devices.
            </p>

            {memberCount > 0 && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface2/50 px-3 py-1 font-mono text-xs text-muted">
                <HiUsers className="h-3.5 w-3.5" aria-hidden />
                {memberCount} {memberCount === 1 ? "person" : "people"} on the
                board
              </div>
            )}

            <div className="mt-6 flex flex-col gap-4">
              {!user ? (
                <AuthGate redirectTo={redirect} onUser={(u) => setUser(u)} />
              ) : checking ? (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted">
                  <HiArrowPath className="h-4 w-4 animate-spin" aria-hidden />
                  Checking your spot…
                </div>
              ) : (
                <>
                  <div className="rounded-lg border border-line bg-surface2/40 px-3 py-2 text-sm text-muted">
                    Signed in as{" "}
                    <span className="font-medium text-ink">
                      {user.email ?? "your account"}
                    </span>
                  </div>
                  <label className="block">
                    <span className="section-label">Display name</span>
                    <input
                      autoFocus
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && join()}
                      placeholder="What should we call you?"
                      className="input-field mt-2 w-full"
                    />
                  </label>
                  {err && (
                    <p
                      className="font-mono text-sm"
                      style={{ color: "var(--accent)" }}
                    >
                      {err}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={join}
                    disabled={busy}
                    className="btn-primary disabled:opacity-50"
                  >
                    {busy ? (
                      <>
                        <HiArrowPath
                          className="h-4 w-4 animate-spin"
                          aria-hidden
                        />
                        Joining
                      </>
                    ) : (
                      <>
                        Join challenge
                        <HiArrowRight className="h-4 w-4" aria-hidden />
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </CategoryTheme>
  );
}

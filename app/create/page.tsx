"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { useRouter, useSearchParams } from "next/navigation";
import {
  HiArrowLeft,
  HiArrowPath,
  HiArrowRight,
  HiSquares2X2,
} from "react-icons/hi2";
import { supabase } from "@/lib/supabase";
import { slugify, formatEndDate, friendlyDbError } from "@/lib/utils";
import {
  TEMPLATES,
  templateById,
  templateCover,
  defaultTemplateFor,
} from "@/lib/templates";
import {
  CATEGORY_ACCENT,
  categoryMeta,
  categoryCover,
  isCategory,
  type Category,
} from "@/lib/categories";
import { DURATION_PRESETS, unitsForCategory } from "@/lib/units";
import CategoryTheme from "@/components/CategoryTheme";
import CoverPicker, { type CoverValue } from "@/components/CoverPicker";
import Cover from "@/components/Cover";
import StepIndicator from "@/components/StepIndicator";
import Select from "@/components/ui/Select";
import ChallengeAiCreate from "@/components/ChallengeAiCreate";
import type { ChallengeDraft } from "@/lib/challenge-draft";
import AuthGate from "@/components/AuthGate";
import { getProfile } from "@/lib/profile";
import type { User } from "@supabase/supabase-js";
import PageHero from "@/components/PageHero";
import { PAGE_HERO_IMAGES } from "@/lib/hero-images";

function CreatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<1 | 2>(1);
  const [cat, setCat] = useState<Category>("reading");
  const [tplId, setTplId] = useState<string>(TEMPLATES[0].id);
  const [name, setName] = useState(TEMPLATES[0].defaultName);
  const [unit, setUnit] = useState(TEMPLATES[0].unit);
  const [customUnit, setCustomUnit] = useState("");
  const [goal, setGoal] = useState<number | "">(TEMPLATES[0].defaultGoal ?? "");
  const [days, setDays] = useState(TEMPLATES[0].defaultDays);
  const [cadence, setCadence] = useState<"total" | "daily">(
    TEMPLATES[0].cadence,
  );
  const [cover, setCover] = useState<CoverValue>({
    type: "gradient",
    value: TEMPLATES[0].gradient,
  });
  const [suggestedCovers, setSuggestedCovers] = useState<string[]>([]);
  const [coversLoading, setCoversLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const skipCoverFetch = useRef(false);

  const authRedirect =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?next=/create`
      : "/auth/callback?next=/create";

  const catMeta = categoryMeta(cat);
  const catTemplates = useMemo(
    () => TEMPLATES.filter((t) => t.category === cat),
    [cat],
  );
  const unitOptions = useMemo(() => unitsForCategory(cat), [cat]);
  const showCustomUnitInput = cat === "custom" && unit === "custom";
  const resolvedUnit = showCustomUnitInput ? customUnit.trim() : unit;

  const loadCoverSuggestions = async (opts?: { keywords?: string; keepSelection?: boolean }) => {
    setCoversLoading(true);
    try {
      const res = await fetch("/api/challenge/covers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: cat,
          name: name.trim(),
          keywords: opts?.keywords,
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      const urls: string[] = data.urls ?? [];
      if (!urls.length) return;
      setSuggestedCovers(urls);
      if (opts?.keepSelection) {
        setCover((prev) => {
          if (prev.type === "custom") return prev;
          if (prev.type === "url" && urls.includes(prev.value)) return prev;
          return { type: "url", value: urls[0] };
        });
      } else {
        setCover({ type: "url", value: urls[0] });
      }
    } finally {
      setCoversLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (step !== 2) return;
    if (skipCoverFetch.current) {
      skipCoverFetch.current = false;
      return;
    }
    const timer = setTimeout(() => {
      loadCoverSuggestions({ keepSelection: true });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, cat, name, tplId]);

  useEffect(() => {
    if (hydrated) return;
    const qCat = searchParams.get("category");
    const qTpl = searchParams.get("template");
    if (qCat && isCategory(qCat)) {
      chooseCat(qCat);
      if (qTpl && templateById(qTpl)) applyTemplate(qTpl);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function chooseCat(c: Category) {
    setCat(c);
    const first = defaultTemplateFor(c);
    if (first) applyTemplate(first.id);
    else {
      const meta = categoryMeta(c);
      const units = unitsForCategory(c);
      setTplId("");
      setName("");
      setUnit(units[0]?.value ?? "points");
      setCustomUnit("");
      setGoal("");
      setCadence("total");
      setDays(30);
      setCover(categoryCover(c));
    }
  }

  function applyTemplate(id: string) {
    const t = templateById(id);
    if (!t) return;
    setCat(t.category);
    setTplId(id);
    setName(t.defaultName);
    setUnit(t.unit);
    setCustomUnit("");
    setGoal(t.defaultGoal ?? "");
    setDays(t.defaultDays);
    setCadence(t.cadence);
    const tc = templateCover(t);
    setCover({ type: tc.type, value: tc.value });
  }

  function applyDraft(draft: ChallengeDraft, coverUrls: string[]) {
    setCat(draft.category);
    setTplId(draft.template_id ?? "");
    setName(draft.name);
    setUnit(draft.unit);
    setCustomUnit("");
    setGoal(draft.goal ?? "");
    setDays(draft.days);
    setCadence(draft.cadence);
    setSuggestedCovers(coverUrls);
    if (coverUrls[0]) {
      setCover({ type: "url", value: coverUrls[0] });
    } else if (draft.preset_cover) {
      setCover({ type: "preset", value: draft.preset_cover });
    } else {
      setCover({ type: "gradient", value: draft.gradient });
    }
    setCoversLoading(false);
    skipCoverFetch.current = true;
    setStep(2);
  }

  async function create() {
    setErr(null);
    const clean = name.trim();
    if (!clean) return setErr("Name your challenge.");
    if (!resolvedUnit) return setErr("Pick a unit.");

    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    if (!currentUser) return setErr("Sign in to create a challenge.");

    setBusy(true);
    const slug = slugify(clean);
    const ends_at = new Date(Date.now() + days * 86400000).toISOString();

    const { data: ch, error } = await supabase
      .from("challenges")
      .insert({
        slug,
        name: clean,
        unit: resolvedUnit,
        goal: goal === "" ? null : Number(goal),
        ends_at,
        is_demo: false,
        category: cat,
        template_id: tplId || null,
        cover_type: cover.type,
        cover_value: cover.value,
        cadence,
        created_by: currentUser.id,
      })
      .select("id")
      .single();

    if (error || !ch) {
      setErr(friendlyDbError(error?.message ?? "Could not create challenge."));
      setBusy(false);
      return;
    }

    const profile = await getProfile(currentUser.id);
    const hostName =
      profile?.display_name?.trim() ||
      (currentUser.user_metadata?.full_name as string | undefined)?.trim() ||
      currentUser.email?.split("@")[0] ||
      "Host";

    const { error: memberErr } = await supabase.from("members").insert({
      challenge_id: ch.id,
      display_name: hostName,
      user_id: currentUser.id,
      avatar_seed: hostName,
    });

    if (memberErr) {
      setErr(friendlyDbError(memberErr.message));
      setBusy(false);
      return;
    }

    const { track } = await import("@/lib/analytics");
    track("challenge_created", { slug, category: cat });
    window.pendo?.track("challenge_created", {
      slug,
      category: cat,
      unit: resolvedUnit,
      cadence,
      goal: goal === "" ? null : Number(goal),
      days,
      cover_type: cover.type,
      template_id: tplId || null,
    });
    router.push(`/c/${slug}/created`);
  }

  return (
    <CategoryTheme category={cat}>
      <main className="relative mx-auto max-w-2xl px-5 py-8 sm:py-12">
        <PageHero
          imageSrc={PAGE_HERO_IMAGES.create}
          size="compact"
          label={step === 1 ? "New challenge" : "Almost there"}
          title={step === 1 ? "What are you tracking?" : "Make it yours"}
          subtitle={
            step === 1
              ? "Pick a template, browse categories, or describe it with AI."
              : "Name it, set your goal, and choose a cover."
          }
        />

        <ChallengeAiCreate onDraft={applyDraft} disabled={busy} />

        <div className="my-8 flex items-center gap-3">
          <div className="h-px flex-1 bg-line" />
          <span className="font-mono text-xs uppercase tracking-widest text-muted">
            or pick manually
          </span>
          <div className="h-px flex-1 bg-line" />
        </div>

        <StepIndicator step={step} />

        {step === 1 && (
          <div className="animate-fade-in">
            <div
              className="glass-panel mt-6 flex items-center justify-between gap-4 p-4"
              style={{
                borderColor: CATEGORY_ACCENT[cat].accent,
                background: `linear-gradient(135deg, ${CATEGORY_ACCENT[cat].soft}, transparent)`,
              }}
            >
              <div>
                <div
                  className="font-display text-xl font-semibold"
                  style={{ color: CATEGORY_ACCENT[cat].accent }}
                >
                  {catMeta.label}
                </div>
                <div className="mt-1 text-sm text-muted">{catMeta.blurb}</div>
              </div>
              <Link
                href="/categories"
                className="btn-secondary shrink-0 px-3 py-2 text-xs"
              >
                <HiSquares2X2 className="h-4 w-4" aria-hidden />
                Browse all
              </Link>
            </div>

            {catTemplates.length > 0 ? (
              <>
                <div className="mt-8 section-label">Start from a template</div>
                <div className="mt-3 flex flex-col gap-2">
                  {catTemplates.map((t) => {
                    const tc = templateCover(t);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => applyTemplate(t.id)}
                        className={`card-featured flex items-center gap-4 p-3 text-left ${
                          tplId === t.id ? "ring-2 ring-accent" : ""
                        }`}
                      >
                        <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg">
                          <Cover
                            type={tc.type}
                            value={tc.value}
                            seed={t.id}
                            gradientFallback={t.gradient}
                            className="h-full w-full"
                          />
                        </div>
                        <div>
                          <div className="font-display font-medium text-ink">
                            {t.label} · {t.tagline}
                          </div>
                          <div className="font-mono text-xs text-muted">
                            {t.unit} ·{" "}
                            {t.cadence === "daily"
                              ? "streak goal"
                              : "total goal"}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="mt-8 rounded-xl border border-dashed border-line p-6 text-center text-muted">
                <p>
                  No preset templates for {catMeta.label} -you&apos;ll set your
                  own unit and goal next.
                </p>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-secondary mt-4 text-sm"
                >
                  Skip to personalize
                </button>
              </div>
            )}

            {catTemplates.length > 0 && (
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-primary mt-8"
              >
                Personalize
                <HiArrowRight className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-muted transition hover:text-ink"
            >
              <HiArrowLeft className="h-3.5 w-3.5" aria-hidden />
              Back to templates
            </button>

            <div className="relative mt-4 h-36 overflow-hidden rounded-2xl border border-line">
              <Cover
                type={cover.type}
                value={cover.value}
                seed={name || "preview"}
                className="h-full w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-canvas/90 via-canvas/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="font-display text-xl font-bold text-ink">
                  {name || "Your challenge"}
                </div>
                <div className="font-mono text-xs text-muted">
                  {resolvedUnit || "unit"} · {days} days · ends{" "}
                  {formatEndDate(days)} ·{" "}
                  {cadence === "daily" ? "streak" : "total"}
                </div>
              </div>
            </div>

            <h1 className="text-title mt-2 text-2xl sm:text-3xl">
              Personalize
            </h1>

            {!user ? (
              <div className="mt-6 rounded-2xl border border-line bg-surface/40 p-6">
                <p className="mb-4 text-sm text-muted">
                  Sign in to publish your challenge. You&apos;ll be added to the board automatically as host.
                </p>
                <AuthGate
                  redirectTo={authRedirect}
                  onUser={() => {
                    supabase.auth.getUser().then(({ data }) => setUser(data.user));
                  }}
                />
              </div>
            ) : (
            <div className="mt-6 flex flex-col gap-6">
              <label className="block">
                <span className="section-label">Name</span>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Team 100-mile month"
                  className="input-field mt-2 w-full"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Select
                    label="Unit"
                    value={
                      unitOptions.some((o) => o.value === unit)
                        ? unit
                        : unitOptions[0].value
                    }
                    onChange={(v) => setUnit(v)}
                    options={unitOptions}
                  />
                  {showCustomUnitInput && (
                    <input
                      value={customUnit}
                      onChange={(e) => setCustomUnit(e.target.value)}
                      placeholder="e.g. pushups"
                      className="input-field mt-2 w-full"
                    />
                  )}
                </div>
                <label className="block">
                  <span className="section-label">
                    {cadence === "daily"
                      ? "Streak target (optional)"
                      : "Goal (optional)"}
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={goal}
                    onChange={(e) =>
                      setGoal(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    placeholder={
                      cadence === "daily" ? "e.g. 30 days" : "e.g. 100"
                    }
                    className="input-field mt-2 w-full"
                  />
                </label>
              </div>

              <div>
                <span className="section-label">Goal type</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(["total", "daily"] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCadence(c)}
                      className={`chip ${cadence === c ? "chip-active" : ""}`}
                    >
                      {c === "total" ? "Total -sum it up" : "Daily -streak"}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-sm text-muted">
                  {cadence === "total"
                    ? "Everyone logs amounts; leaderboard ranks by total."
                    : "Log once per day; leaderboard ranks by streak length."}
                </p>
              </div>

              <div>
                <span className="section-label">
                  Duration -{days} days · ends {formatEndDate(days)}
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {DURATION_PRESETS.map((p) => (
                    <button
                      key={p.days}
                      type="button"
                      onClick={() => setDays(p.days)}
                      className={`chip ${days === p.days ? "chip-active" : ""}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min={7}
                  max={365}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="mt-4 w-full"
                  aria-valuetext={`${days} days, ends ${formatEndDate(days)}`}
                />
              </div>

              <div>
                <span className="section-label">Cover</span>
                <CoverPicker
                  value={cover}
                  onChange={setCover}
                  suggestedUrls={suggestedCovers}
                  loading={coversLoading}
                />
              </div>

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
                onClick={create}
                disabled={busy}
                className="btn-primary disabled:opacity-50"
              >
                {busy ? (
                  <>
                    <HiArrowPath className="h-4 w-4 animate-spin" aria-hidden />
                    Creating
                  </>
                ) : (
                  <>
                    Create & get share link
                    <HiArrowRight className="h-4 w-4" aria-hidden />
                  </>
                )}
              </button>
            </div>
            )}
          </div>
        )}
      </main>
    </CategoryTheme>
  );
}

export default function CreatePage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex max-w-2xl flex-col items-center px-5 py-16 text-center">
          <Logo orientation="stacked" size={48} wordmarkSize="md" />
          <p className="text-meta mt-4">Loading…</p>
        </main>
      }
    >
      <CreatePageContent />
    </Suspense>
  );
}

import Link from "next/link";
import {
  HiArrowDown,
  HiArrowRight,
  HiSignal,
  HiSparkles,
} from "react-icons/hi2";
import { getDemo, getBoard } from "@/lib/data";
import Leaderboard from "@/components/Leaderboard";
import Cover from "@/components/Cover";
import PageHero from "@/components/PageHero";
import CategoryTheme from "@/components/CategoryTheme";
import { daysLeft, fmt } from "@/lib/utils";
import { TEMPLATES, CATEGORY_ACCENT } from "@/lib/templates";
import { FEATURED_CATEGORIES } from "@/lib/categories";
import { PAGE_HERO_IMAGES } from "@/lib/hero-images";

export const dynamic = "force-dynamic";

const FEATURED_TEMPLATES: Record<string, string> = {
  reading: "reading_pages_month",
  fitness: "fitness_miles_month",
  habits: "habits_30_day",
};

const HOW: [string, string][] = [
  ["Pick a template", "Reading, fitness, habits - or browse 12 categories."],
  ["Share one link", "Sign in once. Friends join by URL and pick a name."],
  [
    "Watch it climb",
    "A live leaderboard, streaks, badges, and a weekly recap.",
  ],
];

export default async function Home() {
  const demo = await getDemo();
  const rows = demo ? await getBoard(demo.id) : [];

  return (
    <main className="page-shell relative px-5 py-8 sm:py-12">
      <div
        className="bg-mesh pointer-events-none absolute inset-x-0 top-0 h-96 opacity-60"
        aria-hidden
      />

      <PageHero
        imageSrc={PAGE_HERO_IMAGES.home}
        label="Group challenges, reimagined"
        title={
          <>
            The group challenge,
            <br />
            <span className="text-accent">minus the spreadsheet.</span>
          </>
        }
        subtitle="Read 12 books. Run 100 miles. Meditate 30 days. Spin up any challenge, share one link, and everyone watches a live leaderboard climb."
        actions={
          <>
            <Link href="/create" className="btn-primary">
              Start a challenge
            </Link>
            <a href="#demo" className="btn-on-dark">
              See a live one
              <HiArrowDown className="h-4 w-4" aria-hidden />
            </a>
          </>
        }
      />

      <section className="animate-slide-up stagger-1 mb-16">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="section-label">Popular templates</div>
          <Link
            href="/categories"
            className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-muted transition hover:text-accent"
          >
            Explore all 12
            <HiArrowRight className="h-3 w-3" aria-hidden />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURED_CATEGORIES.map((meta) => {
            const template = FEATURED_TEMPLATES[meta.id];
            const t = TEMPLATES.find((x) => x.id === template)!;
            const a = CATEGORY_ACCENT[meta.id];
            return (
              <CategoryTheme key={meta.id} category={meta.id}>
                <Link
                  href={`/create?category=${meta.id}&template=${template}`}
                  className="card-featured group block"
                >
                  <div className="relative h-36 w-full overflow-hidden">
                    <Cover
                      type="preset"
                      value={t.presetCover}
                      seed={meta.id}
                      gradientFallback={t.gradient}
                      className="h-full w-full transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-canvas/95 via-canvas/20 to-transparent" />
                  </div>
                  <div className="relative p-4">
                    <div
                      className="text-title text-lg"
                      style={{ color: a.accent }}
                    >
                      {t.label}
                    </div>
                    <div className="text-meta mt-1 normal-case tracking-normal">
                      {t.tagline}
                    </div>
                  </div>
                </Link>
              </CategoryTheme>
            );
          })}
        </div>
        <Link
          href="/create"
          className="mt-4 inline-flex items-center gap-2 text-sm text-muted transition hover:text-accent"
        >
          <HiSparkles className="h-4 w-4" aria-hidden />
          Or describe your challenge in one line with AI
        </Link>
      </section>

      <section className="animate-slide-up stagger-2 mb-16">
        <div className="grid gap-4 sm:grid-cols-3">
          {HOW.map(([title, body], i) => (
            <div key={i} className="glass-panel p-5">
              <div className="font-mono text-2xl font-bold text-accent">
                0{i + 1}
              </div>
              <div className="text-title mt-2 text-lg">{title}</div>
              <div className="mt-1 text-sm leading-relaxed text-muted">
                {body}
              </div>
            </div>
          ))}
        </div>
      </section>

      {demo ? (
        <section
          id="demo"
          className="animate-slide-up stagger-3 scroll-mt-24 card-featured overflow-hidden"
        >
          <div className="relative h-28 w-full sm:h-32">
            <Cover
              type={demo.cover_type}
              value={demo.cover_value}
              seed={demo.slug}
              className="h-full w-full scale-105 object-cover"
            />
            <div className="hero-scrim absolute inset-0" />
          </div>
          <div className="relative p-5 sm:p-7">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div
                  className="section-label flex items-center gap-1.5"
                  style={{ color: CATEGORY_ACCENT.reading.accent }}
                >
                  <HiSignal className="h-3.5 w-3.5 animate-pulse" aria-hidden />
                  Live right now
                </div>
                <h2 className="text-title mt-1 text-2xl">{demo.name}</h2>
                {rows.length > 0 && (
                  <p className="text-meta mt-1">
                    {fmt(rows.length)} {rows.length === 1 ? "person" : "people"}{" "}
                    tracking
                  </p>
                )}
              </div>
              {demo.ends_at && (
                <div className="glass-panel rounded-full px-3 py-1 font-mono text-sm text-muted">
                  {daysLeft(demo.ends_at)} days left
                </div>
              )}
            </div>
            <Leaderboard challenge={demo} initialRows={rows} />
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/c/${demo.slug}/join`}
                className="btn-primary px-4 py-2.5 text-sm"
              >
                Join this challenge
              </Link>
              <Link
                href={`/c/${demo.slug}`}
                className="btn-secondary px-4 py-2.5 text-sm"
              >
                Open full board
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section
          id="demo"
          className="scroll-mt-24 glass-panel border-dashed p-8 text-center text-muted"
        >
          No demo challenge seeded yet. Run{" "}
          <code className="font-mono text-ink">npm run seed</code>, or{" "}
          <Link href="/create" className="text-accent underline">
            create the first one
          </Link>
          .
        </section>
      )}
    </main>
  );
}

import { PRESET_COVERS } from "@/lib/covers";

export type Category =
  | "reading"
  | "fitness"
  | "habits"
  | "learning"
  | "wellness"
  | "creative"
  | "work"
  | "finance"
  | "social"
  | "food"
  | "gaming"
  | "custom";

export type CategoryMeta = {
  id: Category;
  label: string;
  blurb: string;
  gradient: string;
  presetCover: string;
  featured: boolean;
  defaultImageKeywords: string;
  accent: string;
  soft: string;
  ring: string;
};

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "reading",
    label: "Reading",
    blurb: "Books, pages, chapters",
    gradient: "ember",
    presetCover: "books",
    featured: true,
    defaultImageKeywords: "books library reading",
    accent: "#C2410C",
    soft: "rgba(194,65,12,0.10)",
    ring: "rgba(194,65,12,0.45)",
  },
  {
    id: "fitness",
    label: "Fitness",
    blurb: "Running, gym, training",
    gradient: "sky",
    presetCover: "run",
    featured: true,
    defaultImageKeywords: "fitness workout running",
    accent: "#2563EB",
    soft: "rgba(37,99,235,0.10)",
    ring: "rgba(37,99,235,0.45)",
  },
  {
    id: "habits",
    label: "Habits",
    blurb: "Daily streaks, meditate, practice",
    gradient: "teal",
    presetCover: "calm",
    featured: true,
    defaultImageKeywords: "meditation morning calm",
    accent: "#0D9488",
    soft: "rgba(13,148,136,0.10)",
    ring: "rgba(13,148,136,0.45)",
  },
  {
    id: "learning",
    label: "Learning",
    blurb: "Study, courses, DSA, skills",
    gradient: "violet",
    presetCover: "study",
    featured: false,
    defaultImageKeywords: "laptop study coding",
    accent: "#7C3AED",
    soft: "rgba(124,58,237,0.10)",
    ring: "rgba(124,58,237,0.45)",
  },
  {
    id: "wellness",
    label: "Wellness",
    blurb: "Steps, sleep, hydration",
    gradient: "forest",
    presetCover: "wellness",
    featured: false,
    defaultImageKeywords: "nature wellness health",
    accent: "#16A34A",
    soft: "rgba(22,163,74,0.10)",
    ring: "rgba(22,163,74,0.45)",
  },
  {
    id: "creative",
    label: "Creative",
    blurb: "Art, writing, music, make things",
    gradient: "dusk",
    presetCover: "creative",
    featured: false,
    defaultImageKeywords: "art studio creative",
    accent: "#DB2777",
    soft: "rgba(219,39,119,0.10)",
    ring: "rgba(219,39,119,0.45)",
  },
  {
    id: "work",
    label: "Work",
    blurb: "Deep work, sales, productivity",
    gradient: "sky",
    presetCover: "office",
    featured: false,
    defaultImageKeywords: "office teamwork laptop",
    accent: "#1D4ED8",
    soft: "rgba(29,78,216,0.10)",
    ring: "rgba(29,78,216,0.45)",
  },
  {
    id: "finance",
    label: "Finance",
    blurb: "Saving, no-spend, budgets",
    gradient: "forest",
    presetCover: "finance",
    featured: false,
    defaultImageKeywords: "savings money goals",
    accent: "#059669",
    soft: "rgba(5,150,105,0.10)",
    ring: "rgba(5,150,105,0.45)",
  },
  {
    id: "social",
    label: "Social",
    blurb: "Meetups, calls, stay connected",
    gradient: "ember",
    presetCover: "social",
    featured: false,
    defaultImageKeywords: "friends coffee meetup",
    accent: "#EA580C",
    soft: "rgba(234,88,12,0.10)",
    ring: "rgba(234,88,12,0.45)",
  },
  {
    id: "food",
    label: "Food",
    blurb: "Cooking, meal prep, healthy eating",
    gradient: "ember",
    presetCover: "food",
    featured: false,
    defaultImageKeywords: "healthy food cooking",
    accent: "#D97706",
    soft: "rgba(217,119,6,0.10)",
    ring: "rgba(217,119,6,0.45)",
  },
  {
    id: "gaming",
    label: "Gaming",
    blurb: "Play time, wins, achievements",
    gradient: "violet",
    presetCover: "gaming",
    featured: false,
    defaultImageKeywords: "gaming esports controller",
    accent: "#9333EA",
    soft: "rgba(147,51,234,0.10)",
    ring: "rgba(147,51,234,0.45)",
  },
  {
    id: "custom",
    label: "Custom",
    blurb: "Anything else -your rules",
    gradient: "violet",
    presetCover: "team",
    featured: false,
    defaultImageKeywords: "team goals motivation",
    accent: "#6366F1",
    soft: "rgba(99,102,241,0.10)",
    ring: "rgba(99,102,241,0.45)",
  },
];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);
export const FEATURED_CATEGORIES = CATEGORIES.filter((c) => c.featured);

export function isCategory(v: string): v is Category {
  return (CATEGORY_IDS as string[]).includes(v);
}

export function categoryMeta(id: Category): CategoryMeta {
  return (
    CATEGORIES.find((c) => c.id === id) ??
    CATEGORIES.find((c) => c.id === "custom")!
  );
}

export const CATEGORY_ACCENT: Record<
  Category,
  { accent: string; soft: string; ring: string }
> = Object.fromEntries(
  CATEGORIES.map((c) => [
    c.id,
    { accent: c.accent, soft: c.soft, ring: c.ring },
  ]),
) as Record<Category, { accent: string; soft: string; ring: string }>;

export const CATEGORY_KEYWORDS: Record<Category, RegExp> = {
  reading: /\b(read|book|page|chapter|novel|library)\b/i,
  fitness:
    /\b(run|mile|km|gym|workout|lift|train|step|cycle|bike|swim|pushup|squat)\b/i,
  habits:
    /\b(habit|meditat|journal|mindful|daily streak|every day|practice)\b/i,
  learning:
    /\b(study|learn|dsa|course|leetcode|exam|homework|coding|skill|tutorial|college|class)\b/i,
  wellness: /\b(sleep|water|hydrat|step|walk|wellness|health|yoga|stretch)\b/i,
  creative:
    /\b(draw|paint|art|write|music|sketch|design|creative|poem|blog)\b/i,
  work: /\b(work|sales|deep work|productiv|focus|call|meeting|okr|pipeline)\b/i,
  finance: /\b(save|saving|budget|no[- ]?spend|money|finance|dollar)\b/i,
  social: /\b(friend|meetup|social|hangout|call|coffee|buddy|buddies)\b/i,
  food: /\b(cook|meal|food|eat|diet|nutrition|recipe|kitchen)\b/i,
  gaming: /\b(game|gaming|play|xbox|playstation|steam|esport|rank)\b/i,
  custom: /$^/,
};

export function inferCategoryFromText(text: string): Category {
  const lower = text.toLowerCase();
  const scores: Partial<Record<Category, number>> = {};
  for (const [cat, re] of Object.entries(CATEGORY_KEYWORDS) as [
    Category,
    RegExp,
  ][]) {
    if (cat === "custom") continue;
    const m = lower.match(new RegExp(re.source, "gi"));
    if (m) scores[cat] = m.length;
  }
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return (best?.[0] as Category) ?? "custom";
}

export const SUBTOPIC_IMAGE_KEYWORDS: { match: RegExp; keywords: string }[] = [
  {
    match: /\b(marathon|long run|ultra)\b/i,
    keywords: "marathon running road",
  },
  { match: /\b(trail run|trail)\b/i, keywords: "trail running forest" },
  { match: /\b(gym|weight|lift)\b/i, keywords: "gym weights training" },
  { match: /\b(yoga|stretch)\b/i, keywords: "yoga studio mat" },
  {
    match: /\b(dsa|algorithm|leetcode|coding)\b/i,
    keywords: "coding laptop algorithms",
  },
  {
    match: /\b(course|class|college|exam)\b/i,
    keywords: "students studying campus",
  },
  { match: /\b(book|reading)\b/i, keywords: "open book cozy" },
  { match: /\b(meditat|mindful)\b/i, keywords: "meditation peaceful" },
  {
    match: /\b(cook|meal prep|kitchen)\b/i,
    keywords: "cooking kitchen healthy",
  },
  { match: /\b(draw|paint|art)\b/i, keywords: "painting art studio" },
  { match: /\b(game|gaming)\b/i, keywords: "gaming setup neon" },
  { match: /\b(save|budget|money)\b/i, keywords: "piggy bank savings" },
  {
    match: /\b(friend|meetup|coffee|buddy|buddies)\b/i,
    keywords: "friends coffee shop",
  },
];

export function categoryCover(id: Category): {
  type: "preset" | "gradient";
  value: string;
} {
  const meta = categoryMeta(id);
  if (PRESET_COVERS[meta.presetCover]) {
    return { type: "preset", value: meta.presetCover };
  }
  return { type: "gradient", value: meta.gradient };
}

export function inferImageKeywords(text: string, category: Category): string {
  for (const { match, keywords } of SUBTOPIC_IMAGE_KEYWORDS) {
    if (match.test(text)) return keywords;
  }
  return categoryMeta(category).defaultImageKeywords;
}

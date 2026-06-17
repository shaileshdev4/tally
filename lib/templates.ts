import type { Category } from "@/lib/categories";
import { PRESET_COVERS } from "@/lib/covers";

export type Cadence = "total" | "daily";

export type Template = {
  id: string;
  category: Category;
  label: string;
  tagline: string;
  unit: string;
  cadence: Cadence;
  defaultName: string;
  defaultGoal: number | null;
  defaultDays: number;
  gradient: string;
  /** Preset cover key if exists in PRESET_COVERS; otherwise gradient is used */
  presetCover: string | null;
};

export { CATEGORY_ACCENT, type Category } from "@/lib/categories";

export const TEMPLATES: Template[] = [
  // Reading
  {
    id: "reading_pages_month",
    category: "reading",
    label: "Reading",
    tagline: "Pages this month",
    unit: "pages",
    cadence: "total",
    defaultName: "Pages this month",
    defaultGoal: 500,
    defaultDays: 30,
    gradient: "ember",
    presetCover: "books",
  },
  {
    id: "reading_books_year",
    category: "reading",
    label: "Books",
    tagline: "Books read this year",
    unit: "books",
    cadence: "total",
    defaultName: "Books this year",
    defaultGoal: 24,
    defaultDays: 365,
    gradient: "ember",
    presetCover: "books",
  },
  // Fitness
  {
    id: "fitness_miles_month",
    category: "fitness",
    label: "100-mile month",
    tagline: "Run or walk the distance",
    unit: "miles",
    cadence: "total",
    defaultName: "100-mile month",
    defaultGoal: 100,
    defaultDays: 30,
    gradient: "sky",
    presetCover: "run",
  },
  {
    id: "fitness_workout_streak",
    category: "fitness",
    label: "Workout streak",
    tagline: "Train every day",
    unit: "workouts",
    cadence: "daily",
    defaultName: "Daily workout streak",
    defaultGoal: 30,
    defaultDays: 30,
    gradient: "sky",
    presetCover: "gym",
  },
  {
    id: "fitness_steps_month",
    category: "fitness",
    label: "Step challenge",
    tagline: "Hit your step goal",
    unit: "steps",
    cadence: "total",
    defaultName: "10k steps a day",
    defaultGoal: 300000,
    defaultDays: 30,
    gradient: "sky",
    presetCover: "run",
  },
  // Habits
  {
    id: "habits_30_day",
    category: "habits",
    label: "30-day habit",
    tagline: "Show up every day",
    unit: "days",
    cadence: "daily",
    defaultName: "30-day habit",
    defaultGoal: 30,
    defaultDays: 30,
    gradient: "teal",
    presetCover: "calm",
  },
  {
    id: "habits_minutes",
    category: "habits",
    label: "Daily minutes",
    tagline: "Meditate / practice / focus",
    unit: "minutes",
    cadence: "total",
    defaultName: "Daily practice minutes",
    defaultGoal: 600,
    defaultDays: 30,
    gradient: "teal",
    presetCover: "calm",
  },
  // Learning
  {
    id: "learning_study_daily",
    category: "learning",
    label: "Study hours",
    tagline: "Daily study streak",
    unit: "minutes",
    cadence: "daily",
    defaultName: "Daily study session",
    defaultGoal: 120,
    defaultDays: 30,
    gradient: "violet",
    presetCover: "study",
  },
  {
    id: "learning_courses",
    category: "learning",
    label: "Finish courses",
    tagline: "Complete lessons together",
    unit: "lessons",
    cadence: "total",
    defaultName: "Course sprint",
    defaultGoal: 30,
    defaultDays: 60,
    gradient: "violet",
    presetCover: "campus",
  },
  {
    id: "learning_problems",
    category: "learning",
    label: "DSA / problems",
    tagline: "Solve problems as a group",
    unit: "problems",
    cadence: "total",
    defaultName: "DSA grind",
    defaultGoal: 100,
    defaultDays: 30,
    gradient: "violet",
    presetCover: "code",
  },
  // Wellness
  {
    id: "wellness_steps",
    category: "wellness",
    label: "Step goal",
    tagline: "Move more this month",
    unit: "steps",
    cadence: "total",
    defaultName: "Wellness steps",
    defaultGoal: 200000,
    defaultDays: 30,
    gradient: "forest",
    presetCover: "wellness",
  },
  {
    id: "wellness_sleep",
    category: "wellness",
    label: "Sleep streak",
    tagline: "Consistent bedtime",
    unit: "days",
    cadence: "daily",
    defaultName: "Sleep routine",
    defaultGoal: 21,
    defaultDays: 30,
    gradient: "forest",
    presetCover: "wellness",
  },
  // Creative
  {
    id: "creative_daily",
    category: "creative",
    label: "Create daily",
    tagline: "Make something every day",
    unit: "sessions",
    cadence: "daily",
    defaultName: "Daily creative streak",
    defaultGoal: 30,
    defaultDays: 30,
    gradient: "dusk",
    presetCover: "creative",
  },
  {
    id: "creative_writing",
    category: "creative",
    label: "Writing sprint",
    tagline: "Words or pages written",
    unit: "pages",
    cadence: "total",
    defaultName: "Writing month",
    defaultGoal: 100,
    defaultDays: 30,
    gradient: "dusk",
    presetCover: "writing",
  },
  // Work
  {
    id: "work_deep_focus",
    category: "work",
    label: "Deep work",
    tagline: "Focused hours logged",
    unit: "hours",
    cadence: "total",
    defaultName: "Deep work month",
    defaultGoal: 40,
    defaultDays: 30,
    gradient: "sky",
    presetCover: "office",
  },
  {
    id: "work_sales",
    category: "work",
    label: "Sales sprint",
    tagline: "Calls, deals, points",
    unit: "points",
    cadence: "total",
    defaultName: "Team sales board",
    defaultGoal: 100,
    defaultDays: 30,
    gradient: "sky",
    presetCover: "office",
  },
  // Finance
  {
    id: "finance_no_spend",
    category: "finance",
    label: "No-spend streak",
    tagline: "Days without impulse buys",
    unit: "days",
    cadence: "daily",
    defaultName: "No-spend challenge",
    defaultGoal: 30,
    defaultDays: 30,
    gradient: "forest",
    presetCover: "finance",
  },
  {
    id: "finance_savings",
    category: "finance",
    label: "Savings goal",
    tagline: "Save together",
    unit: "dollars",
    cadence: "total",
    defaultName: "Group savings goal",
    defaultGoal: 500,
    defaultDays: 90,
    gradient: "forest",
    presetCover: "finance",
  },
  // Social
  {
    id: "social_meetups",
    category: "social",
    label: "Meet up more",
    tagline: "In-person or virtual hangs",
    unit: "times",
    cadence: "total",
    defaultName: "Friend meetups",
    defaultGoal: 12,
    defaultDays: 90,
    gradient: "ember",
    presetCover: "social",
  },
  {
    id: "social_call_streak",
    category: "social",
    label: "Call streak",
    tagline: "Check in with someone daily",
    unit: "days",
    cadence: "daily",
    defaultName: "Stay in touch",
    defaultGoal: 30,
    defaultDays: 30,
    gradient: "ember",
    presetCover: "social",
  },
  // Food
  {
    id: "food_cook",
    category: "food",
    label: "Cook at home",
    tagline: "Meals you made",
    unit: "meals",
    cadence: "total",
    defaultName: "Home cooking month",
    defaultGoal: 20,
    defaultDays: 30,
    gradient: "ember",
    presetCover: "food",
  },
  {
    id: "food_healthy_streak",
    category: "food",
    label: "Healthy eating",
    tagline: "Days on plan",
    unit: "days",
    cadence: "daily",
    defaultName: "Healthy eating streak",
    defaultGoal: 30,
    defaultDays: 30,
    gradient: "ember",
    presetCover: "food",
  },
  // Gaming
  {
    id: "gaming_hours",
    category: "gaming",
    label: "Play time",
    tagline: "Hours played together",
    unit: "hours",
    cadence: "total",
    defaultName: "Gaming hours",
    defaultGoal: 50,
    defaultDays: 30,
    gradient: "violet",
    presetCover: "gaming",
  },
  {
    id: "gaming_streak",
    category: "gaming",
    label: "Daily play streak",
    tagline: "Log in every day",
    unit: "days",
    cadence: "daily",
    defaultName: "Daily gaming streak",
    defaultGoal: 30,
    defaultDays: 30,
    gradient: "violet",
    presetCover: "gaming",
  },
];

export const templateById = (id?: string | null) => TEMPLATES.find((t) => t.id === id) ?? null;

export const templatesByCategory = (c: Category) => TEMPLATES.filter((t) => t.category === c);

export function templateCover(t: Template): { type: "preset" | "gradient"; value: string } {
  if (t.presetCover && PRESET_COVERS[t.presetCover]) {
    return { type: "preset", value: t.presetCover };
  }
  return { type: "gradient", value: t.gradient };
}

export const defaultTemplateFor = (c: Category) => templatesByCategory(c)[0] ?? null;

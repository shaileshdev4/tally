import type { Category } from "@/lib/categories";

export type UnitOption = { value: string; label: string };

export const UNITS_BY_CATEGORY: Record<Category, UnitOption[]> = {
  reading: [
    { value: "pages", label: "Pages" },
    { value: "books", label: "Books" },
    { value: "chapters", label: "Chapters" },
    { value: "minutes", label: "Minutes read" },
  ],
  fitness: [
    { value: "miles", label: "Miles" },
    { value: "km", label: "Kilometers" },
    { value: "workouts", label: "Workouts" },
    { value: "minutes", label: "Minutes" },
    { value: "steps", label: "Steps" },
    { value: "reps", label: "Reps" },
  ],
  habits: [
    { value: "days", label: "Days" },
    { value: "minutes", label: "Minutes" },
    { value: "sessions", label: "Sessions" },
    { value: "times", label: "Times" },
  ],
  learning: [
    { value: "minutes", label: "Minutes" },
    { value: "hours", label: "Hours" },
    { value: "lessons", label: "Lessons" },
    { value: "problems", label: "Problems solved" },
    { value: "chapters", label: "Chapters" },
    { value: "days", label: "Days (streak)" },
  ],
  wellness: [
    { value: "steps", label: "Steps" },
    { value: "hours", label: "Hours sleep" },
    { value: "glasses", label: "Glasses of water" },
    { value: "minutes", label: "Minutes" },
    { value: "days", label: "Days" },
  ],
  creative: [
    { value: "sessions", label: "Sessions" },
    { value: "pages", label: "Pages" },
    { value: "pieces", label: "Pieces" },
    { value: "minutes", label: "Minutes" },
    { value: "days", label: "Days" },
  ],
  work: [
    { value: "hours", label: "Hours" },
    { value: "points", label: "Points" },
    { value: "calls", label: "Calls" },
    { value: "tasks", label: "Tasks" },
    { value: "deals", label: "Deals" },
  ],
  finance: [
    { value: "dollars", label: "Dollars ($)" },
    { value: "days", label: "Days" },
    { value: "points", label: "Points" },
  ],
  social: [
    { value: "times", label: "Times" },
    { value: "days", label: "Days" },
    { value: "calls", label: "Calls" },
    { value: "events", label: "Events" },
  ],
  food: [
    { value: "meals", label: "Meals" },
    { value: "days", label: "Days" },
    { value: "recipes", label: "Recipes" },
  ],
  gaming: [
    { value: "hours", label: "Hours" },
    { value: "wins", label: "Wins" },
    { value: "matches", label: "Matches" },
    { value: "days", label: "Days" },
  ],
  custom: [
    { value: "points", label: "Points" },
    { value: "hours", label: "Hours" },
    { value: "minutes", label: "Minutes" },
    { value: "pages", label: "Pages" },
    { value: "miles", label: "Miles" },
    { value: "days", label: "Days" },
    { value: "reps", label: "Reps" },
    { value: "custom", label: "Custom unit…" },
  ],
};

export const DURATION_PRESETS = [
  { days: 7, label: "1 week" },
  { days: 14, label: "2 weeks" },
  { days: 20, label: "20 days" },
  { days: 30, label: "30 days" },
  { days: 60, label: "60 days" },
  { days: 90, label: "90 days" },
  { days: 365, label: "1 year" },
] as const;

export function unitsForCategory(category: Category): UnitOption[] {
  return UNITS_BY_CATEGORY[category];
}

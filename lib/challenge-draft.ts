import {
  type Category,
  categoryMeta,
  inferCategoryFromText,
  inferImageKeywords,
  isCategory,
} from "@/lib/categories";
import {
  templateById,
  defaultTemplateFor,
  type Cadence,
} from "@/lib/templates";

export type ChallengeDraft = {
  name: string;
  category: Category;
  template_id: string | null;
  unit: string;
  goal: number | null;
  days: number;
  cadence: Cadence;
  gradient: string;
  preset_cover: string | null;
  image_keywords: string;
  follow_up: string | null;
};

export function fallbackDraft(prompt: string): ChallengeDraft {
  const lower = prompt.toLowerCase();
  const category = inferCategoryFromText(prompt);
  const tpl = defaultTemplateFor(category);
  const meta = categoryMeta(category);

  const daysMatch = lower.match(/(\d+)\s*days?/);
  const days = daysMatch
    ? Math.min(365, Math.max(7, Number(daysMatch[1])))
    : (tpl?.defaultDays ?? 30);

  const hoursMatch = lower.match(/(\d+)\s*hrs?/);
  const minsMatch = lower.match(/(\d+)\s*min/);
  let goal = tpl?.defaultGoal ?? null;
  let unit = tpl?.unit ?? "points";

  if (
    hoursMatch &&
    (category === "learning" || category === "work" || category === "gaming")
  ) {
    unit = "minutes";
    goal = Number(hoursMatch[1]) * 60;
  } else if (minsMatch) {
    unit = "minutes";
    goal = Number(minsMatch[1]);
  }

  const cadence: Cadence =
    /\b(daily|every day|each day|streak|per day)\b/i.test(lower)
      ? "daily"
      : (tpl?.cadence ?? "total");

  const image_keywords = inferImageKeywords(prompt, category);

  let name = prompt.trim().slice(0, 80);
  if (category === "learning" && /\bdsa\b/i.test(lower))
    name = "DSA study grind";
  if (name.length > 60) name = `${meta.label} challenge`;

  return {
    name,
    category,
    template_id: tpl?.id ?? null,
    unit,
    goal,
    days,
    cadence,
    gradient: tpl?.gradient ?? meta.gradient,
    preset_cover: tpl?.presetCover ?? null,
    image_keywords,
    follow_up: null,
  };
}

export function normalizeDraft(
  raw: Record<string, unknown>,
  prompt: string,
): ChallengeDraft {
  const fb = fallbackDraft(prompt);
  const category = isCategory(String(raw.category ?? ""))
    ? (raw.category as Category)
    : fb.category;
  const tpl =
    typeof raw.template_id === "string" ? templateById(raw.template_id) : null;
  const meta = categoryMeta(category);

  const unit =
    typeof raw.unit === "string" && raw.unit.trim()
      ? raw.unit.trim()
      : (tpl?.unit ?? fb.unit);
  const days = typeof raw.days === "number" ? clamp(raw.days, 7, 365) : fb.days;
  const cadence: Cadence =
    raw.cadence === "daily"
      ? "daily"
      : raw.cadence === "total"
        ? "total"
        : fb.cadence;
  const goal =
    typeof raw.goal === "number" && raw.goal > 0
      ? raw.goal
      : raw.goal === null
        ? null
        : fb.goal;

  const rawKw =
    typeof raw.image_keywords === "string"
      ? raw.image_keywords
      : typeof raw.cover_query === "string"
        ? raw.cover_query
        : "";

  const image_keywords = rawKw.trim()
    ? normalizeImageKeywords(rawKw)
    : inferImageKeywords(prompt, category);

  return {
    name:
      typeof raw.name === "string" && raw.name.trim()
        ? raw.name.trim().slice(0, 80)
        : fb.name,
    category,
    template_id: tpl ? tpl.id : fb.template_id,
    unit,
    goal,
    days,
    cadence,
    gradient: tpl?.gradient ?? meta.gradient,
    preset_cover: tpl?.presetCover ?? null,
    image_keywords,
    follow_up:
      typeof raw.follow_up === "string" && raw.follow_up.trim()
        ? raw.follow_up.trim()
        : null,
  };
}

function normalizeImageKeywords(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .join(" ");
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(n)));
}

const CATEGORY_LIST = [
  "reading",
  "fitness",
  "habits",
  "learning",
  "wellness",
  "creative",
  "work",
  "finance",
  "social",
  "food",
  "gaming",
  "custom",
].join(", ");

export const DRAFT_JSON_SCHEMA = `{
  "name": "short challenge title",
  "category": one of: ${CATEGORY_LIST},
  "template_id": matching template id or null,
  "unit": "appropriate unit for category",
  "goal": number or null,
  "days": number 7-365,
  "cadence": "total" or "daily",
  "image_keywords": "EXACTLY 2-3 words for SPECIFIC stock photo search -NOT the broad category name. Examples: running → \\"trail running\\"; DSA study → \\"coding laptop\\"; gym → \\"gym weights\\"; friends → \\"coffee friends\\"",
  "follow_up": null OR one short question if impossible to infer
}`;

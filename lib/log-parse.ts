import { groqJson } from "@/lib/groq";

export async function parseLogInput(
  text: string,
  unit: string,
  cadence: string
): Promise<{ amount: number; note: string | null } | null> {
  const parsed = await groqJson<{ amount: number; note: string | null }>(
    `Extract a log entry for a group challenge counting "${unit}" (cadence: ${cadence}). Return JSON: { "amount": number, "note": string|null }. For daily streak challenges amount is always 1. Parse natural language like "ran 3 miles" or "20 pages".`,
    text
  );
  if (!parsed || typeof parsed.amount !== "number" || parsed.amount < 1) return null;
  return {
    amount: cadence === "daily" ? 1 : Math.round(parsed.amount),
    note: parsed.note ?? text,
  };
}

export async function parseVisionLog(
  imageUrl: string,
  unit: string
): Promise<{ amount: number; note: string | null } | null> {
  const { groqVisionText } = await import("@/lib/groq");
  const raw = await groqVisionText(
    imageUrl,
    `This image may be fitness tracker, book, or workout proof. Extract the number of ${unit} if visible. Reply ONLY with JSON: {"amount": number, "note": "brief description"}. If unclear use amount 1.`
  );
  if (!raw) return null;
  try {
    const j = JSON.parse(raw.replace(/```json\n?|\n?```/g, "")) as { amount: number; note?: string };
    if (typeof j.amount === "number" && j.amount > 0) {
      return { amount: Math.round(j.amount), note: j.note ?? null };
    }
  } catch {
    const n = parseFloat(raw.match(/[\d.]+/)?.[0] ?? "");
    if (n > 0) return { amount: Math.round(n), note: null };
  }
  return null;
}

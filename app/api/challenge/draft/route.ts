import { NextRequest, NextResponse } from "next/server";
import {
  DRAFT_JSON_SCHEMA,
  fallbackDraft,
  normalizeDraft,
  type ChallengeDraft,
} from "@/lib/challenge-draft";
import { suggestCoverUrls } from "@/lib/cover-suggest";

import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

const GROQ_MODEL = "llama-3.3-70b-versatile";

export async function POST(req: NextRequest) {
  if (!rateLimit(`draft:${clientKey(req)}`, 15)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { prompt } = await req.json();
  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return NextResponse.json({ error: "missing prompt" }, { status: 400 });
  }

  const text = prompt.trim();
  let draft: ChallengeDraft = fallbackDraft(text);

  const key = process.env.GROQ_API_KEY;
  if (key) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          max_tokens: 400,
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `You extract group challenge settings from casual user text. Return ONLY valid JSON matching:\n${DRAFT_JSON_SCHEMA}\nPick the best category from the list. For image_keywords return 2-3 SPECIFIC visual words about the activity (not the category label). Set follow_up only if truly ambiguous.`,
            },
            { role: "user", content: text },
          ],
        }),
      });
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        draft = normalizeDraft(JSON.parse(content) as Record<string, unknown>, text);
      }
    } catch {
      draft = fallbackDraft(text);
    }
  }

  const cover_urls = await suggestCoverUrls(draft.category, draft.image_keywords);

  return NextResponse.json({ draft, cover_urls });
}

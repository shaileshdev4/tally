import { NextRequest, NextResponse } from "next/server";
import { isCategory, inferImageKeywords } from "@/lib/categories";
import { suggestCoverUrls } from "@/lib/cover-suggest";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!rateLimit(`covers:${clientKey(req)}`, 30)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json();
  const category = body?.category;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const keywords =
    typeof body?.keywords === "string" && body.keywords.trim()
      ? body.keywords.trim()
      : inferImageKeywords(name, isCategory(category) ? category : "custom");

  if (!isCategory(category)) {
    return NextResponse.json({ error: "invalid category" }, { status: 400 });
  }

  const urls = await suggestCoverUrls(category, keywords, 6);

  return NextResponse.json({ urls, keywords });
}

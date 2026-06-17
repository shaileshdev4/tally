import { NextRequest, NextResponse } from "next/server";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { parseVisionLog } from "@/lib/log-parse";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!rateLimit(`log-vision:${clientKey(req)}`, 15)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const { imageUrl, unit } = await req.json();
  if (!imageUrl || !unit) return NextResponse.json({ error: "missing fields" }, { status: 400 });

  const parsed = await parseVisionLog(String(imageUrl), String(unit));
  if (!parsed) return NextResponse.json({ error: "Could not read image" }, { status: 422 });
  return NextResponse.json(parsed);
}

import { NextRequest, NextResponse } from "next/server";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { parseLogInput } from "@/lib/log-parse";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!rateLimit(`log-parse:${clientKey(req)}`, 30)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const { text, unit, cadence } = await req.json();
  if (!text || !unit) return NextResponse.json({ error: "missing fields" }, { status: 400 });

  const parsed = await parseLogInput(String(text), String(unit), String(cadence ?? "total"));
  if (!parsed) {
    const n = parseFloat(String(text).match(/[\d.]+/)?.[0] ?? "");
    if (n > 0) return NextResponse.json({ amount: Math.round(n), note: String(text) });
    return NextResponse.json({ error: "Could not parse that log" }, { status: 422 });
  }
  return NextResponse.json(parsed);
}

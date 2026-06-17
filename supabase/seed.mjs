// Seed a populated public demo challenge so the landing page is never empty.
// Requires SUPABASE_SERVICE_ROLE_KEY (RLS blocks anon inserts after 004_auth_production.sql).
// Usage: npm run seed   (reads .env / .env.local from project root)
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

for (const file of [".env", ".env.local"]) {
  const path = resolve(root, file);
  if (!existsSync(path)) continue;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] ??= m[2].trim();
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    "Warning: seeding with anon key may fail after 004_auth_production.sql - set SUPABASE_SERVICE_ROLE_KEY",
  );
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const slug = "reading-challenge-demo";
const ends_at = new Date(Date.now() + 23 * 86400000).toISOString();

const { data: existing } = await supabase
  .from("challenges")
  .select("id")
  .eq("slug", slug)
  .maybeSingle();

if (existing) {
  console.log("Demo challenge already seeded:", slug);
  process.exit(0);
}

const { data: ch, error: chErr } = await supabase
  .from("challenges")
  .insert({
    slug,
    name: "30-Day Reading Challenge",
    unit: "pages",
    ends_at,
    is_demo: true,
    category: "reading",
    template_id: "reading_pages_month",
    cover_type: "gradient",
    cover_value: "ember",
    cadence: "total",
  })
  .select("id")
  .single();

if (chErr || !ch) {
  console.error(
    "Failed to create challenge:",
    chErr?.message ?? "unknown error",
  );
  process.exit(1);
}

const challenge_id = ch.id;
const people = [
  ["Priya", [42, 38, 55, 30, 47]],
  ["Marcus", [60, 45, 50]],
  ["Tomoko", [25, 30, 28, 35, 40, 22]],
  ["Sofia", [80, 70]],
  ["Dev", [15, 20, 18]],
];

for (const [display_name, days] of people) {
  const { data: m, error: mErr } = await supabase
    .from("members")
    .insert({ challenge_id, display_name })
    .select("id")
    .single();
  if (mErr || !m) {
    console.error(`Failed to add member ${display_name}:`, mErr?.message);
    process.exit(1);
  }
  for (let i = 0; i < days.length; i++) {
    const logged_on = new Date(Date.now() - i * 86400000)
      .toISOString()
      .slice(0, 10);
    const { error: logErr } = await supabase
      .from("logs")
      .insert({ member_id: m.id, challenge_id, amount: days[i], logged_on });
    if (logErr) {
      console.error(`Failed to log for ${display_name}:`, logErr.message);
      process.exit(1);
    }
  }
}

console.log("Seeded demo challenge:", slug);

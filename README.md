# Tally

**The group challenge, minus the spreadsheet.** Spin up any challenge (read X books,
run Y miles, do Z for 30 days), share one link, and everyone watches a live leaderboard.

Built for _World Product Day -"Everyone Ships Now."_

---

## Why this shape

- **Distribution is the mechanic.** Create → invite → join → log → leaderboard. Each
  created challenge's invite link recruits the next user, so the product is its own
  growth loop -and Novus sees genuine multi-user traffic, not an empty dashboard.
- **No empty first impression.** The landing page leads with a _live, pre-seeded public
  demo challenge_ anyone can join in one tap. Creating your own is the second action.
- **No login wall on core value.** A stranger reaches a populated leaderboard in <10s.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind
- Supabase (Postgres + Realtime) -anonymous, link-based access
- Groq (Llama) for the optional weekly "trash-talk recap" (graceful fallback if no key)
- Milestone badges computed live from leaderboard data (no extra tables)
- Framer Motion for the animated leaderboard reorder
- Deploy: Vercel

## Routes (rich surface for Novus)

| Route             | What it does                                                        |
| ----------------- | ------------------------------------------------------------------- |
| `/`               | Landing + template cards + live demo leaderboard                    |
| `/create`         | Template-first challenge creation (category, cover, cadence)        |
| `/c/[id]`         | Challenge view: cover, log modal, leaderboard, activity feed, recap |
| `/c/[id]/join`    | Auth + join with display name                                       |
| `/profile`        | Account hub: overview, stats, recent activity                       |
| `/profile/challenges` | All joined and hosted challenges                                |
| `/profile/history`    | Full activity log history                                       |
| `/profile/settings`   | Profile name, Strava, sign out                                  |
| `/me`             | Redirects to `/profile`                                             |
| `/auth/callback`  | OAuth / magic-link session exchange                                 |
| `/api/recap`      | On-demand Groq recap                                                |
| `/api/cron/recap` | Weekly recap cron scaffold (Vercel)                                 |

## Setup

1. **Create a Supabase project.** In the SQL editor, run in order:
   - `supabase/schema.sql` -base tables, leaderboard view, RLS, realtime
   - `supabase/migrations/002_platform.sql` -auth identity, templates/covers, proof, flags, streaks
   - `supabase/migrations/003_ship.sql` -host controls, hidden logs, Strava tokens, analytics, RLS
   - `supabase/migrations/004_auth_production.sql` -profiles, strict write RLS, `/me` activity view
   - `supabase/storage.sql` -`proofs` bucket for photo uploads

   Enable **Google** and **Email (magic link)** under Authentication → Providers. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.com/auth/callback`

2. **Env vars.** Copy `.env.local.example` → `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   GROQ_API_KEY=...              # optional; AI draft, recap, log parse
   SUPABASE_SERVICE_ROLE_KEY=... # required for `npm run seed` after migration 004
   RESEND_API_KEY=...            # optional; weekly recap + nudge emails
   CRON_SECRET=...               # optional; protect /api/cron/*
   STRAVA_CLIENT_ID=...          # optional; fitness sync
   STRAVA_CLIENT_SECRET=...
   NEXT_PUBLIC_SITE_URL=...      # OG previews + email links
   ```

3. **Install & run.**

   ```
   npm install
   npm run dev
   ```

4. **Seed the public demo challenge** (so the landing page is alive):
   ```
   npm run seed
   ```

## Deploy (Vercel)

1. Push this repo to GitHub.
2. Import into Vercel; set the three env vars in project settings.
3. Deploy. Run the seed script once against the production Supabase.

## Novus

1. Connect this **GitHub repo** to Novus; let it instrument via PR (auto-tagging).
2. The multi-route, interaction-rich surface gives Novus real behavior to map.
3. **Instrument the join funnel** (`/c/[id]/join`). In the demo, surface one real Novus
   insight -e.g. drop-off at the join step -and show the fix (one-tap join, name only).

## Scope (deliberately small)

In: create → join → log → live leaderboard + two delight features (milestone
badges, computed live from the data; and an AI weekly recap).
Out: comments/chat, multiple challenge types per account, mobile app, push notifications,
teams-within-teams.

## Platform (v2)

### What it adds

- **Templates:** Reading / Fitness / Habits + Custom -presets, native units, per-category accent theming (`CategoryTheme`).
- **Covers:** SVG gradient fallback → preset image → custom upload (`Cover`, `CoverPicker`).
- **Identity:** Supabase magic-link + Google OAuth; `profiles` table; membership keyed to `user_id`; session refresh via middleware; creating/hosting requires sign-in.
- **Verification:** optional photo proof + note on logs (Tier 1); react-to-flag activity feed (Tier 2).
- **Retention:** streak view, cadence-aware ranking (`daily` = streak-first), log-today nudge, weekly cron scaffold (`vercel.json`).

### Cron

`vercel.json` schedules `/api/cron/recap` Mondays 09:00 UTC (scaffold -wire email later).

# Tally — Hackathon submission checklist

**Event:** [Mind the Product — Everyone Ships Now](https://mindtheproduct.devpost.com/)  
**Deadline:** Jun 20, 2026 @ 5:00pm BST  
**Prize eligibility:** New project (started on/after May 20), public deployed URL, **Novus.ai installed**, demo video, Novus dashboard screenshot.

Work through sections in order. Check boxes as you go.

---

## 1. GitHub & repository

> **You are here.** Tally is not a git repo yet — complete this section first.

### 1.1 Local git setup

- [ ] Confirm `.gitignore` exists in `tally/` (secrets, `node_modules`, `.next`, `.env*` excluded)
- [ ] Confirm `.env` is **not** tracked (only `.env.local.example` is committed)
- [ ] Initialize git in the `tally` folder:
  ```bash
  cd tally
  git init
  git add .
  git status
  ```
- [ ] Verify `git status` does **not** list `.env`, `node_modules`, or `.next`
- [ ] First commit:
  ```bash
  git commit -m "Initial commit: Tally group challenge app"
  ```

### 1.2 Create GitHub remote

- [ ] Create a new **public** repo on GitHub (e.g. `tally` or `tally-challenge`)
- [ ] Do **not** add a README/license on GitHub if you already have a local README (avoid merge conflicts)
- [ ] Add remote and push:
  ```bash
  git branch -M main
  git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
  git push -u origin main
  ```
- [ ] Open the repo on GitHub and confirm source files are visible (no `.env`)

### 1.3 Repo hygiene (before judges / Novus)

- [ ] README describes what Tally is and how to run locally
- [ ] `.env.local.example` lists all env vars (no real keys)
- [ ] No API keys or `SUPABASE_SERVICE_ROLE_KEY` in committed files
- [ ] Optional: add `LICENSE` if you want open source

**Done when:** GitHub repo is public, pushed, and contains no secrets.

---

## 2. Supabase (database & auth)

- [ ] Supabase project created
- [ ] Run migrations in order in SQL editor:
  1. `supabase/schema.sql`
  2. `supabase/migrations/002_platform.sql`
  3. `supabase/migrations/003_ship.sql`
  4. `supabase/migrations/004_auth_production.sql`
- [ ] Run `supabase/storage.sql` if using proof uploads
- [ ] Copy project URL + anon key into local `.env`
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY` locally only (for `npm run seed`)
- [ ] `npm run seed` against production DB (once) for demo challenge data

**Done when:** App works locally with auth, profile, create/join/log flows.

---

## 3. Deploy (public URL)

Hackathon requires a **clickable live URL** — not “clone and run locally.”

- [ ] Import GitHub repo into [Vercel](https://vercel.com)
- [ ] Set environment variables in Vercel (match `.env.local.example`):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `GROQ_API_KEY` (optional, for recap)
  - `SUPABASE_SERVICE_ROLE_KEY` (server only, if needed for cron/seed)
  - `NEXT_PUBLIC_SITE_URL` → your production URL
  - Others as needed (Strava, Resend, `CRON_SECRET`)
- [ ] Deploy succeeds (`npm run build` passes on Vercel)
- [ ] Smoke test production:
  - [ ] Home page loads
  - [ ] Demo challenge / leaderboard works
  - [ ] Sign in (Google or magic link)
  - [ ] Create challenge
  - [ ] Join + log progress
  - [ ] Profile pages load

**Done when:** You have a stable public URL to put on Devpost.

---

## 4. Novus.ai (required for prizes)

[Novus](https://www.novus.ai/) auto-instruments your app from the GitHub repo. Sign up: [novus.pendo.io](https://novus.pendo.io).

- [ ] Sign up for Novus (free open beta)
- [ ] Connect the **Tally GitHub repo** to Novus
- [ ] Grant Novus permission to open PRs on the repo
- [ ] Review Novus instrumentation PR → merge
- [ ] Redeploy Vercel after merge
- [ ] Generate real usage on production (you + 1–2 friends):
  - [ ] Land on `/`
  - [ ] Join demo or new challenge
  - [ ] Log at least one entry
  - [ ] Visit `/profile`
- [ ] Open Novus dashboard — confirm events/flows appear
- [ ] **Screenshot Novus dashboard** (required for Devpost submission)

**Done when:** Novus is installed on deployed app and dashboard shows behavior.

---

## 5. Privacy & compliance

Novus/Pendo collects behavioral analytics — users should be informed.

- [ ] Update `/privacy` to mention product analytics (Novus/Pendo)
- [ ] Confirm auth flows work with production redirect URLs
- [ ] Supabase Auth redirect URLs include production domain

**Done when:** Privacy page reflects analytics; auth works on production.

---

## 6. Demo & polish

- [ ] Logo + favicon consistent (`/icon.svg`, header, PWA)
- [ ] Record **2–3 minute demo video** (YouTube, Vimeo, or Loom — public or unlisted)
  - [ ] Show problem + create challenge + share link + join + log + leaderboard
  - [ ] Optional: 30s showing one Novus insight
- [ ] Write short project description:
  - What you built
  - Who it's for
  - Tools used (Cursor, Next.js, Supabase, etc.)
  - What you learned shipping it
- [ ] Optional: post progress with `#EveryoneShipsNow` and tag @MindTheProduct

**Done when:** Video URL ready; description drafted.

---

## 7. Devpost submission

Submit at [mindtheproduct.devpost.com](https://mindtheproduct.devpost.com/) before **Jun 20, 2026 @ 5:00pm BST**.

- [ ] **Public URL** to deployed Tally
- [ ] **Demo video** link (2–3 min)
- [ ] **Novus dashboard screenshot** (installed + tracking)
- [ ] **Written description** (what / who / tools / learnings)
- [ ] Confirm project started on or after **May 20, 2026**
- [ ] Optional: LinkedIn / blog link showing build journey

**Done when:** Submission is live on Devpost.

---

## Quick reference

| Item | Location |
|------|----------|
| Env template | `.env.local.example` |
| Migrations | `supabase/migrations/` |
| Deploy config | `vercel.json` |
| Novus signup | https://novus.pendo.io |
| Hackathon rules | https://mindtheproduct.devpost.com/ |

---

## Judging criteria (what to optimize for)

| Criterion | Weight | Tally angle |
|-----------|--------|-------------|
| Product thinking | 25% | Clear problem: group challenges without spreadsheets |
| Craft & execution | 25% | End-to-end flows, UI polish, auth, profile |
| Originality & ambition | 25% | Live leaderboard, templates, AI recap |
| Shippedness | 25% | Live URL + Novus measurable behavior |

---

*Last updated: checklist created with GitHub / `.gitignore` as step 1.*

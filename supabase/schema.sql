-- Tally -schema
-- Run in Supabase SQL editor.

create extension if not exists "pgcrypto";

create table if not exists challenges (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  unit text not null,            -- "pages" | "miles" | "days" | "reps" | custom
  goal numeric,                  -- optional per-person or group target
  ends_at timestamptz,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists logs (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  challenge_id uuid not null references challenges(id) on delete cascade,
  amount numeric not null,
  logged_on date not null default (now() at time zone 'utc')::date,
  created_at timestamptz not null default now()
);

create index if not exists idx_members_challenge on members(challenge_id);
create index if not exists idx_logs_challenge on logs(challenge_id);
create index if not exists idx_logs_member on logs(member_id);

-- Leaderboard view: total per member + whether they logged today + streak-ish signal.
create or replace view leaderboard as
select
  m.id as member_id,
  m.challenge_id,
  m.display_name,
  coalesce(sum(l.amount), 0) as total,
  bool_or(l.logged_on = (now() at time zone 'utc')::date) as logged_today,
  count(distinct l.logged_on) as active_days
from members m
left join logs l on l.member_id = m.id
group by m.id, m.challenge_id, m.display_name;

-- Open RLS for the hackathon MVP (anonymous, link-based access).
alter table challenges enable row level security;
alter table members enable row level security;
alter table logs enable row level security;

create policy "read all challenges" on challenges for select using (true);
create policy "insert challenges" on challenges for insert with check (true);
create policy "read all members" on members for select using (true);
create policy "insert members" on members for insert with check (true);
create policy "read all logs" on logs for select using (true);
create policy "insert logs" on logs for insert with check (true);

-- Enable realtime
alter publication supabase_realtime add table logs;
alter publication supabase_realtime add table members;

-- ============ 002_platform.sql ============
-- Run after schema.sql. Templates, identity, proof, flags, streaks.

-- Identity: link members to real auth users (nullable for legacy anon rows)
alter table members add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table members add column if not exists avatar_seed text;

-- Templates + covers on challenges
alter table challenges add column if not exists category text not null default 'custom';
alter table challenges add column if not exists template_id text;
alter table challenges add column if not exists cover_type text not null default 'gradient';
alter table challenges add column if not exists cover_value text;
alter table challenges add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table challenges add column if not exists cadence text not null default 'total';
alter table challenges add column if not exists status text not null default 'active';
alter table challenges add column if not exists strava_enabled boolean not null default false;

-- Verification on logs (Tier 1: proof, Tier 2: flags)
alter table logs add column if not exists note text;
alter table logs add column if not exists proof_path text;
alter table logs add column if not exists flag_count int not null default 0;
alter table logs add column if not exists flagged_by uuid[];

-- Flags table (auditable, one per user per log)
create table if not exists flags (
  id uuid primary key default gen_random_uuid(),
  log_id uuid not null references logs(id) on delete cascade,
  challenge_id uuid not null references challenges(id) on delete cascade,
  flagged_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (log_id, flagged_by)
);
create index if not exists idx_flags_log on flags(log_id);

-- Streak helper view: consecutive-day streak per member (UTC)
create or replace view member_streaks as
with days as (
  select member_id, challenge_id, logged_on,
         logged_on - (row_number() over (partition by member_id order by logged_on))::int as grp
  from (select distinct member_id, challenge_id, logged_on from logs) d
)
select member_id, challenge_id,
       max(streak_len) as best_streak,
       max(case when last_day >= (now() at time zone 'utc')::date - 1 then streak_len else 0 end) as current_streak
from (
  select member_id, challenge_id, grp, count(*) as streak_len, max(logged_on) as last_day
  from days group by member_id, challenge_id, grp
) s
group by member_id, challenge_id;

-- Extend leaderboard view with proof/flag signal + streak.
-- Must DROP first: CREATE OR REPLACE cannot insert/rename columns in the middle.
drop view if exists leaderboard;

create view leaderboard as
select
  m.id as member_id, m.challenge_id, m.display_name, m.user_id, m.avatar_seed,
  coalesce(sum(l.amount), 0) as total,
  bool_or(l.logged_on = (now() at time zone 'utc')::date) as logged_today,
  count(distinct l.logged_on) as active_days,
  count(l.proof_path) as proof_count,
  coalesce(sum(l.flag_count), 0) as flag_total,
  coalesce(max(st.current_streak), 0) as current_streak
from members m
left join logs l on l.member_id = m.id
left join member_streaks st on st.member_id = m.id and st.challenge_id = m.challenge_id
group by m.id, m.challenge_id, m.display_name, m.user_id, m.avatar_seed;

-- RLS for new table
alter table flags enable row level security;
drop policy if exists "read flags" on flags;
drop policy if exists "insert flags" on flags;
create policy "read flags" on flags for select using (true);
create policy "insert flags" on flags for insert with check (true);

-- Atomic flag increment (called from app)
create or replace function add_flag(p_log uuid, p_challenge uuid, p_user uuid)
returns void language plpgsql as $$
begin
  insert into flags (log_id, challenge_id, flagged_by) values (p_log, p_challenge, p_user)
  on conflict (log_id, flagged_by) do nothing;
  update logs set flag_count = (select count(*) from flags where log_id = p_log) where id = p_log;
end; $$;

alter publication supabase_realtime add table flags;

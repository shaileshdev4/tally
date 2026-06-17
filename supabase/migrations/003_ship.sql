-- 003_ship.sql -production hardening: host controls, trust, integrations, analytics

alter table challenges add column if not exists status text not null default 'active';
alter table challenges add column if not exists strava_enabled boolean not null default false;

alter table logs add column if not exists hidden boolean not null default false;
alter table logs add column if not exists updated_at timestamptz not null default now();

create table if not exists member_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  athlete_id text,
  created_at timestamptz not null default now(),
  unique (user_id, provider)
);

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  properties jsonb default '{}',
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists idx_analytics_event on analytics_events(event, created_at desc);

-- Leaderboard excludes hidden logs
drop view if exists leaderboard;

create view leaderboard as
select
  m.id as member_id, m.challenge_id, m.display_name, m.user_id, m.avatar_seed,
  coalesce(sum(case when coalesce(l.hidden, false) then 0 else l.amount end), 0) as total,
  bool_or(l.logged_on = (now() at time zone 'utc')::date and not coalesce(l.hidden, false)) as logged_today,
  count(distinct case when not coalesce(l.hidden, false) then l.logged_on end) as active_days,
  count(case when l.proof_path is not null and not coalesce(l.hidden, false) then 1 end) as proof_count,
  coalesce(sum(case when not coalesce(l.hidden, false) then l.flag_count else 0 end), 0) as flag_total,
  coalesce(max(st.current_streak), 0) as current_streak
from members m
left join logs l on l.member_id = m.id
left join member_streaks st on st.member_id = m.id and st.challenge_id = m.challenge_id
group by m.id, m.challenge_id, m.display_name, m.user_id, m.avatar_seed;

-- RLS: members can update/delete own logs; hosts can update challenge + hide any log
drop policy if exists "update own logs" on logs;
drop policy if exists "delete own logs" on logs;
drop policy if exists "update challenges host" on challenges;

create policy "update own logs" on logs for update using (
  exists (select 1 from members m where m.id = logs.member_id and m.user_id = auth.uid())
);

create policy "delete own logs" on logs for delete using (
  exists (select 1 from members m where m.id = logs.member_id and m.user_id = auth.uid())
  or exists (select 1 from challenges c where c.id = logs.challenge_id and c.created_by = auth.uid())
);

create policy "update challenges host" on challenges for update using (
  created_by = auth.uid()
);

alter table member_integrations enable row level security;
alter table analytics_events enable row level security;

drop policy if exists "own integrations" on member_integrations;
create policy "own integrations" on member_integrations for all using (user_id = auth.uid());

drop policy if exists "insert analytics" on analytics_events;
drop policy if exists "read analytics" on analytics_events;
create policy "insert analytics" on analytics_events for insert with check (true);
create policy "read analytics" on analytics_events for select using (false);

-- Storage: require auth for uploads
drop policy if exists "auth upload proofs" on storage.objects;
create policy "auth upload proofs" on storage.objects for insert
  with check (bucket_id = 'proofs' and auth.role() = 'authenticated');

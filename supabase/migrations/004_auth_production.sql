-- 004_auth_production.sql - profiles, strict RLS, membership uniqueness
-- Run after 003_ship.sql

-- ---------------------------------------------------------------------------
-- Profiles (one row per auth.users)
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

drop policy if exists "read profiles" on profiles;
drop policy if exists "update own profile" on profiles;
drop policy if exists "insert own profile" on profiles;

create policy "read profiles" on profiles for select using (true);
create policy "insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "update own profile" on profiles for update using (auth.uid() = id);

create index if not exists idx_profiles_display_name on profiles(display_name);

-- Auto-create profile on sign-up / OAuth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
      nullif(trim(new.raw_user_meta_data->>'name'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), '')
    ),
    nullif(trim(new.raw_user_meta_data->>'avatar_url'), '')
  )
  on conflict (id) do update set
    email = coalesce(excluded.email, profiles.email),
    display_name = coalesce(profiles.display_name, excluded.display_name),
    avatar_url = coalesce(profiles.avatar_url, excluded.avatar_url),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for users that already exist
insert into public.profiles (id, email, display_name, avatar_url)
select
  u.id,
  u.email,
  coalesce(
    nullif(trim(u.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(u.raw_user_meta_data->>'name'), ''),
    nullif(split_part(coalesce(u.email, ''), '@', 1), '')
  ),
  nullif(trim(u.raw_user_meta_data->>'avatar_url'), '')
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Membership integrity: one account per challenge
-- ---------------------------------------------------------------------------
create unique index if not exists idx_members_challenge_user
  on members (challenge_id, user_id)
  where user_id is not null;

create index if not exists idx_members_user_id on members(user_id);
create index if not exists idx_challenges_created_by on challenges(created_by);

-- ---------------------------------------------------------------------------
-- RLS: production write rules (reads stay public for invite links)
-- ---------------------------------------------------------------------------

-- Challenges
drop policy if exists "insert challenges" on challenges;
create policy "insert challenges authenticated" on challenges
  for insert with check (
    auth.uid() is not null
    and created_by = auth.uid()
  );

-- Members
drop policy if exists "insert members" on members;
create policy "insert own membership" on members
  for insert with check (
    auth.uid() is not null
    and user_id = auth.uid()
  );

drop policy if exists "update own membership" on members;
create policy "update own membership" on members
  for update using (auth.uid() = user_id);

-- Logs
drop policy if exists "insert logs" on logs;
create policy "insert own logs" on logs
  for insert with check (
    exists (
      select 1 from members m
      where m.id = logs.member_id
        and m.user_id = auth.uid()
    )
  );

-- Flags: must be authenticated
drop policy if exists "insert flags" on flags;
create policy "insert flags authenticated" on flags
  for insert with check (auth.uid() = flagged_by);

-- ---------------------------------------------------------------------------
-- Helper: recent logs for a user (used by /me)
-- ---------------------------------------------------------------------------
create or replace view user_recent_logs as
select
  l.id as log_id,
  l.amount,
  l.note,
  l.logged_on,
  l.created_at,
  m.user_id,
  m.display_name,
  c.id as challenge_id,
  c.slug as challenge_slug,
  c.name as challenge_name,
  c.unit as challenge_unit
from logs l
join members m on m.id = l.member_id
join challenges c on c.id = l.challenge_id
where coalesce(l.hidden, false) = false
  and m.user_id is not null;

grant select on user_recent_logs to authenticated, anon;

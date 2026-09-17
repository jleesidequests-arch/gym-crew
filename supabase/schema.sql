-- Gym Crew schema. Paste this whole file into the Supabase SQL editor and run it once.

create extension if not exists pgcrypto;

-- One row per signed-up user, keyed to Supabase's built-in auth.users.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);

-- A friend group ("crew"). Anyone can create one; others join with the invite code.
create table if not exists public.crews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique,
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Membership: who belongs to which crew.
create table if not exists public.crew_members (
  crew_id uuid not null references public.crews (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (crew_id, user_id)
);

-- One row per "I did this" tap.
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  crew_id uuid not null references public.crews (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  activity text not null default 'Activity',
  logged_at timestamptz not null default now()
);

create index if not exists activity_logs_crew_time_idx on public.activity_logs (crew_id, logged_at desc);
create index if not exists activity_logs_user_time_idx on public.activity_logs (user_id, logged_at desc);
create index if not exists crew_members_user_idx on public.crew_members (user_id);

-- Row Level Security: every table is private by default; these policies open exactly
-- what the app needs, scoped to crews you actually belong to.

alter table public.profiles enable row level security;
alter table public.crews enable row level security;
alter table public.crew_members enable row level security;
alter table public.activity_logs enable row level security;

-- profiles: names/initials aren't sensitive, so any signed-in user can read them
-- (needed to show crewmates' names on the leaderboard); you can only write your own.
create policy "profiles are readable by any signed-in user"
  on public.profiles for select
  to authenticated
  using (true);

create policy "users insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "users update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- crews: readable by any signed-in user so a join-by-code lookup works before you're a member.
create policy "crews are readable by any signed-in user"
  on public.crews for select
  to authenticated
  using (true);

create policy "users create crews as themselves"
  on public.crews for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "crew creator can rename their crew"
  on public.crews for update
  to authenticated
  using (auth.uid() = created_by);

-- A policy on crew_members that queries crew_members itself (to check "am I in this
-- crew?") makes Postgres re-evaluate that same policy recursively. This helper runs
-- as its (table-owning) definer, which bypasses RLS, so the membership check inside
-- it doesn't re-trigger the policy that's calling it.
create or replace function public.is_crew_member(target_crew_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.crew_members
    where crew_id = target_crew_id and user_id = auth.uid()
  );
$$;

-- crew_members: you can see membership rows for crews you're in, join yourself to a crew,
-- and leave a crew, but never add or remove anyone else.
create policy "members see rosters of their own crews"
  on public.crew_members for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_crew_member(crew_id)
  );

create policy "users join a crew as themselves"
  on public.crew_members for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "users can leave a crew"
  on public.crew_members for delete
  to authenticated
  using (user_id = auth.uid());

-- activity_logs: only visible/writable within crews you belong to, and only as yourself.
create policy "members read logs of their own crews"
  on public.activity_logs for select
  to authenticated
  using (public.is_crew_member(crew_id));

create policy "members log activity as themselves"
  on public.activity_logs for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.is_crew_member(crew_id)
  );

-- Turn on realtime so the leaderboard updates live when a crewmate logs something.
alter publication supabase_realtime add table public.activity_logs;

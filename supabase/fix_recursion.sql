-- Run this once in the Supabase SQL editor to fix "infinite recursion detected in
-- policy for relation crew_members". Safe to run even if you already ran schema.sql.

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

drop policy if exists "members see rosters of their own crews" on public.crew_members;
create policy "members see rosters of their own crews"
  on public.crew_members for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_crew_member(crew_id)
  );

drop policy if exists "members read logs of their own crews" on public.activity_logs;
create policy "members read logs of their own crews"
  on public.activity_logs for select
  to authenticated
  using (public.is_crew_member(crew_id));

drop policy if exists "members log activity as themselves" on public.activity_logs;
create policy "members log activity as themselves"
  on public.activity_logs for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.is_crew_member(crew_id)
  );

-- ChamaConnect Supabase schema
-- Run this in the Supabase SQL Editor after creating your project.
--
-- Supabase Auth dashboard settings you still need to enter manually:
-- Authentication -> URL Configuration -> Site URL
--   Local example: http://127.0.0.1:5500
--   Local example: http://localhost:5500
--   Production example: https://yourdomain.com
--
-- Authentication -> URL Configuration -> Redirect URLs
--   http://127.0.0.1:5500/auth.html
--   http://localhost:5500/auth.html
--   https://yourdomain.com/auth.html
--
-- This schema is intended for email/password and Google OAuth authentication.
-- Magic link auth is not part of this setup.
--
-- If you use Google OAuth:
-- 1. In Supabase -> Authentication -> URL Configuration, add your auth page URL above.
-- 2. In Google Cloud OAuth, add your Supabase callback URL as an Authorized redirect URI:
--    https://dzhdwbjmilmbnqobzvwx.supabase.co/auth/v1/callback

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  first_name text,
  last_name text,
  full_name text,
  role text,
  phone_number text,
  group_name text,
  group_type text check (group_type in (
    'sacco',
    'rosca',
    'table_banking',
    'women_group'
  )),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles
  add column if not exists email text,
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists full_name text,
  add column if not exists role text,
  add column if not exists phone_number text,
  add column if not exists group_name text,
  add column if not exists group_type text,
  add column if not exists created_at timestamptz not null default timezone('utc', now()),
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

update public.profiles
set group_type = case group_type
  when 'SACCOs' then 'sacco'
  when 'SACCO' then 'sacco'
  when 'Rotating savings (ROSCA)' then 'rosca'
  when 'Rotating Savings (ROSCA)' then 'rosca'
  when 'Table Banking' then 'table_banking'
  when 'Women-led chamas' then 'women_group'
  when 'Women-led Group' then 'women_group'
  else group_type
end
where group_type in (
  'SACCOs',
  'SACCO',
  'Rotating savings (ROSCA)',
  'Rotating Savings (ROSCA)',
  'Table Banking',
  'Women-led chamas',
  'Women-led Group'
);

update public.profiles
set group_type = null
where group_type is not null
  and group_type not in ('sacco', 'rosca', 'table_banking', 'women_group');

alter table public.profiles
drop constraint if exists profiles_group_type_check;

alter table public.profiles
add constraint profiles_group_type_check check (group_type in (
  'sacco',
  'rosca',
  'table_banking',
  'women_group'
));

create table if not exists public.chamas (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'My Chama',
  group_type text not null check (group_type in (
    'sacco',
    'rosca',
    'table_banking',
    'women_group'
  )),
  created_by uuid references auth.users (id) on delete set null,
  member_count integer not null default 0,
  fixed_contribution numeric(12, 2) not null default 0,
  available_funds numeric(12, 2) not null default 0,
  chairman_password_hash text,
  chairman_password_changed_at timestamptz,
  rotation_order uuid[] not null default '{}'::uuid[],
  current_cycle_index integer not null default 0,
  trust_score integer,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.chamas
  add column if not exists name text not null default 'My Chama',
  add column if not exists group_type text,
  add column if not exists created_by uuid references auth.users (id) on delete set null,
  add column if not exists member_count integer not null default 0,
  add column if not exists fixed_contribution numeric(12, 2) not null default 0,
  add column if not exists available_funds numeric(12, 2) not null default 0,
  add column if not exists chairman_password_hash text,
  add column if not exists chairman_password_changed_at timestamptz,
  add column if not exists rotation_order uuid[] not null default '{}'::uuid[],
  add column if not exists current_cycle_index integer not null default 0,
  add column if not exists trust_score integer,
  add column if not exists created_at timestamptz not null default timezone('utc', now()),
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

update public.chamas
set group_type = case group_type
  when 'SACCOs' then 'sacco'
  when 'SACCO' then 'sacco'
  when 'Rotating savings (ROSCA)' then 'rosca'
  when 'Rotating Savings (ROSCA)' then 'rosca'
  when 'Table Banking' then 'table_banking'
  when 'Women-led chamas' then 'women_group'
  when 'Women-led Group' then 'women_group'
  else group_type
end
where group_type in (
  'SACCOs',
  'SACCO',
  'Rotating savings (ROSCA)',
  'Rotating Savings (ROSCA)',
  'Table Banking',
  'Women-led chamas',
  'Women-led Group'
);

update public.chamas
set group_type = 'sacco'
where group_type is null
   or group_type not in ('sacco', 'rosca', 'table_banking', 'women_group');

update public.chamas
set chairman_password_hash = extensions.crypt('password123', extensions.gen_salt('bf'))
where chairman_password_hash is null;

alter table public.chamas
drop constraint if exists chamas_group_type_check;

alter table public.chamas
add constraint chamas_group_type_check check (group_type in (
  'sacco',
  'rosca',
  'table_banking',
  'women_group'
));

drop index if exists public.chamas_name_lower_unique_idx;

create unique index if not exists chamas_name_group_type_unique_idx
on public.chamas (lower(name), group_type);

alter table public.chamas enable row level security;

create table if not exists public.join_requests (
  id uuid primary key default gen_random_uuid(),
  chama_id uuid references public.chamas (id) on delete cascade,
  requester_id uuid references auth.users (id) on delete set null,
  full_name text not null,
  phone_number text not null,
  requested_role text not null default 'Member',
  referral_name text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.join_requests
  add column if not exists chama_id uuid references public.chamas (id) on delete cascade,
  add column if not exists requester_id uuid references auth.users (id) on delete set null,
  add column if not exists full_name text,
  add column if not exists phone_number text,
  add column if not exists requested_role text not null default 'Member',
  add column if not exists referral_name text,
  add column if not exists status text not null default 'pending',
  add column if not exists reviewed_by uuid references auth.users (id) on delete set null,
  add column if not exists reviewed_at timestamptz,
  add column if not exists created_at timestamptz not null default timezone('utc', now()),
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

alter table public.join_requests
drop constraint if exists join_requests_status_check;

alter table public.join_requests
add constraint join_requests_status_check check (status in ('pending', 'approved', 'rejected'));

alter table public.join_requests enable row level security;

create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  chama_id uuid not null references public.chamas (id) on delete cascade,
  meeting_date date not null,
  attendance uuid[] not null default '{}'::uuid[],
  contributions jsonb not null default '[]'::jsonb,
  loans_issued jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.meetings
  add column if not exists chama_id uuid references public.chamas (id) on delete cascade,
  add column if not exists meeting_date date,
  add column if not exists attendance uuid[] not null default '{}'::uuid[],
  add column if not exists contributions jsonb not null default '[]'::jsonb,
  add column if not exists loans_issued jsonb not null default '[]'::jsonb,
  add column if not exists notes text,
  add column if not exists created_at timestamptz not null default timezone('utc', now()),
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

alter table public.meetings enable row level security;

alter table public.profiles enable row level security;

create or replace function public.verify_chairman_password(
  target_group_name text,
  target_group_type text,
  plain_password text
)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.chamas
    where lower(name) = lower(target_group_name)
      and group_type = target_group_type
      and chairman_password_hash = extensions.crypt(plain_password, chairman_password_hash)
  );
$$;

create or replace function public.change_chairman_password(
  target_group_name text,
  target_group_type text,
  new_password text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and lower(role) = 'chairman'
      and lower(group_name) = lower(target_group_name)
      and group_type = target_group_type
  ) then
    raise exception 'Only the chairman of this group can change the chairman password.';
  end if;

  update public.chamas
  set
    chairman_password_hash = extensions.crypt(new_password, extensions.gen_salt('bf')),
    chairman_password_changed_at = timezone('utc', now()),
    updated_at = timezone('utc', now())
  where lower(name) = lower(target_group_name)
    and group_type = target_group_type;

  if not found then
    raise exception 'Group not found.';
  end if;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    first_name,
    last_name,
    full_name,
    role,
    phone_number,
    group_name,
    group_type
  )
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'role',
    new.raw_user_meta_data ->> 'phone_number',
    new.raw_user_meta_data ->> 'group_name',
    new.raw_user_meta_data ->> 'group_type'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    full_name = excluded.full_name,
    role = excluded.role,
    phone_number = excluded.phone_number,
    group_name = excluded.group_name,
    group_type = excluded.group_type,
    updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

drop trigger if exists set_profiles_updated_at on public.profiles;

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_chamas_updated_at on public.chamas;

drop trigger if exists set_join_requests_updated_at on public.join_requests;

create trigger set_join_requests_updated_at
before update on public.join_requests
for each row
execute procedure public.set_updated_at();

create trigger set_chamas_updated_at
before update on public.chamas
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_meetings_updated_at on public.meetings;

create trigger set_meetings_updated_at
before update on public.meetings
for each row
execute procedure public.set_updated_at();

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Authenticated users can view chamas" on public.chamas;
create policy "Authenticated users can view chamas"
on public.chamas
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can create chamas" on public.chamas;
create policy "Authenticated users can create chamas"
on public.chamas
for insert
to authenticated
with check (auth.uid() = created_by);

drop policy if exists "Creators can update chamas" on public.chamas;
create policy "Creators can update chamas"
on public.chamas
for update
to authenticated
using (auth.uid() = created_by)
with check (auth.uid() = created_by);

drop policy if exists "Authenticated users can view join requests" on public.join_requests;
create policy "Authenticated users can view join requests"
on public.join_requests
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can create join requests" on public.join_requests;
create policy "Authenticated users can create join requests"
on public.join_requests
for insert
to authenticated
with check (
  requester_id is null
  or auth.uid() = requester_id
);

drop policy if exists "Chama creators can review join requests" on public.join_requests;
create policy "Chama creators can review join requests"
on public.join_requests
for update
to authenticated
using (
  exists (
    select 1
    from public.chamas
    where chamas.id = join_requests.chama_id
      and chamas.created_by = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.chamas
    where chamas.id = join_requests.chama_id
      and chamas.created_by = auth.uid()
  )
);

drop policy if exists "Authenticated users can view meetings" on public.meetings;
create policy "Authenticated users can view meetings"
on public.meetings
for select
to authenticated
using (true);

drop policy if exists "Creators can insert meetings" on public.meetings;
create policy "Creators can insert meetings"
on public.meetings
for insert
to authenticated
with check (
  exists (
    select 1
    from public.chamas
    where chamas.id = meetings.chama_id
      and chamas.created_by = auth.uid()
  )
);

drop policy if exists "Creators can update meetings" on public.meetings;
create policy "Creators can update meetings"
on public.meetings
for update
to authenticated
using (
  exists (
    select 1
    from public.chamas
    where chamas.id = meetings.chama_id
      and chamas.created_by = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.chamas
    where chamas.id = meetings.chama_id
      and chamas.created_by = auth.uid()
  )
);

drop view if exists public.profile_summaries;

create view public.profile_summaries as
select
  id,
  email,
  full_name,
  role,
  phone_number,
  group_name,
  group_type,
  created_at
from public.profiles;

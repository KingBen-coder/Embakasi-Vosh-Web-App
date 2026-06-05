create extension if not exists "pgcrypto";

create type public.member_role as enum ('member', 'leader', 'admin');
create type public.payment_status as enum ('pending', 'successful', 'failed', 'cancelled');
create type public.payment_category as enum ('tithe', 'offering', 'building_fund', 'missions', 'event');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text unique,
  role public.member_role not null default 'member',
  ministry text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sermons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  preacher text,
  bible_reference text,
  sermon_date date,
  video_url text,
  audio_url text,
  thumbnail_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  registration_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  category public.payment_category not null,
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null default 'KES',
  phone text,
  provider text not null default 'mpesa',
  provider_reference text,
  checkout_request_id text,
  status public.payment_status not null default 'pending',
  raw_callback jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.prayer_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text,
  request text not null,
  is_anonymous boolean not null default false,
  is_reviewed boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.ministries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  leader_name text,
  contact_phone text,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.sermons enable row level security;
alter table public.events enable row level security;
alter table public.payments enable row level security;
alter table public.prayer_requests enable row level security;
alter table public.ministries enable row level security;
alter table public.audit_logs enable row level security;

create policy "Members can read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Members can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Published sermons are public"
  on public.sermons for select
  using (is_published = true);

create policy "Published events are public"
  on public.events for select
  using (is_published = true);

create policy "Published ministries are public"
  on public.ministries for select
  using (is_published = true);

create policy "Members can read their own payments"
  on public.payments for select
  using (auth.uid() = user_id);

create policy "Members can submit prayer requests"
  on public.prayer_requests for insert
  with check (auth.uid() = user_id or user_id is null);

create policy "Members can read their own prayer requests"
  on public.prayer_requests for select
  using (auth.uid() = user_id);

create policy "Members can read their own audit logs"
  on public.audit_logs for select
  using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.phone
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

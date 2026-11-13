create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  age smallint check (age between 16 and 100),
  height_cm smallint check (height_cm between 120 and 230),
  weight_kg numeric(5,2) check (weight_kg between 35 and 250),
  goal text not null default 'muscle' check (goal in ('muscle','fat-loss','maintain','strength','fitness')),
  level text not null default 'Beginner' check (level in ('Beginner','Intermediate','Advanced')),
  place text not null default 'GYM' check (place in ('HOME','GYM')),
  training_days smallint not null default 3 check (training_days between 2 and 6),
  sex text not null default 'male' check (sex in ('male','female')),
  updated_at timestamptz not null default now()
);

create table if not exists public.coach_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','coach')),
  content text not null check (char_length(content) between 1 and 6000),
  created_at timestamptz not null default now()
);
create index if not exists coach_messages_user_created_idx on public.coach_messages(user_id, created_at desc);

create table if not exists public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  plan jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists workout_plans_user_updated_idx on public.workout_plans(user_id, updated_at desc);

create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise text not null,
  sets integer not null default 0 check (sets between 0 and 100),
  reps integer not null default 0 check (reps between 0 and 10000),
  weight numeric(7,2) not null default 0 check (weight between 0 and 1000),
  completed_at timestamptz not null default now()
);
create index if not exists workout_sessions_user_completed_idx on public.workout_sessions(user_id, completed_at desc);

create table if not exists public.body_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  weight_kg numeric(5,2) not null check (weight_kg between 25 and 400),
  recorded_at timestamptz not null default now()
);
create index if not exists body_metrics_user_recorded_idx on public.body_metrics(user_id, recorded_at desc);

alter table public.profiles enable row level security;
alter table public.coach_messages enable row level security;
alter table public.workout_plans enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.body_metrics enable row level security;

drop policy if exists "profiles owner access" on public.profiles;
create policy "profiles owner access" on public.profiles for all to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
drop policy if exists "messages owner access" on public.coach_messages;
create policy "messages owner access" on public.coach_messages for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "plans owner access" on public.workout_plans;
create policy "plans owner access" on public.workout_plans for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "sessions owner access" on public.workout_sessions;
create policy "sessions owner access" on public.workout_sessions for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "metrics owner access" on public.body_metrics;
create policy "metrics owner access" on public.body_metrics for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Keep profile rows private; clients create/update their own row after sign-up.

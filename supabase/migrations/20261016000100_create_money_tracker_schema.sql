-- Private, per-user financial records. No service-role access is required by the app.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  currency_code text not null default 'PHP' check (currency_code ~ '^[A-Z]{3}$'),
  timezone text not null default 'Asia/Manila' check (char_length(timezone) between 1 and 64),
  cutoff_day_one smallint not null default 15 check (cutoff_day_one between 1 and 31),
  cutoff_day_two smallint not null default 31 check (cutoff_day_two between 1 and 31 and cutoff_day_two > cutoff_day_one),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.funding_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  kind text not null default 'other' check (kind in ('bank', 'card', 'wallet', 'cash', 'other')),
  color text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, id)
);

create table public.cutoff_income (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  cutoff_date date not null,
  planned_amount_minor bigint not null check (planned_amount_minor >= 0),
  actual_amount_minor bigint not null default 0 check (actual_amount_minor >= 0),
  note text check (note is null or char_length(note) <= 240),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, cutoff_date),
  unique (user_id, id)
);

create table public.obligations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  funding_source_id uuid not null,
  name text not null check (char_length(btrim(name)) between 1 and 100),
  kind text not null check (kind in ('installment', 'recurring')),
  amount_minor bigint not null check (amount_minor > 0),
  cadence text not null default 'monthly' check (cadence in ('monthly')),
  first_due_date date not null,
  last_due_date date,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, id),
  check (last_due_date is null or last_due_date >= first_due_date),
  constraint obligations_source_same_owner
    foreign key (user_id, funding_source_id)
    references public.funding_sources (user_id, id)
    on delete cascade
);

create table public.payment_occurrences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  obligation_id uuid not null,
  due_date date not null,
  funding_cutoff_date date not null,
  amount_minor bigint not null check (amount_minor > 0),
  status text not null default 'planned' check (status in ('planned', 'paid', 'skipped')),
  paid_at timestamptz,
  note text check (note is null or char_length(note) <= 240),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (obligation_id, due_date),
  unique (user_id, id),
  check ((status = 'paid') = (paid_at is not null)),
  constraint occurrences_obligation_same_owner
    foreign key (user_id, obligation_id)
    references public.obligations (user_id, id)
    on delete cascade
);

create table public.cutoff_savings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  cutoff_date date not null,
  planned_amount_minor bigint not null default 0 check (planned_amount_minor >= 0),
  actual_amount_minor bigint not null default 0 check (actual_amount_minor >= 0),
  note text check (note is null or char_length(note) <= 240),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, cutoff_date),
  unique (user_id, id)
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  expense_date date not null,
  amount_minor bigint not null check (amount_minor > 0),
  category text not null check (char_length(btrim(category)) between 1 and 48),
  funding_source_id uuid,
  note text check (note is null or char_length(note) <= 240),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, id),
  constraint expenses_source_same_owner
    foreign key (user_id, funding_source_id)
    references public.funding_sources (user_id, id)
    on delete set null (funding_source_id)
);

create index funding_sources_user_active_idx on public.funding_sources (user_id, archived_at);
create index cutoff_income_user_date_idx on public.cutoff_income (user_id, cutoff_date);
create index obligations_user_active_idx on public.obligations (user_id, active, first_due_date);
create index occurrences_user_funding_cutoff_idx on public.payment_occurrences (user_id, funding_cutoff_date);
create index occurrences_user_due_date_idx on public.payment_occurrences (user_id, due_date);
create index cutoff_savings_user_date_idx on public.cutoff_savings (user_id, cutoff_date);
create index expenses_user_date_idx on public.expenses (user_id, expense_date desc);

alter table public.profiles enable row level security;
alter table public.funding_sources enable row level security;
alter table public.cutoff_income enable row level security;
alter table public.obligations enable row level security;
alter table public.payment_occurrences enable row level security;
alter table public.cutoff_savings enable row level security;
alter table public.expenses enable row level security;

alter table public.profiles force row level security;
alter table public.funding_sources force row level security;
alter table public.cutoff_income force row level security;
alter table public.obligations force row level security;
alter table public.payment_occurrences force row level security;
alter table public.cutoff_savings force row level security;
alter table public.expenses force row level security;

-- Exposed tables are reachable only by signed-in users, and every row is owner-scoped.
revoke all on public.profiles, public.funding_sources, public.cutoff_income,
  public.obligations, public.payment_occurrences, public.cutoff_savings,
  public.expenses from public, anon, service_role;
grant select, insert, update, delete on public.profiles, public.funding_sources,
  public.cutoff_income, public.obligations, public.payment_occurrences,
  public.cutoff_savings, public.expenses to authenticated;

create policy profiles_select_own on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy profiles_insert_own on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles
  for update to authenticated using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
create policy profiles_delete_own on public.profiles
  for delete to authenticated using ((select auth.uid()) = id);

create policy funding_sources_select_own on public.funding_sources
  for select to authenticated using ((select auth.uid()) = user_id);
create policy funding_sources_insert_own on public.funding_sources
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy funding_sources_update_own on public.funding_sources
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy funding_sources_delete_own on public.funding_sources
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy cutoff_income_select_own on public.cutoff_income
  for select to authenticated using ((select auth.uid()) = user_id);
create policy cutoff_income_insert_own on public.cutoff_income
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy cutoff_income_update_own on public.cutoff_income
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy cutoff_income_delete_own on public.cutoff_income
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy obligations_select_own on public.obligations
  for select to authenticated using ((select auth.uid()) = user_id);
create policy obligations_insert_own on public.obligations
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy obligations_update_own on public.obligations
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy obligations_delete_own on public.obligations
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy occurrences_select_own on public.payment_occurrences
  for select to authenticated using ((select auth.uid()) = user_id);
create policy occurrences_insert_own on public.payment_occurrences
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy occurrences_update_own on public.payment_occurrences
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy occurrences_delete_own on public.payment_occurrences
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy cutoff_savings_select_own on public.cutoff_savings
  for select to authenticated using ((select auth.uid()) = user_id);
create policy cutoff_savings_insert_own on public.cutoff_savings
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy cutoff_savings_update_own on public.cutoff_savings
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy cutoff_savings_delete_own on public.cutoff_savings
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy expenses_select_own on public.expenses
  for select to authenticated using ((select auth.uid()) = user_id);
create policy expenses_insert_own on public.expenses
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy expenses_update_own on public.expenses
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy expenses_delete_own on public.expenses
  for delete to authenticated using ((select auth.uid()) = user_id);

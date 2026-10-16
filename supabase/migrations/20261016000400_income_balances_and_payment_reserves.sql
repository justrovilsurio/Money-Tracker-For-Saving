-- Record income once, track manual account balances, and allow one payment
-- to reserve money across both monthly cutoffs.

alter table public.profiles alter column cutoff_day_two set default 30;
-- Existing profiles only have the previous hard-coded 31st default (there is
-- no settings UI yet), so align them with the requested 15th/30th schedule.
update public.profiles set cutoff_day_two = 30 where cutoff_day_two = 31 and cutoff_day_one < 30;
update public.cutoff_income ci
set cutoff_date = (date_trunc('month', ci.cutoff_date) + interval '29 days')::date
from public.profiles p
where p.id = ci.user_id
  and p.cutoff_day_two = 30
  and extract(day from ci.cutoff_date)::integer = 31
  and not exists (
    select 1 from public.cutoff_income existing
    where existing.user_id = ci.user_id
      and existing.cutoff_date = (date_trunc('month', ci.cutoff_date) + interval '29 days')::date
  );

alter table public.funding_sources
  drop constraint funding_sources_kind_check;
alter table public.funding_sources
  add constraint funding_sources_kind_check
  check (kind in ('bank', 'card', 'loan', 'wallet', 'cash', 'other'));
alter table public.funding_sources
  add column credit_limit_minor bigint,
  add column current_balance_minor bigint not null default 0 check (current_balance_minor >= 0),
  add column payment_due_day smallint check (payment_due_day between 1 and 31),
  add constraint funding_sources_credit_limit_nonnegative
    check (credit_limit_minor is null or credit_limit_minor >= 0);

alter table public.cutoff_income
  add column income_amount_minor bigint not null default 0 check (income_amount_minor >= 0);
update public.cutoff_income
  set income_amount_minor = case
    when actual_amount_minor > 0 then actual_amount_minor
    else planned_amount_minor
  end;

create table public.payment_reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  payment_occurrence_id uuid not null,
  cutoff_date date not null,
  amount_minor bigint not null check (amount_minor >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (payment_occurrence_id, cutoff_date),
  constraint reservations_occurrence_same_owner
    foreign key (user_id, payment_occurrence_id)
    references public.payment_occurrences (user_id, id) on delete cascade
);
create index payment_reservations_user_cutoff_idx
  on public.payment_reservations (user_id, cutoff_date);
create index payment_reservations_occurrence_idx
  on public.payment_reservations (payment_occurrence_id);

alter table public.payment_reservations enable row level security;
alter table public.payment_reservations force row level security;
revoke all on public.payment_reservations from public, anon, service_role;
grant select, insert, update, delete on public.payment_reservations to authenticated;
create policy payment_reservations_select_own on public.payment_reservations
  for select to authenticated using ((select auth.uid()) = user_id);
create policy payment_reservations_insert_own on public.payment_reservations
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy payment_reservations_update_own on public.payment_reservations
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy payment_reservations_delete_own on public.payment_reservations
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Preserve existing scheduled funding assignments.
with schedule_dates as (
  select po.user_id, po.id as occurrence_id, po.funding_cutoff_date, po.amount_minor, po.due_date,
    date_trunc('month', po.due_date)::date as month_start,
    (date_trunc('month', po.due_date) + interval '1 month - 1 day')::date as month_end,
    coalesce(p.cutoff_day_one, 15) as cutoff_one_day,
    coalesce(p.cutoff_day_two, 30) as cutoff_two_day
  from public.payment_occurrences po
  left join public.profiles p on p.id = po.user_id
), allocations as (
  select user_id, occurrence_id, funding_cutoff_date as cutoff_date, amount_minor
  from schedule_dates
  where not (
    (due_date = month_start + least(cutoff_two_day, extract(day from month_end)::integer) - 1
      or extract(day from due_date)::integer = 30 or due_date = month_end)
    and month_start + least(cutoff_one_day, extract(day from month_end)::integer) - 1
      < month_start + least(cutoff_two_day, extract(day from month_end)::integer) - 1
  )
  union all
  select user_id, occurrence_id,
    month_start + least(cutoff_one_day, extract(day from month_end)::integer) - 1,
    amount_minor / 2
  from schedule_dates
  where (due_date = month_start + least(cutoff_two_day, extract(day from month_end)::integer) - 1
    or extract(day from due_date)::integer = 30 or due_date = month_end)
    and month_start + least(cutoff_one_day, extract(day from month_end)::integer) - 1
    < month_start + least(cutoff_two_day, extract(day from month_end)::integer) - 1
  union all
  select user_id, occurrence_id,
    month_start + least(cutoff_two_day, extract(day from month_end)::integer) - 1,
    amount_minor - (amount_minor / 2)
  from schedule_dates
  where (due_date = month_start + least(cutoff_two_day, extract(day from month_end)::integer) - 1
      or extract(day from due_date)::integer = 30 or due_date = month_end)
    and month_start + least(cutoff_one_day, extract(day from month_end)::integer) - 1
      < month_start + least(cutoff_two_day, extract(day from month_end)::integer) - 1
)
insert into public.payment_reservations (user_id, payment_occurrence_id, cutoff_date, amount_minor)
select user_id, occurrence_id, cutoff_date, amount_minor from allocations
on conflict (payment_occurrence_id, cutoff_date) do nothing;

drop function public.create_obligation_schedule(uuid, text, text, bigint, date, date);

create function public.create_obligation_schedule(
  p_funding_source_id uuid,
  p_name text,
  p_kind text,
  p_amount_minor bigint,
  p_first_due_date date,
  p_last_due_date date default null,
  p_payment_due_day smallint default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_cutoff_day_one integer := 15;
  v_cutoff_day_two integer := 30;
  v_obligation_id uuid;
  v_occurrence_id uuid;
  v_schedule_end date;
  v_anchor_day integer;
  v_month_index integer := 0;
  v_month_start date;
  v_month_end date;
  v_previous_month_start date;
  v_previous_month_end date;
  v_due_date date;
  v_cutoff_one date;
  v_cutoff_two date;
  v_funding_cutoff date;
  v_split_reserve boolean;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'Authentication required';
  end if;
  if p_funding_source_id is null or p_name is null
    or char_length(btrim(p_name)) not between 1 and 100
    or p_kind not in ('installment', 'recurring')
    or p_amount_minor is null or p_amount_minor <= 0
    or p_first_due_date is null
    or (p_payment_due_day is not null and p_payment_due_day not between 1 and 31) then
    raise exception using errcode = '22023', message = 'Invalid obligation details';
  end if;
  if p_last_due_date is not null and p_last_due_date < p_first_due_date then
    raise exception using errcode = '22023', message = 'End date must not precede first due date';
  end if;
  if p_kind = 'installment' and p_last_due_date is null then
    raise exception using errcode = '22023', message = 'Installments require an end date';
  end if;
  if p_last_due_date is not null and p_last_due_date > (p_first_due_date + interval '600 months')::date then
    raise exception using errcode = '22023', message = 'Schedule cannot exceed 600 months';
  end if;

  select cutoff_day_one, cutoff_day_two into v_cutoff_day_one, v_cutoff_day_two
  from public.profiles where id = v_user_id;
  if not found then
    v_cutoff_day_one := 15;
    v_cutoff_day_two := 30;
  end if;

  insert into public.obligations (
    user_id, funding_source_id, name, kind, amount_minor,
    cadence, first_due_date, last_due_date
  ) values (
    v_user_id, p_funding_source_id, btrim(p_name), p_kind, p_amount_minor,
    'monthly', p_first_due_date, p_last_due_date
  ) returning id into v_obligation_id;

  v_anchor_day := coalesce(p_payment_due_day, extract(day from p_first_due_date)::integer);
  v_schedule_end := coalesce(
    p_last_due_date,
    (date_trunc('month', p_first_due_date) + interval '23 months - 1 day')::date
  );
  v_due_date := p_first_due_date;
  loop
    exit when v_due_date > v_schedule_end;
    v_month_start := date_trunc('month', v_due_date)::date;
    v_month_end := (v_month_start + interval '1 month - 1 day')::date;
    v_cutoff_one := v_month_start + least(v_cutoff_day_one, extract(day from v_month_end)::integer) - 1;
    v_cutoff_two := v_month_start + least(v_cutoff_day_two, extract(day from v_month_end)::integer) - 1;
    v_funding_cutoff := null;

    if v_cutoff_one < v_due_date then v_funding_cutoff := v_cutoff_one; end if;
    if v_cutoff_two < v_due_date and (v_funding_cutoff is null or v_cutoff_two > v_funding_cutoff) then
      v_funding_cutoff := v_cutoff_two;
    end if;
    if v_funding_cutoff is null then
      v_previous_month_start := (v_month_start - interval '1 month')::date;
      v_previous_month_end := (v_month_start - interval '1 day')::date;
      v_funding_cutoff := v_previous_month_start
        + least(v_cutoff_day_two, extract(day from v_previous_month_end)::integer) - 1;
    end if;

    v_split_reserve := v_cutoff_one < v_cutoff_two and (v_due_date = v_cutoff_two
      or extract(day from v_due_date)::integer = 30
      or v_due_date = v_month_end);
    insert into public.payment_occurrences (
      user_id, obligation_id, due_date, funding_cutoff_date, amount_minor
    ) values (
      v_user_id, v_obligation_id, v_due_date, v_funding_cutoff, p_amount_minor
    ) returning id into v_occurrence_id;

    if v_split_reserve then
      insert into public.payment_reservations (
        user_id, payment_occurrence_id, cutoff_date, amount_minor
      ) values
        (v_user_id, v_occurrence_id, v_cutoff_one, p_amount_minor / 2),
        (v_user_id, v_occurrence_id, v_cutoff_two, p_amount_minor - (p_amount_minor / 2));
    else
      insert into public.payment_reservations (
        user_id, payment_occurrence_id, cutoff_date, amount_minor
      ) values (v_user_id, v_occurrence_id, v_funding_cutoff, p_amount_minor);
    end if;

    v_month_index := v_month_index + 1;
    v_month_start := (date_trunc('month', p_first_due_date) + make_interval(months => v_month_index))::date;
    v_month_end := (v_month_start + interval '1 month - 1 day')::date;
    v_due_date := v_month_start + least(v_anchor_day, extract(day from v_month_end)::integer) - 1;
  end loop;
  return v_obligation_id;
end;
$$;

-- Keep the statement amount and its cutoff allocations in sync as one write.
create function public.update_payment_occurrence_amount(
  p_occurrence_id uuid,
  p_amount_minor bigint
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_reservation_count integer;
  v_first_reservation_id uuid;
  v_second_reservation_id uuid;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'Authentication required';
  end if;
  if p_occurrence_id is null or p_amount_minor is null or p_amount_minor <= 0 then
    raise exception using errcode = '22023', message = 'Invalid payment amount';
  end if;

  update public.payment_occurrences
    set amount_minor = p_amount_minor, updated_at = now()
    where id = p_occurrence_id and user_id = v_user_id;
  if not found then
    raise exception using errcode = 'P0002', message = 'Payment not found';
  end if;

  select count(*) into v_reservation_count
    from public.payment_reservations
    where payment_occurrence_id = p_occurrence_id and user_id = v_user_id;
  if v_reservation_count not in (1, 2) then
    raise exception using errcode = '23514', message = 'Payment must have one or two cutoff reservations';
  end if;
  if v_reservation_count = 2 then
    select id into v_first_reservation_id
      from public.payment_reservations
      where payment_occurrence_id = p_occurrence_id and user_id = v_user_id
      order by cutoff_date asc limit 1;
    select id into v_second_reservation_id
      from public.payment_reservations
      where payment_occurrence_id = p_occurrence_id and user_id = v_user_id
      order by cutoff_date desc limit 1;
    update public.payment_reservations
      set amount_minor = p_amount_minor / 2, updated_at = now()
      where id = v_first_reservation_id;
    update public.payment_reservations
      set amount_minor = p_amount_minor - (p_amount_minor / 2), updated_at = now()
      where id = v_second_reservation_id;
  else
    update public.payment_reservations
      set amount_minor = p_amount_minor, updated_at = now()
      where payment_occurrence_id = p_occurrence_id and user_id = v_user_id;
  end if;
end;
$$;

revoke all on function public.create_obligation_schedule(uuid, text, text, bigint, date, date, smallint)
  from public, anon, authenticated;
grant execute on function public.create_obligation_schedule(uuid, text, text, bigint, date, date, smallint)
  to authenticated;

revoke all on function public.update_payment_occurrence_amount(uuid, bigint)
  from public, anon, authenticated;
grant execute on function public.update_payment_occurrence_amount(uuid, bigint)
  to authenticated;

notify pgrst, 'reload schema';

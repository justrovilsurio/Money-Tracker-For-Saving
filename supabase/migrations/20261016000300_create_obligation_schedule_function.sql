-- Create a bill/installment and its payment schedule in one transaction.
-- The owner always comes from the authenticated session, never client input.
create function public.create_obligation_schedule(
  p_funding_source_id uuid,
  p_name text,
  p_kind text,
  p_amount_minor bigint,
  p_first_due_date date,
  p_last_due_date date default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_cutoff_day_one integer := 15;
  v_cutoff_day_two integer := 31;
  v_obligation_id uuid;
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
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'Authentication required';
  end if;

  if p_funding_source_id is null
    or p_name is null
    or char_length(btrim(p_name)) not between 1 and 100
    or p_kind is null
    or p_kind not in ('installment', 'recurring')
    or p_amount_minor is null
    or p_amount_minor <= 0
    or p_first_due_date is null then
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

  select cutoff_day_one, cutoff_day_two
    into v_cutoff_day_one, v_cutoff_day_two
    from public.profiles
    where id = v_user_id;
  if not found then
    v_cutoff_day_one := 15;
    v_cutoff_day_two := 31;
  end if;

  insert into public.obligations (
    user_id, funding_source_id, name, kind, amount_minor,
    cadence, first_due_date, last_due_date
  ) values (
    v_user_id, p_funding_source_id, btrim(p_name), p_kind, p_amount_minor,
    'monthly', p_first_due_date, p_last_due_date
  ) returning id into v_obligation_id;

  v_anchor_day := extract(day from p_first_due_date)::integer;
  v_schedule_end := coalesce(
    p_last_due_date,
    (date_trunc('month', p_first_due_date) + interval '24 months - 1 day')::date
  );
  v_due_date := p_first_due_date;

  loop
    exit when v_due_date > v_schedule_end;

    v_month_start := date_trunc('month', v_due_date)::date;
    v_month_end := (v_month_start + interval '1 month - 1 day')::date;
    v_cutoff_one := v_month_start + least(v_cutoff_day_one, extract(day from v_month_end)::integer) - 1;
    v_cutoff_two := v_month_start + least(v_cutoff_day_two, extract(day from v_month_end)::integer) - 1;
    v_funding_cutoff := null;

    -- Reserve from the latest configured cutoff strictly before the due date.
    if v_cutoff_one < v_due_date then
      v_funding_cutoff := v_cutoff_one;
    end if;
    if v_cutoff_two < v_due_date and (v_funding_cutoff is null or v_cutoff_two > v_funding_cutoff) then
      v_funding_cutoff := v_cutoff_two;
    end if;
    if v_funding_cutoff is null then
      v_previous_month_start := (v_month_start - interval '1 month')::date;
      v_previous_month_end := (v_month_start - interval '1 day')::date;
      v_funding_cutoff := v_previous_month_start
        + least(v_cutoff_day_two, extract(day from v_previous_month_end)::integer) - 1;
    end if;

    insert into public.payment_occurrences (
      user_id, obligation_id, due_date, funding_cutoff_date, amount_minor
    ) values (
      v_user_id, v_obligation_id, v_due_date, v_funding_cutoff, p_amount_minor
    );

    v_month_index := v_month_index + 1;
    v_month_start := (date_trunc('month', p_first_due_date) + make_interval(months => v_month_index))::date;
    v_month_end := (v_month_start + interval '1 month - 1 day')::date;
    v_due_date := v_month_start
      + least(v_anchor_day, extract(day from v_month_end)::integer) - 1;
  end loop;

  return v_obligation_id;
end;
$$;

revoke all on function public.create_obligation_schedule(uuid, text, text, bigint, date, date)
  from public, anon, authenticated;
grant execute on function public.create_obligation_schedule(uuid, text, text, bigint, date, date)
  to authenticated;

notify pgrst, 'reload schema';

-- Store the next actual account payment due date instead of a bare day number.
-- Preserve each saved monthly day by mapping it to its next calendar occurrence.
alter table public.funding_sources
  add column payment_due_date date;

with due_dates as (
  select
    id,
    payment_due_day,
    date_trunc('month', current_date)::date as month_start,
    (date_trunc('month', current_date) + interval '1 month - 1 day')::date as month_end,
    (date_trunc('month', current_date) + interval '1 month')::date as next_month_start
  from public.funding_sources
  where payment_due_day is not null
)
update public.funding_sources fs
set payment_due_date = case
  when due_dates.month_start
    + least(due_dates.payment_due_day, extract(day from due_dates.month_end)::integer) - 1 >= current_date
  then due_dates.month_start
    + least(due_dates.payment_due_day, extract(day from due_dates.month_end)::integer) - 1
  else due_dates.next_month_start
    + least(
        due_dates.payment_due_day,
        extract(day from (due_dates.next_month_start + interval '1 month - 1 day'))::integer
      ) - 1
end
from due_dates
where fs.id = due_dates.id;

alter table public.funding_sources
  drop column payment_due_day;
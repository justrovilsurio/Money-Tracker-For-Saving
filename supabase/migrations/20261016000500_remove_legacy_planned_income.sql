-- Remove the obsolete planned-income field now that cutoff income is tracked once.
-- Existing values were copied into income_amount_minor by migration 004.
alter table public.cutoff_income
  drop column planned_amount_minor;
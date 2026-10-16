"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ObligationState = { error?: string; message?: string };

const paymentSchema = z.object({
  fundingSourceId: z.string().uuid(),
  name: z.string().trim().min(1).max(100),
  amount: z.string().regex(/^\d{1,9}(?:\.\d{1,2})?$/),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
}).strict();

function isRealDate(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function toMinorUnits(value: string) {
  const [whole, fraction = ""] = value.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

export async function createObligationAction(
  _previousState: ObligationState,
  formData: FormData,
): Promise<ObligationState> {
  const parsed = paymentSchema.safeParse({
    fundingSourceId: formData.get("fundingSourceId"),
    name: formData.get("name"),
    amount: formData.get("amount"),
    dueDate: formData.get("dueDate"),
  });
  if (!parsed.success) return { error: "Enter an account, payment name, amount and due date." };
  if (!isRealDate(parsed.data.dueDate)) return { error: "Enter a valid payment due date." };

  const amountMinor = toMinorUnits(parsed.data.amount);
  if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) {
    return { error: "Enter a payment amount above zero and below PHP 1,000,000,000." };
  }

  const { userId } = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data: source, error: sourceError } = await supabase.from("funding_sources")
    .select("id")
    .eq("id", parsed.data.fundingSourceId)
    .eq("user_id", userId)
    .is("archived_at", null)
    .maybeSingle();
  if (sourceError || !source) return { error: "Choose one of your active accounts." };

  // Store one occurrence only; recurring monthly bills must be added as separate payments.
  const { error } = await supabase.rpc("create_obligation_schedule", {
    p_funding_source_id: parsed.data.fundingSourceId,
    p_name: parsed.data.name,
    p_kind: "installment",
    p_amount_minor: amountMinor,
    p_first_due_date: parsed.data.dueDate,
    p_last_due_date: parsed.data.dueDate,
    p_payment_due_day: null,
  });

  if (error) return { error: "Could not save this payment. Confirm the latest Supabase migration is applied, then try again." };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/income");
  revalidatePath("/dashboard/obligations");
  return { message: "Payment saved." };
}
const occurrenceAmountSchema = z.object({
  occurrenceId: z.string().uuid(),
  amount: z.string().regex(/^\d{1,9}(?:\.\d{1,2})?$/),
}).strict();

export async function updateOccurrenceAmountAction(
  _previousState: ObligationState,
  formData: FormData,
): Promise<ObligationState> {
  const parsed = occurrenceAmountSchema.safeParse({
    occurrenceId: formData.get("occurrenceId"),
    amount: formData.get("amount"),
  });
  if (!parsed.success) return { error: "Enter a valid payment amount." };
  const amountMinor = toMinorUnits(parsed.data.amount);
  if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) return { error: "Enter a payment amount above zero." };
  await requireUser();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("update_payment_occurrence_amount", {
    p_occurrence_id: parsed.data.occurrenceId,
    p_amount_minor: amountMinor,
  });
  if (error) return { error: "Could not update this payment. Confirm the latest Supabase migration is applied." };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/obligations");
  return { message: "Payment amount and cutoff reserves updated." };
}

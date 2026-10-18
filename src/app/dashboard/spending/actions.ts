"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ExpenseState = { error?: string; message?: string };

const expenseSchema = z.object({
  transaction: z.string().trim().min(1).max(48),
  amount: z.string().regex(/^\d{1,9}(?:\.\d{1,2})?$/),
  expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
}).strict();
const expenseIdSchema = z.string().uuid();

function isRealDate(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function toMinorUnits(value: string) {
  const [whole, fraction = ""] = value.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

export async function createExpenseAction(
  _previousState: ExpenseState,
  formData: FormData,
): Promise<ExpenseState> {
  const parsed = expenseSchema.safeParse({
    transaction: formData.get("transaction"),
    amount: formData.get("amount"),
    expenseDate: formData.get("expenseDate"),
  });
  if (!parsed.success) return { error: "Enter a transaction, valid amount, and date." };
  if (!isRealDate(parsed.data.expenseDate)) return { error: "Enter a valid spending date." };

  const amountMinor = toMinorUnits(parsed.data.amount);
  if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) {
    return { error: "Enter an amount above zero and below PHP 1,000,000,000." };
  }

  const { userId } = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("expenses").insert({
    user_id: userId,
    expense_date: parsed.data.expenseDate,
    amount_minor: amountMinor,
    category: parsed.data.transaction,
    funding_source_id: null,
    note: null,
  });

  if (error) {
    console.error("Expense save rejected by Supabase", { code: error.code ?? "unknown" });
    return { error: "Could not save this spending entry. Refresh and try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/spending");
  return { message: "Spending saved. Your cutoff overview has been updated." };
}

export async function updateExpenseAction(
  _previousState: ExpenseState,
  formData: FormData,
): Promise<ExpenseState> {
  const parsed = expenseSchema.extend({ expenseId: expenseIdSchema }).safeParse({
    expenseId: formData.get("expenseId"),
    transaction: formData.get("transaction"),
    amount: formData.get("amount"),
    expenseDate: formData.get("expenseDate"),
  });
  if (!parsed.success) return { error: "Enter a transaction, valid amount, and date." };
  if (!isRealDate(parsed.data.expenseDate)) return { error: "Enter a valid spending date." };

  const amountMinor = toMinorUnits(parsed.data.amount);
  if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) {
    return { error: "Enter an amount above zero and below PHP 1,000,000,000." };
  }

  const { userId } = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("expenses")
    .update({
      expense_date: parsed.data.expenseDate,
      amount_minor: amountMinor,
      category: parsed.data.transaction,
    })
    .eq("id", parsed.data.expenseId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("Expense update rejected by Supabase", { code: error.code ?? "unknown" });
    return { error: "Could not update this spending entry. Refresh and try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/spending");
  return { message: "Spending updated. Your cutoff overview has been recalculated." };
}

export async function deleteExpenseAction(
  _previousState: ExpenseState,
  formData: FormData,
): Promise<ExpenseState> {
  const parsedId = expenseIdSchema.safeParse(formData.get("expenseId"));
  if (!parsedId.success) return { error: "Could not identify this spending entry. Refresh and try again." };

  const { userId } = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("expenses")
    .delete()
    .eq("id", parsedId.data)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("Expense delete rejected by Supabase", { code: error.code ?? "unknown" });
    return { error: "Could not delete this spending entry. Refresh and try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/spending");
  return { message: "Spending deleted. Your cutoff overview has been recalculated." };
}

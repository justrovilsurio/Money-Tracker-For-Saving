"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type FundingSourceState = { error?: string; message?: string };

const fundingSourceSchema = z.object({
  name: z.string().trim().min(1).max(80),
  kind: z.enum(["bank", "card", "loan", "wallet", "cash", "other"]),
  creditLimit: z.string().regex(/^\d{1,9}(?:\.\d{1,2})?$/).optional(),
  currentBalance: z.string().regex(/^\d{1,9}(?:\.\d{1,2})?$/).optional(),
  paymentDueDate: z.string().regex(/^(?:\d{4}-\d{2}-\d{2})?$/).optional(),
}).strict();

function isRealDate(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function toMinorUnits(value: string | undefined) {
  if (!value) return 0;
  const [whole, fraction = ""] = value.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

export async function createFundingSourceAction(
  _previousState: FundingSourceState,
  formData: FormData,
): Promise<FundingSourceState> {
  const parsed = fundingSourceSchema.safeParse({
    name: formData.get("name"),
    kind: formData.get("kind"),
    creditLimit: formData.get("creditLimit") || undefined,
    currentBalance: formData.get("currentBalance") || undefined,
    paymentDueDate: formData.get("paymentDueDate") || undefined,
  });

  if (!parsed.success) return { error: "Enter a source name and choose a source type." };
  const creditLimit = toMinorUnits(parsed.data.creditLimit);
  const currentBalance = toMinorUnits(parsed.data.currentBalance);
  if (!Number.isSafeInteger(creditLimit) || !Number.isSafeInteger(currentBalance)) {
    return { error: "Enter balances below PHP 10,000,000." };
  }
  if ((parsed.data.kind === "card" || parsed.data.kind === "loan") && !parsed.data.creditLimit) {
    return { error: "Enter the card credit limit or original loan amount." };
  }
  if ((parsed.data.kind === "card" || parsed.data.kind === "loan") && (!parsed.data.paymentDueDate || !isRealDate(parsed.data.paymentDueDate))) {
    return { error: "Enter a valid payment due date for this card or loan." };
  }

  // Derive ownership from the verified Supabase session; never trust a submitted user ID.
  const { userId } = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("funding_sources").insert({
    user_id: userId,
    name: parsed.data.name,
    kind: parsed.data.kind,
    credit_limit_minor: parsed.data.kind === "card" || parsed.data.kind === "loan" ? creditLimit : null,
    current_balance_minor: currentBalance,
    payment_due_date: (parsed.data.kind === "card" || parsed.data.kind === "loan") && parsed.data.paymentDueDate
      ? parsed.data.paymentDueDate
      : null,
  });

  if (error) return { error: "Could not save this account. Check the connection and try again." };

  revalidatePath("/dashboard");
  revalidatePath("/setup");
  return { message: "Account added." };
}

const updateFundingSourceSchema = z.object({
  id: z.string().uuid(),
  kind: z.enum(["bank", "card", "loan", "wallet", "cash", "other"]),
  creditLimit: z.string().regex(/^\d{1,9}(?:\.\d{1,2})?$/).optional(),
  currentBalance: z.string().regex(/^\d{1,9}(?:\.\d{1,2})?$/),
  paymentDueDate: z.string().regex(/^(?:\d{4}-\d{2}-\d{2})?$/).optional(),
}).strict();

export async function updateFundingSourceAction(
  _previousState: FundingSourceState,
  formData: FormData,
): Promise<FundingSourceState> {
  const parsed = updateFundingSourceSchema.safeParse({
    id: formData.get("id"),
    kind: formData.get("kind"),
    creditLimit: formData.get("creditLimit") || undefined,
    currentBalance: formData.get("currentBalance"),
    paymentDueDate: formData.get("paymentDueDate") || undefined,
  });
  if (!parsed.success) return { error: "Enter a valid debt amount, limit and payment due date." };
  const creditLimit = toMinorUnits(parsed.data.creditLimit);
  const currentBalance = toMinorUnits(parsed.data.currentBalance);
  if (!Number.isSafeInteger(creditLimit) || !Number.isSafeInteger(currentBalance)) {
    return { error: "Enter balances below PHP 10,000,000." };
  }
  const { userId } = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data: source, error: sourceError } = await supabase.from("funding_sources")
    .select("id").eq("id", parsed.data.id).eq("user_id", userId).maybeSingle();
  if (sourceError || !source) return { error: "Could not find this account." };
  const isCreditSource = parsed.data.kind === "card" || parsed.data.kind === "loan";
  if (isCreditSource && (!parsed.data.creditLimit || (!parsed.data.paymentDueDate || !isRealDate(parsed.data.paymentDueDate)))) {
    return { error: "Cards and loans need a limit or original amount and a payment due date." };
  }
  const { error } = await supabase.from("funding_sources").update({
    kind: parsed.data.kind,
    credit_limit_minor: isCreditSource ? creditLimit : null,
    current_balance_minor: currentBalance,
    payment_due_date: isCreditSource && parsed.data.paymentDueDate ? parsed.data.paymentDueDate : null,
  }).eq("id", parsed.data.id).eq("user_id", userId);
  if (error) return { error: "Could not update this account. Check the connection and try again." };
  revalidatePath("/dashboard");
  return { message: "Account details updated." };
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CutoffIncomeState = { error?: string; message?: string };

const incomeSchema = z.object({
  entryMode: z.enum(["cutoff", "monthly"]),
  cutoffDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  amount: z.string().regex(/^\d{1,9}(?:\.\d{1,2})?$/).optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  monthlyAmount: z.string().regex(/^\d{1,9}(?:\.\d{1,2})?$/).optional(),
}).strict();

function toMinorUnits(value: string): number {
  const [whole, fraction = ""] = value.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

function isRealDate(value: string): boolean {
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export async function saveCutoffIncomeAction(
  _previousState: CutoffIncomeState,
  formData: FormData,
): Promise<CutoffIncomeState> {
  const parsed = incomeSchema.safeParse({
    entryMode: formData.get("entryMode"),
    cutoffDate: formData.get("cutoffDate") || undefined,
    amount: formData.get("amount") || undefined,
    month: formData.get("month") || undefined,
    monthlyAmount: formData.get("monthlyAmount") || undefined,
  });
  if (!parsed.success) return { error: "Enter a valid income amount and cutoff date or month." };

  const { userId } = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data: profile, error: profileError } = await supabase
    .from("profiles").select("cutoff_day_one, cutoff_day_two").eq("id", userId).maybeSingle();
  if (profileError) return { error: "Could not load your cutoff settings. Refresh and try again." };
  const cutoffOne = profile?.cutoff_day_one ?? 15;
  const cutoffTwo = profile?.cutoff_day_two ?? 30;

  let rows: { user_id: string; cutoff_date: string; income_amount_minor: number }[];
  if (parsed.data.entryMode === "cutoff") {
    if (!parsed.data.cutoffDate || !isRealDate(parsed.data.cutoffDate) || !parsed.data.amount) {
      return { error: "Enter a valid cutoff date and received income amount." };
    }
    const [year, month, day] = parsed.data.cutoffDate.split("-").map(Number);
    const monthEnd = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const first = Math.min(cutoffOne, monthEnd);
    const second = Math.min(cutoffTwo, monthEnd);
    if (day !== first && day !== second) return { error: "Choose the 15th or second cutoff for that month." };
    const amount = toMinorUnits(parsed.data.amount);
    if (!Number.isSafeInteger(amount)) return { error: "Enter income below PHP 10,000,000." };
    rows = [{ user_id: userId, cutoff_date: parsed.data.cutoffDate, income_amount_minor: amount }];
  } else {
    if (!parsed.data.month || !parsed.data.monthlyAmount) return { error: "Enter a month and total monthly income." };
    const [year, month] = parsed.data.month.split("-").map(Number);
    if (month < 1 || month > 12) return { error: "Choose a valid month." };
    const total = toMinorUnits(parsed.data.monthlyAmount);
    if (!Number.isSafeInteger(total)) return { error: "Enter income below PHP 10,000,000." };
    const monthEnd = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const firstDate = `${year}-${String(month).padStart(2, "0")}-${String(Math.min(cutoffOne, monthEnd)).padStart(2, "0")}`;
    const secondDate = `${year}-${String(month).padStart(2, "0")}-${String(Math.min(cutoffTwo, monthEnd)).padStart(2, "0")}`;
    if (firstDate === secondDate) return { error: "Your two cutoff days land on the same date that month, so enter income by cutoff instead." };
    const firstAmount = Math.floor(total / 2);
    rows = [
      { user_id: userId, cutoff_date: firstDate, income_amount_minor: firstAmount },
      { user_id: userId, cutoff_date: secondDate, income_amount_minor: total - firstAmount },
    ];
  }

  const { error } = await supabase.from("cutoff_income").upsert(rows, { onConflict: "user_id,cutoff_date" });
  if (error) {
    // Log only the database error code; never log income or account data.
    console.error("Income save rejected by Supabase", { code: error.code ?? "unknown" });
    if (error.code === "PGRST204" || error.code === "42703") {
      return { error: "Supabase could not find a required income field. Confirm the latest migration is applied and the API schema has refreshed." };
    }
    if (error.code === "42501") {
      return { error: "Supabase denied this income save. Check the cutoff_income row security policies and sign in again." };
    }
    if (error.code === "23505") {
      return { error: "A cutoff income entry already exists for this date. Refresh the page and try again." };
    }
    return { error: "Supabase rejected the income entry. Check the server terminal for its error code, then try again." };
  }
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/income");
  return { message: parsed.data.entryMode === "monthly" ? "Monthly income split across both cutoffs." : "Cutoff income saved." };
}

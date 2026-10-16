import Link from "next/link";
import { redirect } from "next/navigation";
import ArrowNarrowRightIcon from "@/components/ui/arrow-narrow-right-icon";
import { requireUser } from "@/lib/auth/require-user";
import { WorkspaceHeader } from "@/app/dashboard/workspace-nav";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { IncomeForm } from "./income-form";

export const dynamic = "force-dynamic";

type IncomeRow = {
  id: string;
  cutoff_date: string;
  income_amount_minor: number;
};

function dateInManilaToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function nextCutoffDate(today: string, cutoffOne: number, cutoffTwo: number) {
  const [year, month] = today.split("-").map(Number);
  const candidates: string[] = [];
  for (let offset = 0; offset < 14; offset += 1) {
    const date = new Date(Date.UTC(year, month - 1 + offset, 1));
    const currentYear = date.getUTCFullYear();
    const currentMonth = date.getUTCMonth();
    const monthEnd = new Date(Date.UTC(currentYear, currentMonth + 1, 0)).getUTCDate();
    for (const day of [cutoffOne, Math.min(cutoffTwo, monthEnd)]) {
      const iso = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      if (iso >= today) candidates.push(iso);
    }
  }
  return candidates.sort()[0] ?? today;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

function formatMoney(minorUnits: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(minorUnits / 100);
}

export default async function CutoffIncomePage() {
  if (!getSupabasePublicEnv()) redirect("/setup");
  const { userId } = await requireUser();
  const supabase = await createSupabaseServerClient();
  const [{ data: profile }, { data, error }] = await Promise.all([
    supabase.from("profiles").select("cutoff_day_one, cutoff_day_two").eq("id", userId).maybeSingle(),
    supabase.from("cutoff_income")
      .select("id, cutoff_date, income_amount_minor")
      .eq("user_id", userId)
      .order("cutoff_date", { ascending: false })
      .limit(12),
  ]);
  const entries = (data ?? []) as IncomeRow[];
  const cutoffOne = profile?.cutoff_day_one ?? 15;
  const cutoffTwo = profile?.cutoff_day_two ?? 30;
  const defaultCutoffDate = nextCutoffDate(dateInManilaToday(), cutoffOne, cutoffTwo);

  return (
    <main className="setup-page" id="main-content" tabIndex={-1}>
      <WorkspaceHeader current="income" />
      <section className="setup-card income-card">
        <Link className="income-back" href="/dashboard"><ArrowNarrowRightIcon size={14} className="icon-rotate-left" />Back to accounts</Link>
        <p className="eyebrow">YOUR INCOME</p>
        <h1>Record income received.</h1>
        <p className="setup-intro">Enter what came in for one cutoff, or enter the whole month's income and split it across both cutoffs.</p>

        <IncomeForm defaultCutoffDate={defaultCutoffDate} />

        <section className="income-history" aria-labelledby="income-history-heading">
          <div className="income-history-heading">
            <div>
              <p className="eyebrow">SAVED INCOME</p>
              <h2 id="income-history-heading">Recent cutoffs</h2>
            </div>
            <span>{entries.length} saved</span>
          </div>
          {error ? <p className="form-message form-error" role="alert">Cutoff income could not be loaded. Refresh and try again.</p> : entries.length === 0 ? (
            <p className="income-empty">Your saved cutoff incomes will appear here.</p>
          ) : (
            <ul className="income-list">
              {entries.map((entry) => (
                <li key={entry.id}>
                  <span><strong>{formatDate(entry.cutoff_date)}</strong></span>
                  <span><small>Income</small><strong>{formatMoney(entry.income_amount_minor)}</strong></span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <div className="income-next-step">
          <span>Next: add each bill or installment payment with its amount and due date.</span>
          <Link className="button button-primary" href="/dashboard/obligations">Continue to payments<ArrowNarrowRightIcon size={15} /></Link>
        </div>
      </section>
    </main>
  );
}


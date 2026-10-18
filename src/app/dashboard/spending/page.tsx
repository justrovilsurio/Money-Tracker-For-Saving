import Link from "next/link";
import { redirect } from "next/navigation";
import ArrowNarrowRightIcon from "@/components/ui/arrow-narrow-right-icon";
import { WorkspaceHeader } from "@/app/dashboard/workspace-nav";
import { requireUser } from "@/lib/auth/require-user";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ExpenseForm } from "./expense-form";
import { ExpenseRowActions } from "./expense-row-actions";

export const dynamic = "force-dynamic";

type ExpenseRow = {
  id: string;
  expense_date: string;
  amount_minor: number;
  category: string;
};

type Profile = { currency_code: string };

function todayInManila() {
  const values = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date()).map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeZone: "UTC" })
    .format(new Date(`${value}T00:00:00.000Z`));
}

function formatMoney(value: number, currencyCode: string) {
  try {
    return new Intl.NumberFormat("en-PH", { style: "currency", currency: currencyCode }).format(Number(value) / 100);
  } catch {
    return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(Number(value) / 100);
  }
}

export default async function SpendingPage() {
  if (!getSupabasePublicEnv()) redirect("/setup");
  const { userId } = await requireUser();
  const supabase = await createSupabaseServerClient();
  const [{ data: profileData }, { data, error }] = await Promise.all([
    supabase.from("profiles").select("currency_code").eq("id", userId).maybeSingle(),
    supabase.from("expenses")
      .select("id, expense_date, amount_minor, category")
      .eq("user_id", userId)
      .order("expense_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(20),
  ]);
  const profile = profileData as Profile | null;
  const expenses = (data ?? []) as ExpenseRow[];

  return (
    <main className="setup-page" id="main-content" tabIndex={-1}>
      <WorkspaceHeader current="spending" />
      <section className="setup-card income-card spending-card">
        <Link className="income-back" href="/dashboard"><ArrowNarrowRightIcon size={14} className="icon-rotate-left" />Back to overview</Link>
        <p className="eyebrow">YOUR SPENDING</p>
        <h1>Record everyday spending.</h1>
        <p className="setup-intro">Add purchases as they happen. They reduce the estimated amount left to spend for the cutoff period that contains the transaction date.</p>

        <ExpenseForm defaultExpenseDate={todayInManila()} />

        <section className="income-history" aria-labelledby="spending-history-heading">
          <div className="income-history-heading">
            <div>
              <p className="eyebrow">SAVED SPENDING</p>
              <h2 id="spending-history-heading">Recent transactions</h2>
            </div>
            <span>{expenses.length} shown</span>
          </div>
          {error ? <p className="form-message form-error" role="alert">Spending could not be loaded. Refresh and try again.</p> : expenses.length === 0 ? (
            <p className="income-empty">Your saved cash expenses will appear here.</p>
          ) : (
            <ul className="income-list spending-list">
              {expenses.map((expense) => (
                <li className="spending-entry" key={expense.id}>
                    <span className="spending-entry-copy"><strong>{expense.category}</strong><small>{formatDate(expense.expense_date)}</small></span>
                    <span className="spending-entry-amount"><small>Spent</small><strong>{formatMoney(expense.amount_minor, profile?.currency_code ?? "PHP")}</strong></span>
                    <ExpenseRowActions
                      expenseId={expense.id}
                      transaction={expense.category}
                      amountMinor={expense.amount_minor}
                      expenseDate={expense.expense_date}
                    />
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}

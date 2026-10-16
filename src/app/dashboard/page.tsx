import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import ArrowNarrowRightIcon from "@/components/ui/arrow-narrow-right-icon";
import ChartBarIcon from "@/components/ui/chart-bar-icon";
import CreditCardIcon from "@/components/ui/credit-card";
import { FundingSourcesPanel, type FundingSource } from "@/app/dashboard/funding-sources-panel";
import ShoppingCartIcon from "@/components/ui/shopping-cart-icon";
import WalletIcon from "@/components/ui/wallet-icon";
import { requireUser } from "@/lib/auth/require-user";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { WorkspaceHeader } from "@/app/dashboard/workspace-nav";

export const dynamic = "force-dynamic";

type Profile = { currency_code: string; cutoff_day_one: number; cutoff_day_two: number };
type Income = { income_amount_minor: number };
type AmountRow = { amount_minor: number };
type ObligationName = { id: string; name: string; funding_source_id: string };
type Reservation = { payment_occurrence_id: string; cutoff_date: string; amount_minor: number };
type UpcomingPayment = {
  id: string;
  obligation_id: string;
  due_date: string;
  funding_cutoff_date: string;
  amount_minor: number;
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

function isoDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function nextCutoffDate(today: string, cutoffOne: number, cutoffTwo: number) {
  const [year, month, day] = today.split("-").map(Number);
  const currentMonthEnd = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const first = Math.min(cutoffOne, currentMonthEnd);
  const second = Math.min(cutoffTwo, currentMonthEnd);
  if (day <= first) return isoDate(year, month - 1, first);
  if (day <= second) return isoDate(year, month - 1, second);

  const nextMonth = new Date(Date.UTC(year, month, 1));
  const nextYear = nextMonth.getUTCFullYear();
  const nextMonthIndex = nextMonth.getUTCMonth();
  const nextMonthEnd = new Date(Date.UTC(nextYear, nextMonthIndex + 1, 0)).getUTCDate();
  return isoDate(nextYear, nextMonthIndex, Math.min(cutoffOne, nextMonthEnd));
}

function latestCutoffDate(today: string, cutoffOne: number, cutoffTwo: number) {
  const [year, month, day] = today.split("-").map(Number);
  const currentMonthEnd = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const first = Math.min(cutoffOne, currentMonthEnd);
  const second = Math.min(cutoffTwo, currentMonthEnd);
  if (day >= second) return isoDate(year, month - 1, second);
  if (day >= first) return isoDate(year, month - 1, first);

  const previousMonth = new Date(Date.UTC(year, month - 2, 1));
  const previousYear = previousMonth.getUTCFullYear();
  const previousMonthIndex = previousMonth.getUTCMonth();
  const previousMonthEnd = new Date(Date.UTC(previousYear, previousMonthIndex + 1, 0)).getUTCDate();
  return isoDate(previousYear, previousMonthIndex, Math.min(cutoffTwo, previousMonthEnd));
}

function cutoffPeriod(cutoff: string, cutoffOne: number, cutoffTwo: number) {
  const [year, month, day] = cutoff.split("-").map(Number);
  const monthEnd = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const first = Math.min(cutoffOne, monthEnd);
  const second = Math.min(cutoffTwo, monthEnd);
  const nextMonth = new Date(Date.UTC(year, month, 1));
  const nextYear = nextMonth.getUTCFullYear();
  const nextMonthIndex = nextMonth.getUTCMonth();
  const nextMonthEnd = new Date(Date.UTC(nextYear, nextMonthIndex + 1, 0)).getUTCDate();
  const nextFirst = Math.min(cutoffOne, nextMonthEnd);
  const endDate = day === first && first !== second
    ? new Date(Date.UTC(year, month - 1, second - 1))
    : new Date(Date.UTC(nextYear, nextMonthIndex, nextFirst - 1));
  return {
    start: cutoff,
    end: isoDate(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()),
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeZone: "UTC" })
    .format(new Date(`${value}T00:00:00.000Z`));
}

function formatMoney(minorUnits: number, currencyCode: string) {
  const amount = Number(minorUnits) / 100;
  try {
    return new Intl.NumberFormat("en-PH", { style: "currency", currency: currencyCode }).format(amount);
  } catch {
    return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);
  }
}

function totalMinor(rows: AmountRow[]) {
  return rows.reduce((total, row) => total + Number(row.amount_minor), 0);
}

function SummaryCard({ label, value, detail, tone, icon }: {
  label: string;
  value: string;
  detail: string;
  tone: "blue" | "amber" | "green" | "violet";
  icon: ReactNode;
}) {
  return (
    <article className="summary-card">
      <div className="summary-card-top"><span>{label}</span><span className={`summary-icon summary-${tone}`} aria-hidden="true">{icon}</span></div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

export default async function DashboardPage() {
  if (!getSupabasePublicEnv()) redirect("/setup");
  const { userId } = await requireUser();
  const supabase = await createSupabaseServerClient();
  const [
    { data: profileData, error: profileError },
    { data: sourceData, error: sourceError },
  ] = await Promise.all([
    supabase.from("profiles").select("currency_code, cutoff_day_one, cutoff_day_two").eq("id", userId).maybeSingle(),
    supabase.from("funding_sources").select("id, name, kind, credit_limit_minor, current_balance_minor, payment_due_date, created_at")
      .eq("user_id", userId).is("archived_at", null).order("created_at", { ascending: true }),
  ]);

  const profile = profileData as Profile | null;
  const sources = (sourceData ?? []) as FundingSource[];
  const cutoffOne = profile?.cutoff_day_one ?? 15;
  const cutoffTwo = profile?.cutoff_day_two ?? 30;
  const currencyCode = profile?.currency_code ?? "PHP";
  const today = dateInManilaToday();
  const cutoffDate = latestCutoffDate(today, cutoffOne, cutoffTwo);
  const period = cutoffPeriod(cutoffDate, cutoffOne, cutoffTwo);
  const planMonthDate = nextCutoffDate(today, cutoffOne, cutoffTwo);
  const [cutoffYear, cutoffMonth] = planMonthDate.split("-").map(Number);
  const monthEnd = new Date(Date.UTC(cutoffYear, cutoffMonth, 0)).getUTCDate();
  const monthlyCutoffDates = [
    isoDate(cutoffYear, cutoffMonth - 1, Math.min(cutoffOne, monthEnd)),
    isoDate(cutoffYear, cutoffMonth - 1, Math.min(cutoffTwo, monthEnd)),
  ];

  const [
    { data: incomeData, error: incomeError },
    { data: reserveData, error: reserveError },
    { data: savingsData, error: savingsError },
    { data: expenseData, error: expenseError },
    { data: upcomingData, error: upcomingError },
    { data: obligationData, error: obligationError },
    { data: monthlyIncomeData, error: monthlyIncomeError },
    { data: monthlyReserveData, error: monthlyReserveError },
  ] = await Promise.all([
    supabase.from("cutoff_income").select("income_amount_minor")
      .eq("user_id", userId).eq("cutoff_date", cutoffDate).maybeSingle(),
    supabase.from("payment_reservations").select("amount_minor")
      .eq("user_id", userId).eq("cutoff_date", cutoffDate),
    supabase.from("cutoff_savings").select("planned_amount_minor")
      .eq("user_id", userId).eq("cutoff_date", cutoffDate).maybeSingle(),
    supabase.from("expenses").select("amount_minor")
      .eq("user_id", userId).gte("expense_date", period.start).lte("expense_date", period.end),
    supabase.from("payment_occurrences").select("id, obligation_id, due_date, funding_cutoff_date, amount_minor")
      .eq("user_id", userId).eq("status", "planned").gte("due_date", today)
      .order("due_date", { ascending: true }).limit(8),
    supabase.from("obligations").select("id, name, funding_source_id")
      .eq("user_id", userId).eq("active", true),
    supabase.from("cutoff_income").select("cutoff_date, income_amount_minor")
      .eq("user_id", userId).in("cutoff_date", monthlyCutoffDates),
    supabase.from("payment_reservations").select("cutoff_date, amount_minor")
      .eq("user_id", userId).in("cutoff_date", monthlyCutoffDates),
  ]);

  const upcomingPayments = (upcomingData ?? []) as UpcomingPayment[];
  const upcomingReservationResult = upcomingPayments.length
    ? await supabase.from("payment_reservations")
      .select("payment_occurrence_id, cutoff_date, amount_minor")
      .eq("user_id", userId)
      .in("payment_occurrence_id", upcomingPayments.map((payment) => payment.id))
    : { data: [], error: null };

  const income = incomeData as Income | null;
  const reservedBills = totalMinor((reserveData ?? []) as AmountRow[]);
  const plannedSavings = Number(savingsData?.planned_amount_minor ?? 0);
  const recordedSpending = totalMinor((expenseData ?? []) as AmountRow[]);
  const cutoffIncome = Number(income?.income_amount_minor ?? 0);
  const estimatedAvailable = income
    ? cutoffIncome - reservedBills - plannedSavings - recordedSpending
    : null;
  const upcomingReservations = (upcomingReservationResult.data ?? []) as Reservation[];
  const reservationsByPayment = new Map<string, Reservation[]>();
  for (const reservation of upcomingReservations) {
    reservationsByPayment.set(reservation.payment_occurrence_id, [
      ...(reservationsByPayment.get(reservation.payment_occurrence_id) ?? []), reservation,
    ]);
  }
  const obligations = (obligationData ?? []) as ObligationName[];
  const monthlyIncomeByDate = new Map((monthlyIncomeData ?? []).map((row) => [row.cutoff_date, Number(row.income_amount_minor)]));
  const monthlyReserveByDate = new Map<string, number>();
  for (const row of (monthlyReserveData ?? []) as { cutoff_date: string; amount_minor: number }[]) {
    monthlyReserveByDate.set(row.cutoff_date, (monthlyReserveByDate.get(row.cutoff_date) ?? 0) + Number(row.amount_minor));
  }
  const obligationsById = new Map(obligations.map((item) => [item.id, item]));
  const sourcesById = new Map(sources.map((item) => [item.id, item.name]));
  const loadError = Boolean(profileError || sourceError || incomeError || reserveError || savingsError || expenseError || upcomingError || obligationError || upcomingReservationResult.error || monthlyIncomeError || monthlyReserveError);

  return (
    <main className="overview-page" id="main-content" tabIndex={-1}>
      <WorkspaceHeader current="overview" />

      <div className="overview-content">
        <div className="overview-heading">
          <div>
            <p className="eyebrow">YOUR PRIVATE MONEY PLAN</p>
            <h1>Cutoff overview</h1>
            <p className="setup-intro">A planning view of what is coming up. Your bank balances are not connected.</p>
          </div>
          <div className="overview-date"><span>Using income from cutoff</span><strong>{formatDate(cutoffDate)}</strong></div>
        </div>

        {loadError ? <p className="form-message form-error" role="alert">Some overview data could not be loaded. Confirm the latest Supabase migration is applied, then refresh.</p> : null}

        <section className="overview-available" aria-label="Estimated amount remaining to spend">
          <div>
            <p className="eyebrow eyebrow-light">ESTIMATED LEFT TO SPEND</p>
            <strong className={estimatedAvailable !== null && estimatedAvailable < 0 ? "amount-negative" : ""}>
              {estimatedAvailable === null ? "Add cutoff income" : formatMoney(estimatedAvailable, currencyCode)}
            </strong>
            <small>Latest cutoff income − payment reserves − savings target − spending through {formatDate(period.end)}</small>
          </div>
          <Link className="overview-cta" href="/dashboard/income">{income ? "Update cutoff income" : "Add cutoff income"}<ArrowNarrowRightIcon size={15} /></Link>
          <span className="overview-orbit overview-orbit-one" aria-hidden="true" />
          <span className="overview-orbit overview-orbit-two" aria-hidden="true" />
        </section>

        <section className="summary-grid" aria-label="Cutoff totals">
          <SummaryCard label="Income received" value={income ? formatMoney(cutoffIncome, currencyCode) : "—"}
            detail={income ? "Saved for this cutoff" : "No income saved for this cutoff"} tone="blue" icon={<WalletIcon size={16} />} />
          <SummaryCard label="Bills to reserve" value={formatMoney(reservedBills, currencyCode)}
            detail={`${((reserveData ?? []) as AmountRow[]).length} reserve contribution${((reserveData ?? []) as AmountRow[]).length === 1 ? "" : "s"} from this cutoff`} tone="amber" icon={<CreditCardIcon size={16} />} />
          <SummaryCard label="Planned savings" value={formatMoney(plannedSavings, currencyCode)}
            detail={savingsData ? "Savings target for this cutoff" : "No savings target set"} tone="green" icon={<ChartBarIcon size={16} />} />
          <SummaryCard label="Recorded spending" value={formatMoney(recordedSpending, currencyCode)}
            detail={`${formatDate(period.start)} – ${formatDate(period.end)}`} tone="violet" icon={<ShoppingCartIcon size={16} />} />
        </section>

        <section className="cutoff-pair-panel" aria-labelledby="cutoff-pair-title">
          <div className="panel-heading">
            <div><p className="eyebrow">BOTH PAYDAYS</p><h2 id="cutoff-pair-title">This month's cutoff plan</h2></div>
          </div>
          <div className="cutoff-pair-grid">
            {monthlyCutoffDates.map((date, index) => {
              const amount = monthlyIncomeByDate.get(date);
              const reserves = monthlyReserveByDate.get(date) ?? 0;
              return (
                <article className="cutoff-pair-card" key={date}>
                  <span>{index === 0 ? "First cutoff" : "Second cutoff"} · {formatDate(date)}</span>
                  <strong>{amount === undefined ? "Add income" : formatMoney(amount, currencyCode)}</strong>
                  <small>{formatMoney(reserves, currencyCode)} reserved for payments</small>
                  {amount !== undefined ? <small>{formatMoney(amount - reserves, currencyCode)} after payment reserves</small> : null}
                </article>
              );
            })}
          </div>
        </section>

        <div className="overview-grid">
          <section className="panel overview-panel" aria-labelledby="upcoming-heading">
            <div className="panel-heading">
              <div><p className="eyebrow">YOUR PAYMENTS</p><h2 id="upcoming-heading">Upcoming payments</h2></div>
              <Link className="text-link" href="/dashboard/obligations">Manage<ArrowNarrowRightIcon size={14} /></Link>
            </div>
            {upcomingPayments.length === 0 ? (
              <p className="overview-empty">No upcoming payments yet. Add a bill with its amount due and date.</p>
            ) : (
              <ul className="overview-payment-list">
                {upcomingPayments.map((payment) => {
                  const obligation = obligationsById.get(payment.obligation_id);
                  return (
                    <li key={payment.id}>
                      <span className="overview-payment-mark" aria-hidden="true" />
                      <span className="overview-payment-copy">
                        <strong>{obligation?.name ?? "Payment"}</strong>
                        <small>{sourcesById.get(obligation?.funding_source_id ?? "") ?? "Payment source"} · Due {formatDate(payment.due_date)}</small>
                        <small>{(reservationsByPayment.get(payment.id) ?? []).map((reservation) => `${formatMoney(Number(reservation.amount_minor), currencyCode)} from ${formatDate(reservation.cutoff_date)}`).join(" · ") || `Reserve from ${formatDate(payment.funding_cutoff_date)}`}</small>
                      </span>
                      <strong className="overview-payment-amount">{formatMoney(Number(payment.amount_minor), currencyCode)}</strong>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="panel overview-panel overview-sources" aria-labelledby="sources-heading">
            <div className="panel-heading">
              <div><p className="eyebrow">ACCOUNTS</p><h2 id="sources-heading">Accounts</h2></div>
              <span className="overview-count">{sources.length} active</span>
            </div>
            <FundingSourcesPanel sources={sources} loadError={Boolean(sourceError)} currencyCode={currencyCode} />
          </section>
        </div>

        <footer className="overview-footer">
          <span>Balances and payment amounts are manually entered estimates, not live bank data.</span>
          <Link href="/dashboard/obligations">Add another bill<ArrowNarrowRightIcon size={14} /></Link>
        </footer>
      </div>
    </main>
  );
}




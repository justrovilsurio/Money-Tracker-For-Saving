import Link from "next/link";
import { redirect } from "next/navigation";
import ArrowNarrowRightIcon from "@/components/ui/arrow-narrow-right-icon";
import { requireUser } from "@/lib/auth/require-user";
import { WorkspaceNav } from "@/app/dashboard/workspace-nav";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ObligationForm, type ObligationSourceOption } from "./obligation-form";
import { OccurrenceAmountForm } from "./occurrence-amount-form";

export const dynamic = "force-dynamic";

type ObligationRow = {
  id: string;
  funding_source_id: string;
  name: string;
  kind: "installment" | "recurring";
  amount_minor: number;
  first_due_date: string;
  last_due_date: string | null;
};

type OccurrenceRow = {
  id: string;
  obligation_id: string;
  due_date: string;
  funding_cutoff_date: string;
  amount_minor: number;
  status: "planned" | "paid" | "skipped";
};

type SourceWithDueDate = ObligationSourceOption;
type ReservationRow = { payment_occurrence_id: string; cutoff_date: string; amount_minor: number };

function todayInManila() {
  const values = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date()).map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeZone: "UTC" })
    .format(new Date(`${value}T00:00:00.000Z`));
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(Number(value) / 100);
}

export default async function ObligationsPage() {
  if (!getSupabasePublicEnv()) redirect("/setup");
  const { userId } = await requireUser();
  const supabase = await createSupabaseServerClient();
  const today = todayInManila();
  const [{ data: sourceData, error: sourceError }, { data: obligationData, error: obligationError }, { data: occurrenceData, error: occurrenceError }] = await Promise.all([
    supabase.from("funding_sources")
      .select("id, name")
      .eq("user_id", userId)
      .is("archived_at", null)
      .order("name", { ascending: true }),
    supabase.from("obligations")
      .select("id, funding_source_id, name, kind, amount_minor, first_due_date, last_due_date")
      .eq("user_id", userId)
      .eq("active", true)
      .order("first_due_date", { ascending: true }),
    supabase.from("payment_occurrences")
      .select("id, obligation_id, due_date, funding_cutoff_date, amount_minor, status")
      .eq("user_id", userId)
      .gte("due_date", today)
      .order("due_date", { ascending: true }),
  ]);

  const sources = (sourceData ?? []) as ObligationSourceOption[];
  const obligations = (obligationData ?? []) as ObligationRow[];
  const occurrences = (occurrenceData ?? []) as OccurrenceRow[];
  const { data: reservationData, error: reservationError } = occurrences.length
    ? await supabase.from("payment_reservations")
      .select("payment_occurrence_id, cutoff_date, amount_minor")
      .eq("user_id", userId)
      .in("payment_occurrence_id", occurrences.map((item) => item.id))
      .order("cutoff_date", { ascending: true })
    : { data: [], error: null };
  const reservationsByOccurrence = new Map<string, ReservationRow[]>();
  for (const reservation of (reservationData ?? []) as ReservationRow[]) {
    reservationsByOccurrence.set(reservation.payment_occurrence_id, [
      ...(reservationsByOccurrence.get(reservation.payment_occurrence_id) ?? []), reservation,
    ]);
  }
  const sourceNames = new Map(sources.map((source) => [source.id, source.name]));
  const obligationNames = new Map(obligations.map((obligation) => [obligation.id, obligation.name]));
  const sourceByObligation = new Map(obligations.map((obligation) => [obligation.id, obligation.funding_source_id]));
  const pageError = sourceError || obligationError || occurrenceError || reservationError;

  return (
    <main className="setup-page" id="main-content" tabIndex={-1}>
      <WorkspaceNav current="bills" />
      <section className="setup-card obligation-card">
        <Link className="income-back" href="/dashboard"><ArrowNarrowRightIcon size={14} className="icon-rotate-left" />Back to dashboard</Link>
        <p className="eyebrow">CUTOFF PLAN · STEP 3</p>
        <h1>Add bills and installments.</h1>
        <p className="setup-intro">Add a single payment with its amount and due date. Payments due before the second cutoff are reserved from the previous cutoff; payments due on the second cutoff or month-end are split across both cutoffs.</p>

        {sources.length === 0 ? (
          <div className="setup-status obligation-no-sources" role="status">
            Add an account before adding a payment. <Link href="/dashboard">Go to accounts</Link>
          </div>
        ) : <ObligationForm sources={sources} />}

        <section className="obligation-history" aria-labelledby="obligation-history-heading">
          <div className="income-history-heading">
            <div>
              <p className="eyebrow">YOUR PAYMENTS</p>
              <h2 id="obligation-history-heading">Upcoming payments</h2>
            </div>
            <span>{occurrences.length} upcoming</span>
          </div>
          {pageError ? <p className="form-message form-error" role="alert">Some payment data could not be loaded. Refresh and try again.</p> : occurrences.length === 0 ? (
            <p className="income-empty">Your upcoming payments will appear here after you add them.</p>
          ) : (
            <ul className="income-list obligation-list">
              {occurrences.map((occurrence) => (
                <li key={occurrence.id}>
                  <span>
                    <strong>{obligationNames.get(occurrence.obligation_id) ?? "Payment"}</strong>
                    <small>Due {formatDate(occurrence.due_date)}</small>
                    {(reservationsByOccurrence.get(occurrence.id) ?? []).map((reservation) => (
                      <small key={reservation.cutoff_date}>Reserve {formatMoney(reservation.amount_minor)} from {formatDate(reservation.cutoff_date)}</small>
                    ))}
                    <small>{sourceNames.get(sourceByObligation.get(occurrence.obligation_id) ?? "") ?? "Payment source"}</small>
                  </span>
                  <span className="obligation-occurrence-edit"><small>{occurrence.status}</small><strong>{formatMoney(occurrence.amount_minor)}</strong><OccurrenceAmountForm occurrenceId={occurrence.id} amountMinor={occurrence.amount_minor} /></span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}

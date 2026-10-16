"use client";

import { useActionState, useState } from "react";
import { updateFundingSourceAction, type FundingSourceState } from "@/app/funding-sources/actions";

export type FundingSourceRecord = {
  id: string;
  name: string;
  kind: "bank" | "card" | "loan" | "wallet" | "cash" | "other";
  credit_limit_minor: number | null;
  current_balance_minor: number;
  payment_due_date: string | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeZone: "UTC" })
    .format(new Date(`${value}T00:00:00.000Z`));
}

function formatMoney(minorUnits: number, currencyCode: string) {
  return (Number(minorUnits) / 100).toLocaleString("en-PH", { style: "currency", currency: currencyCode });
}

function fromMinorUnits(value: number | null) {
  return value === null ? "" : (Number(value) / 100).toFixed(2);
}

export function FundingSourceRow({ source, currencyCode = "PHP" }: { source: FundingSourceRecord; currencyCode?: string }) {
  const [state, action, pending] = useActionState<FundingSourceState, FormData>(updateFundingSourceAction, {});
  const [kind, setKind] = useState(source.kind);
  const isCredit = kind === "card" || kind === "loan";
  const available = source.credit_limit_minor === null
    ? null
    : Number(source.credit_limit_minor) - Number(source.current_balance_minor);

  return (
    <article className="funding-source-row funding-source-row-editable">
      <div className="funding-source-summary">
        <strong>{source.name}</strong>
        <small>{source.kind === "card" ? "Credit card" : source.kind === "loan" ? "Loan" : source.kind[0].toUpperCase() + source.kind.slice(1)}
          {source.payment_due_date ? ` · Due ${formatDate(source.payment_due_date)}` : ""}
        </small>
        {source.kind === "card" ? (
          <small>Credit limit: {formatMoney(Number(source.credit_limit_minor ?? 0), currencyCode)}</small>
        ) : source.kind === "loan" ? (
          <small>Original loan amount: {formatMoney(Number(source.credit_limit_minor ?? 0), currencyCode)}</small>
        ) : null}
        {source.kind === "card" || source.kind === "loan" ? (
          <small>Current debt: {formatMoney(Number(source.current_balance_minor), currencyCode)}</small>
        ) : (
          <small>Current balance: {formatMoney(Number(source.current_balance_minor), currencyCode)}</small>
        )}
        {source.kind === "card" ? (
          <small>Available credit: {formatMoney(Number(source.credit_limit_minor ?? 0) - Number(source.current_balance_minor), currencyCode)}</small>
        ) : null}
      </div>
      <details className="source-edit">
        <summary>Edit account</summary>
        <form className="source-balance-form" action={action}>
          <input type="hidden" name="id" value={source.id} />
          <label>Account type
            <select name="kind" value={kind} onChange={(event) => setKind(event.target.value as FundingSourceRecord["kind"])}>
              <option value="bank">Bank</option><option value="card">Credit card</option><option value="loan">Loan</option>
              <option value="wallet">Digital wallet</option><option value="cash">Cash</option><option value="other">Other</option>
            </select>
          </label>
          <label>{isCredit ? "Current debt" : "Current balance"}
            <input name="currentBalance" type="number" min="0" max="999999999.99" step="0.01" defaultValue={fromMinorUnits(source.current_balance_minor)} required />
          </label>
          {isCredit ? <>
            <label>{kind === "loan" ? "Original loan amount" : "Credit limit"}
              <input name="creditLimit" type="number" min="0" max="999999999.99" step="0.01" defaultValue={fromMinorUnits(source.credit_limit_minor)} required />
            </label>
            <label>Payment due date
              <input name="paymentDueDate" type="date" defaultValue={source.payment_due_date ?? ""} required />
            </label>
          </> : null}
          {state.error ? <p className="form-message form-error" role="alert">{state.error}</p> : null}
          {state.message ? <p className="form-message form-success" role="status">{state.message}</p> : null}
          <button className="button button-outline button-small" type="submit" disabled={pending}>{pending ? "Saving…" : isCredit ? "Update debt" : "Update account"}</button>
        </form>
      </details>
    </article>
  );
}

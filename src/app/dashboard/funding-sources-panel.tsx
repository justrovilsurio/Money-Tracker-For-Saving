"use client";

import { useActionState, useState } from "react";
import WalletIcon from "@/components/ui/wallet-icon";
import { createFundingSourceAction, type FundingSourceState } from "@/app/funding-sources/actions";
import { FundingSourceRow, type FundingSourceRecord } from "@/app/dashboard/funding-source-row";

export type FundingSource = FundingSourceRecord;

const initialState: FundingSourceState = {};

export function FundingSourcesPanel({
  sources,
  loadError = false,
  currencyCode = "PHP",
}: { sources: FundingSource[]; loadError?: boolean; currencyCode?: string }) {
  const [state, action, pending] = useActionState(createFundingSourceAction, initialState);
  const [kind, setKind] = useState<FundingSource["kind"]>("bank");
  const isCreditAccount = kind === "card" || kind === "loan";

  return (
    <section className="funding-sources-panel" aria-labelledby="funding-sources-heading">
      <div>
        <p className="eyebrow">YOUR ACCOUNTS</p>
        <h2 id="funding-sources-heading">Accounts</h2>
        <p className="setup-intro">Add the banks, cards, wallets, or cash accounts you use for bills and spending.</p>
      </div>
      {loadError ? <p className="form-message form-error" role="alert">Accounts could not be loaded. Refresh the page and try again.</p> : null}
      <form className="funding-source-form" action={action}>
        <div className="funding-field">
          <label htmlFor="source-name">Account name</label>
          <input id="source-name" name="name" type="text" maxLength={80} placeholder="e.g. MariBank credit card" required />
        </div>
        <div className="funding-field">
          <label htmlFor="source-kind">Account type</label>
          <select id="source-kind" name="kind" value={kind} onChange={(event) => setKind(event.target.value as FundingSource["kind"])} required>
            <option value="bank">Bank</option>
            <option value="card">Credit card</option>
            <option value="loan">Loan</option>
            <option value="wallet">Digital wallet</option>
            <option value="cash">Cash</option>
            <option value="other">Other</option>
          </select>
        </div>
        {isCreditAccount ? <div className="funding-field">
          <label htmlFor="source-limit">{kind === "loan" ? "Original loan amount" : "Credit limit"}</label>
          <input id="source-limit" name="creditLimit" type="number" min="0" max="999999999.99" step="0.01" inputMode="decimal" placeholder="0.00" />
        </div> : null}
        <div className="funding-field">
          <label htmlFor="source-balance">{isCreditAccount ? "Current debt" : "Current balance"}</label>
          <input id="source-balance" name="currentBalance" type="number" min="0" max="999999999.99" step="0.01" inputMode="decimal" placeholder="0.00" />
        </div>
        {isCreditAccount ? <div className="funding-field">
          <label htmlFor="source-due-date">Payment due date</label>
          <input id="source-due-date" name="paymentDueDate" type="date" required />
        </div> : null}
        {state.error ? <p className="form-message form-error" role="alert">{state.error}</p> : null}
        {state.message ? <p className="form-message form-success" role="status">{state.message}</p> : null}
        <button className="button button-primary" type="submit" disabled={pending}>
          {pending ? "Saving..." : "Add account"}
        </button>
      </form>
      <div className="funding-source-list" aria-live="polite">
        {sources.length === 0 ? (
          <p className="funding-source-empty">No accounts yet. Add your first account above to start your plan.</p>
        ) : sources.map((source) => (
          <div className="funding-source-item" key={source.id}>
            <span className="funding-source-icon" aria-hidden="true"><WalletIcon size={18} /></span>
            <FundingSourceRow source={source} currencyCode={currencyCode} />
          </div>
        ))}
      </div>
    </section>
  );
}
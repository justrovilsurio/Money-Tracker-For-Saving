"use client";

import { useActionState } from "react";
import { createObligationAction, type ObligationState } from "./actions";

export type ObligationSourceOption = { id: string; name: string };

const initialState: ObligationState = {};

export function ObligationForm({ sources }: { sources: ObligationSourceOption[] }) {
  const [state, action, pending] = useActionState(createObligationAction, initialState);

  return (
    <form className="auth-form obligation-form" action={action}>
      <label htmlFor="funding-source">Account</label>
      <select id="funding-source" name="fundingSourceId" defaultValue="" required>
        <option value="" disabled>Select an account</option>
        {sources.map((source) => <option key={source.id} value={source.id}>{source.name}</option>)}
      </select>

      <label htmlFor="obligation-name">Payment name</label>
      <input id="obligation-name" name="name" type="text" maxLength={100} placeholder="e.g. UB Card bill" required />

      <label htmlFor="obligation-amount">Amount due (PHP)</label>
      <input id="obligation-amount" name="amount" type="number" min="0.01" max="999999999.99" step="0.01" inputMode="decimal" placeholder="0.00" required />

      <label htmlFor="due-date">Payment due date</label>
      <input id="due-date" name="dueDate" type="date" required />
      <small className="field-hint">Enter the due date for this specific payment. It can differ from the account’s overall payment date.</small>

      {state.error ? <p className="form-message form-error" role="alert">{state.error}</p> : null}
      {state.message ? <p className="form-message form-success" role="status">{state.message}</p> : null}
      <button className="button button-primary" type="submit" disabled={pending || sources.length === 0}>
        {pending ? "Saving payment…" : "Add payment"}
      </button>
    </form>
  );
}
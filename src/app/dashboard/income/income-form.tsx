"use client";

import { useActionState, useState } from "react";
import { saveCutoffIncomeAction, type CutoffIncomeState } from "./actions";

const initialState: CutoffIncomeState = {};

export function IncomeForm({ defaultCutoffDate }: { defaultCutoffDate: string }) {
  const [mode, setMode] = useState<"cutoff" | "monthly">("cutoff");
  const [state, action, pending] = useActionState(saveCutoffIncomeAction, initialState);
  const defaultMonth = defaultCutoffDate.slice(0, 7);

  return (
    <form className="auth-form income-form" action={action}>
      <label htmlFor="income-mode">How do you want to enter income?</label>
      <select id="income-mode" name="entryMode" value={mode} onChange={(event) => setMode(event.target.value as typeof mode)}>
        <option value="cutoff">Enter income for one cutoff</option>
        <option value="monthly">Enter monthly total and split in two</option>
      </select>
      {mode === "cutoff" ? <>
        <label htmlFor="cutoff-date">Pay cutoff date</label>
        <input id="cutoff-date" name="cutoffDate" type="date" defaultValue={defaultCutoffDate} required />
        <label htmlFor="income-amount">Income received (PHP)</label>
        <input id="income-amount" name="amount" type="number" min="0" max="999999999.99" step="0.01" inputMode="decimal" placeholder="0.00" required />
      </> : <>
        <label htmlFor="income-month">Income month</label>
        <input id="income-month" name="month" type="month" defaultValue={defaultMonth} required />
        <label htmlFor="monthly-income-amount">Total income received this month (PHP)</label>
        <input id="monthly-income-amount" name="monthlyAmount" type="number" min="0" max="999999999.99" step="0.01" inputMode="decimal" placeholder="40,000.00" required />
        <small className="field-hint">The total is split as evenly as possible between your two cutoffs.</small>
      </>}
      {state.error ? <p className="form-message form-error" role="alert">{state.error}</p> : null}
      {state.message ? <p className="form-message form-success" role="status">{state.message}</p> : null}
      <button className="button button-primary" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save income"}
      </button>
    </form>
  );
}

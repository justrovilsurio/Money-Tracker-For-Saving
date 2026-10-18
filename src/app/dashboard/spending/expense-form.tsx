"use client";

import { useActionState } from "react";
import { createExpenseAction, type ExpenseState } from "./actions";

const initialState: ExpenseState = {};

export function ExpenseForm({ defaultExpenseDate }: { defaultExpenseDate: string }) {
  const [state, action, pending] = useActionState(createExpenseAction, initialState);

  return (
    <form className="auth-form income-form spending-form" action={action}>
      <label htmlFor="expense-transaction">What did you spend on?</label>
      <input id="expense-transaction" name="transaction" type="text" maxLength={48} placeholder="e.g. Lunch, groceries, or commute" required />
      <label htmlFor="expense-amount">Amount (PHP)</label>
      <input id="expense-amount" name="amount" type="number" min="0.01" max="999999999.99" step="0.01" inputMode="decimal" placeholder="0.00" required />
      <label htmlFor="expense-date">Transaction date</label>
      <input id="expense-date" name="expenseDate" type="date" defaultValue={defaultExpenseDate} required />
      <small className="field-hint">Spending in the current cutoff period reduces Money Left to Spend. Bills already reserved on your overview are deducted there; don’t record those payments here again.</small>
      {state.error ? <p className="form-message form-error" role="alert">{state.error}</p> : null}
      {state.message ? <p className="form-message form-success" role="status">{state.message}</p> : null}
      <button className="button button-primary" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Add spending"}
      </button>
    </form>
  );
}

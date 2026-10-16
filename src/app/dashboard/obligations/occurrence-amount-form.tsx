"use client";

import { useActionState } from "react";
import { updateOccurrenceAmountAction, type ObligationState } from "./actions";

export function OccurrenceAmountForm({ occurrenceId, amountMinor }: { occurrenceId: string; amountMinor: number }) {
  const [state, action, pending] = useActionState<ObligationState, FormData>(updateOccurrenceAmountAction, {});
  return (
    <form className="occurrence-amount-form" action={action}>
      <input type="hidden" name="occurrenceId" value={occurrenceId} />
      <label>Amount due (PHP)
        <input name="amount" type="number" min="0.01" max="999999999.99" step="0.01" defaultValue={(Number(amountMinor) / 100).toFixed(2)} required />
      </label>
      {state.error ? <span className="form-message form-error" role="alert">{state.error}</span> : null}
      {state.message ? <span className="form-message form-success" role="status">{state.message}</span> : null}
      <button className="button button-outline button-small" type="submit" disabled={pending}>{pending ? "Saving…" : "Update due amount"}</button>
    </form>
  );
}

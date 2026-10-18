"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import PencilIcon from "@/components/ui/pencil-icon";
import TrashIcon from "@/components/ui/trash-icon";
import { deleteExpenseAction, updateExpenseAction, type ExpenseState } from "./actions";

const initialState: ExpenseState = {};

export function ExpenseRowActions({
  expenseId,
  transaction,
  amountMinor,
  expenseDate,
}: {
  expenseId: string;
  transaction: string;
  amountMinor: number;
  expenseDate: string;
}) {
  const [updateState, updateAction, isUpdating] = useActionState<ExpenseState, FormData>(updateExpenseAction, initialState);
  const [deleteState, deleteAction, isDeleting] = useActionState<ExpenseState, FormData>(deleteExpenseAction, initialState);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const deleteFormRef = useRef<HTMLFormElement>(null);
  const deleteDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = deleteDialogRef.current;
    if (!dialog) return;
    if (isConfirmingDelete && !dialog.open) dialog.showModal();
    if (!isConfirmingDelete && dialog.open) dialog.close();
  }, [isConfirmingDelete]);

  useEffect(() => {
    if (deleteState.message) setIsConfirmingDelete(false);
  }, [deleteState.message]);

  return (
    <>
      <button
        className="spending-edit-toggle"
        type="button"
        aria-label={`${isEditing ? "Close editor for" : "Edit"} ${transaction}`}
        aria-expanded={isEditing}
        aria-controls={`edit-${expenseId}`}
        title={isEditing ? "Close editor" : "Edit transaction"}
        onClick={() => setIsEditing((open) => !open)}
      >
        <PencilIcon size={17} aria-hidden="true" />
      </button>
      {isEditing ? <form id={`edit-${expenseId}`} className="auth-form spending-edit-form" action={updateAction}>
          <input type="hidden" name="expenseId" value={expenseId} />
          <div className="spending-edit-fields">
            <label htmlFor={`transaction-${expenseId}`}>Transaction
              <input id={`transaction-${expenseId}`} name="transaction" type="text" maxLength={48} defaultValue={transaction} required />
            </label>
            <label htmlFor={`amount-${expenseId}`}>Amount (PHP)
              <input id={`amount-${expenseId}`} name="amount" type="number" min="0.01" max="999999999.99" step="0.01" defaultValue={(Number(amountMinor) / 100).toFixed(2)} required />
            </label>
            <label htmlFor={`date-${expenseId}`}>Transaction date
              <input id={`date-${expenseId}`} name="expenseDate" type="date" defaultValue={expenseDate} required />
            </label>
          </div>
          {updateState.error ? <p className="form-message form-error" role="alert">{updateState.error}</p> : null}
          {updateState.message ? <p className="form-message form-success" role="status">{updateState.message}</p> : null}
          <button className="button button-primary button-small" type="submit" disabled={isUpdating}>
            {isUpdating ? "Saving…" : "Save changes"}
          </button>
        </form> : null}
      <form
        ref={deleteFormRef}
        className="spending-delete-form"
        action={deleteAction}
      >
        <input type="hidden" name="expenseId" value={expenseId} />
        <button
          className="button button-outline button-small spending-delete"
          type="button"
          aria-label={`Delete ${transaction}`}
          title="Delete transaction"
          disabled={isDeleting}
          onClick={() => setIsConfirmingDelete(true)}
        >
          <TrashIcon size={17} aria-hidden="true" />
        </button>
        {deleteState.error ? <span className="form-message form-error" role="alert">{deleteState.error}</span> : null}
      </form>
      <dialog
        ref={deleteDialogRef}
        className="spending-confirm-dialog"
        aria-labelledby={`delete-title-${expenseId}`}
        aria-describedby={`delete-description-${expenseId}`}
        onCancel={() => setIsConfirmingDelete(false)}
      >
        <div className="spending-confirm-mark" aria-hidden="true"><TrashIcon size={19} /></div>
        <p className="eyebrow">REMOVE TRANSACTION</p>
        <h2 id={`delete-title-${expenseId}`}>Delete “{transaction}”?</h2>
        <p id={`delete-description-${expenseId}`} className="spending-confirm-copy">
          This spending entry will be removed, and your cutoff estimate will be recalculated.
        </p>
        {deleteState.error ? <p className="form-message form-error" role="alert">{deleteState.error}</p> : null}
        <div className="spending-confirm-actions">
          <button className="button button-outline" type="button" onClick={() => setIsConfirmingDelete(false)} disabled={isDeleting}>
            Keep transaction
          </button>
          <button
            className="button button-danger"
            type="button"
            disabled={isDeleting}
            onClick={() => deleteFormRef.current?.requestSubmit()}
          >
            <TrashIcon size={16} aria-hidden="true" />
            {isDeleting ? "Deleting…" : "Delete transaction"}
          </button>
        </div>
      </dialog>
    </>
  );
}

import { useEffect, useRef } from 'react';

// Bootstrap modal markup driven by React state rather than Bootstrap's JS, so
// a re-render can never leave the backdrop stranded.
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = 'Delete',
  danger = true,
  busy = false,
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null);

  // Escape closes, and focus lands on the confirm button when it opens
  useEffect(() => {
    if (!open) return undefined;
    confirmRef.current?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape' && !busy) onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <>
      <div className="modal-backdrop fade show" />
      <div
        className="modal d-block"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget && !busy) onCancel();
        }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="panel p-4">
            <h2 className="serif fs-3 mb-3" id="confirm-title">
              {title}
            </h2>
            <p className="text-muted-gold mb-4">{body}</p>

            <div className="d-flex flex-column flex-sm-row justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-gold"
                onClick={onCancel}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                type="button"
                ref={confirmRef}
                className={danger ? 'btn btn-danger-gold' : 'btn btn-primary'}
                onClick={onConfirm}
                disabled={busy}
              >
                {busy ? 'Working…' : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

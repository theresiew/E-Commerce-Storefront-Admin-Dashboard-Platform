import { dangerButtonClass, secondaryButtonClass } from "../lib/ui";

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-950/55 p-4 backdrop-blur-sm" role="presentation">
      <div
        className="w-full max-w-lg rounded-[32px] border border-white/70 bg-sand-50 p-6 shadow-[0_30px_80px_rgba(9,15,31,0.35)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <h3 id="modal-title" className="text-2xl font-semibold text-ink-900">
          {title}
        </h3>
        <p className="mt-3 text-sm leading-7 text-ink-500">{message}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" className={secondaryButtonClass} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={dangerButtonClass}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

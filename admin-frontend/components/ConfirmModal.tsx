'use client'

type ConfirmModalProps = {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirmer",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-[var(--color-card)] rounded-xl shadow-xl max-w-sm w-full p-6">
        <h3 className="text-base font-semibold text-[var(--color-text-dark)] mb-2">{title}</h3>
        <p className="text-sm text-[var(--color-text-body)] mb-5">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-md text-[var(--color-text-body)] hover:bg-[var(--color-bg-alt)] transition cursor-pointer"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 hover:bg-red-700 text-white transition cursor-pointer"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
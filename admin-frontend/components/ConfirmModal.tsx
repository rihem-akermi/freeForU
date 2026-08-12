"use client";

import { Button } from "@/components/ui/UIComponents";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B162C]/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-[var(--color-border)]">
        <h3 className="font-serif text-lg font-bold text-[#0B162C] mb-2">{title}</h3>
        <p className="text-sm text-[#393D3A] mb-6 leading-relaxed">{message}</p>
        <div className="flex items-center justify-end gap-3">
          <Button variant="neutral" size="md" onClick={onCancel}>
            Annuler
          </Button>
          <Button variant="danger" size="md" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
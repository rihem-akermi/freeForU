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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <h3 className="mb-2 font-serif text-lg font-bold text-foreground">{title}</h3>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{message}</p>
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
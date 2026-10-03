"use client";
import { useState } from "react";
import { Button, Card, Textarea } from "@/components/ui/UIComponents";

interface AiRawInputModalProps {
  title: string;
  placeholder?: string;
  loading?: boolean;
  onSubmit: (rawInput: string) => void;
  onCancel: () => void;
}

export function AiRawInputModal({
  title,
  placeholder,
  loading = false,
  onSubmit,
  onCancel,
}: AiRawInputModalProps) {
  const [value, setValue] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-lg !p-6">
        <h3 className="mb-1 font-serif text-lg font-bold text-foreground">
          {title}
        </h3>
        <p className="mb-4 text-xs text-muted-foreground">
          Décrivez brièvement, avec vos propres mots — l'IA s'occupe de
          reformuler proprement.
        </p>

        <Textarea
          label="Votre description"
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          rows={4}
        />

        <div className="mt-5 flex items-center justify-end gap-3">
          <Button variant="neutral" onClick={onCancel}>
            Annuler
          </Button>
          <Button
            variant="primary"
            isLoading={loading}
            disabled={!value.trim()}
            onClick={() => onSubmit(value)}
          >
            Générer
          </Button>
        </div>
      </Card>
    </div>
  );
}
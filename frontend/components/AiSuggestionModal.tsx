"use client";
import { useState } from "react";
import { Button, Card, Input, Textarea } from "@/components/ui/UIComponents";

export interface AiSuggestionField {
  key: string;
  label: string;
  value: string;
  multiline?: boolean;
}

interface AiSuggestionModalProps {
  title: string;
  fields: AiSuggestionField[];
  onAccept: (values: Record<string, string>) => void;
  onCancel: () => void;
}

export function AiSuggestionModal({
  title,
  fields,
  onAccept,
  onCancel,
}: AiSuggestionModalProps) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((f) => [f.key, f.value])),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-lg !p-6">
        <h3 className="mb-1 font-serif text-lg font-bold text-foreground">
          {title}
        </h3>
        <p className="mb-4 text-xs text-muted-foreground">
          Résultat généré par l'IA — vérifiez et modifiez si besoin avant de
          valider.
        </p>

        <div className="space-y-4">
          {fields.map((f) =>
            f.multiline ? (
              <Textarea
                key={f.key}
                label={f.label}
                value={values[f.key]}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [f.key]: e.target.value }))
                }
              />
            ) : (
              <Input
                key={f.key}
                label={f.label}
                value={values[f.key]}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [f.key]: e.target.value }))
                }
              />
            ),
          )}
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          <Button variant="neutral" onClick={onCancel}>
            Annuler
          </Button>
          <Button variant="primary" onClick={() => onAccept(values)}>
            Utiliser ce résultat
          </Button>
        </div>
      </Card>
    </div>
  );
}
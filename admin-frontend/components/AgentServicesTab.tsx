"use client";

import { useEffect, useState } from "react";
import { getServicesByAgent } from "@/lib/api/services";
import { Card, Badge, Button } from "@/components/ui/UIComponents";
import { Service } from "@/lib/data";

const SERVICE_ACCENT = "#46607D";
export default function AgentServicesTab({
  agentId,
  onReserve,
  onCountChange,
}: {
  agentId: number;
  onReserve: (service: Service) => void;
  onCountChange?: (count: number) => void;
}) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServicesByAgent(agentId)
      .then((data) => {
        setServices(data);
        onCountChange?.(data.length);
      })
      .finally(() => setLoading(false));
  }, [agentId]);

  if (loading)
    return <p className="text-sm text-muted-foreground">Chargement...</p>;

  if (services.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Cet agent n'a pas encore ajouté de service.
      </p>
    );
  }

  return (
    <div>
      <p className="mb-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {services.length} service{services.length > 1 ? "s" : ""} disponible
        {services.length > 1 ? "s" : ""}
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {services.map((s) => (
          <Card
            key={s.id}
            className="flex flex-col gap-2 !p-5"
            style={{ borderLeft: `4px solid ${SERVICE_ACCENT}` }}
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-serif font-bold text-foreground">{s.nom}</h4>
              <Badge variant="info">
                {s.type_prix === "a_partir_de"
                  ? `À partir de ${s.prix} DT`
                  : `${s.prix} DT`}
              </Badge>
            </div>
            {s.description && (
              <p className="text-sm text-muted-foreground">{s.description}</p>
            )}
            {s.duree_estimee && (
              <p className="text-xs text-muted-foreground/70">
                ≈ {s.duree_estimee} min
              </p>
            )}
            <Button
              variant="primary"
              size="sm"
              className="mt-2"
              onClick={() => onReserve(s)}
            >
              Réserver
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

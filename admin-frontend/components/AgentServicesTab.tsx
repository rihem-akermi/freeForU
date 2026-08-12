"use client";

import { useEffect, useState } from "react";
import { getServicesByAgent } from "@/lib/api/services";
import { Card, Badge, Button } from "@/components/ui/UIComponents";
import { Service } from "@/lib/data";

export default function AgentServicesTab({
  agentId,
  onReserve,
}: {
  agentId: number;
  onReserve: (service: Service) => void;
}) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServicesByAgent(agentId)
      .then(setServices)
      .finally(() => setLoading(false));
  }, [agentId]);

  if (loading) return <p className="text-sm text-[#393D3A]">Chargement...</p>;

  if (services.length === 0) {
    return <p className="text-sm text-[#393D3A]">Cet agent n'a pas encore ajouté de service.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {services.map((s) => (
        <Card key={s.id} className="flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <h4 className="font-serif font-bold text-[#0B162C]">{s.nom}</h4>
            <Badge variant="info">
              {s.type_prix === "a_partir_de" ? `À partir de ${s.prix} DT` : `${s.prix} DT`}
            </Badge>
          </div>
          {s.description && <p className="text-sm text-[#393D3A]">{s.description}</p>}
          {s.duree_estimee && (
            <p className="text-xs text-[#393D3A]/70">≈ {s.duree_estimee} min</p>
          )}
          <Button variant="primary" size="sm" className="mt-2" onClick={() => onReserve(s)}>
            Réserver
          </Button>
        </Card>
      ))}
    </div>
  );
}
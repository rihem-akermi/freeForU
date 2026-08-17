
"use client";
import ServicesManager from "@/components/ServicesManager";
import { PageHeader } from "@/components/ui/UIComponents";

export default function AgentServicesPage() {
  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Mes Services"
        subtitle="Créez et gérez les services que vous proposez à vos clients."
      />
      <ServicesManager />
    </div>
  );
}
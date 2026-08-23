import Sidebar from "@/components/Sidebar";

const agentLinks = [
  { href: "/agent", label: "Vue d'ensemble" },
  { href: "/agent/infos", label: "Mes Infos" },
  { href: "/agent/publications", label: "Mes publications" },
  { href: "/agent/reservations", label: "Clients et réservations" },
  { href: "/agent/services", label: "Mes Services" },
  { href: "/agent/avis", label: "Avis Des Clients" },
  { href: "/agent/disponibilites", label: "Mon Agenda" },
];

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background md:flex">
      <Sidebar title="Espace Agent" links={agentLinks} />
      <main className="app-shell-main min-w-0 w-full flex-1">
        <div className="app-content-container">{children}</div>
      </main>
    </div>
  );
}

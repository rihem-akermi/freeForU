import Sidebar from "@/components/Sidebar";

const agentLinks = [
  { href: "/agent", label: "Vue d'ensemble" },
  { href: "/agent/infos", label: "Mes Infos" },
  { href: "/agent/publications", label: "Mes publications" },
  { href: "/agent/reservations", label: "Clients et réservations" },
  { href: "/agent/avis", label: "Les avis" },
];

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar title="Espace Agent" links={agentLinks} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
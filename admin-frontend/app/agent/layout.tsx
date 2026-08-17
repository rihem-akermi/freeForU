import Sidebar from "@/components/Sidebar";

const agentLinks = [
  { href: "/agent", label: "Vue d'ensemble" },
  { href: "/agent/infos", label: "Mes Infos" },
  { href: "/agent/publications", label: "Mes publications" },
  { href: "/agent/reservations", label: "Clients et réservations" },
  {href : "/agent/services", label:"Mes Services"},

  { href: "/agent/disponibilites", label: "Mon Agenda" },
];

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[var(--color-background-soft)]/40">
      <Sidebar title="Espace Agent" links={agentLinks} />
      <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 max-w-[1760px] w-full mx-auto">
        {children}
      </main>
    </div>
  );
}

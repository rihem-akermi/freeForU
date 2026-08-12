import Sidebar from "@/components/Sidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const links = [
    { label: "Accueil", href: "/client" },
    { label: "Mes réservations", href: "/client/reservations" },
    { label: "Mes infos", href: "/client/infos" },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--color-background-soft)]/40">
      <Sidebar title="Espace Client" links={links} />
      <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 max-w-[1760px] w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
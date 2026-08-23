import Sidebar from "@/components/Sidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const links = [
    { label: "Accueil", href: "/client" },
    { label: "Mes réservations", href: "/client/reservations" },
    { label: "Mes infos", href: "/client/infos" },
  ];

  return (
    <div className="min-h-screen bg-background md:flex">
      <Sidebar title="Espace Client" links={links} />
      <main className="app-shell-main min-w-0 w-full flex-1">
        <div className="app-content-container">{children}</div>
      </main>
    </div>
  );
}

import Sidebar from "@/components/Sidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const links = [
    { label: "Accueil", href: "/client" },
    { label: "Mes réservations", href: "/client/reservations" },
    { label: "Mes infos", href: "/client/infos" },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar title="Espace Client" links={links} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
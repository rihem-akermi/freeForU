import Sidebar from "@/components/Sidebar";

const adminLinks = [
  { href: "/admin", label: "Vue d'ensemble" },
  { href: "/admin/users", label: "Clients" },
  { href: "/admin/agents", label: "Agents" },
  { href: "/admin/reservations", label: "Réservations" },
  { href: "/admin/contacts", label: "Contacts" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/moderation", label: "Pubs / Reviews" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background md:flex">
      <Sidebar title="Admin" links={adminLinks} />
      <main className="app-shell-main min-w-0 w-full flex-1">
        <div className="app-content-container">{children}</div>
      </main>
    </div>
  );
}

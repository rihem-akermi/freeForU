import Sidebar from "@/components/Sidebar";

const adminLinks = [
  { href: "/admin", label: "Vue d'ensemble" },
  { href: "/admin/users", label: "Clients" },
  { href: "/admin/agents", label: "Agents" },
  { href: "/admin/reservations", label: "Réservations" },
  { href: "/admin/contacts", label: "Contacts" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar title="Admin" links={adminLinks} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
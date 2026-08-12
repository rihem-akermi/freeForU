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
    <div className="flex min-h-screen bg-[var(--color-background-soft)]/40">
      <Sidebar title="Admin" links={adminLinks} />
      <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 max-w-[1760px] w-full mx-auto">
        {children}
      </main>
    </div>
  );
}

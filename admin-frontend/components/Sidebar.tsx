import Link from "next/link";

const links = [
  { href: "/dashboard/admin", label: "Vue d'ensemble"},
  { href: "/dashboard/admin/users", label: "Utilisateurs" },
  { href: "/dashboard/admin/agents", label: "Agents" },
  { href: "/dashboard/admin/reservations", label: "Réservations" },
];

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-stone-200 bg-white p-4">
      <p className="mb-6 px-2 text-sm font-medium text-stone-500">Admin</p>
      <nav className="flex flex-col gap-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-md px-3 py-2 text-sm text-stone-700 hover:bg-stone-100"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

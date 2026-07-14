'use client'
import Link from "next/link";
import { logout } from "@/lib/api/auth";

const links = [
  { href: "/admin", label: "Vue d'ensemble"},
  { href: "/admin/users", label: "Utilisateurs" },
  { href: "/admin/agents", label: "Agents" },
  { href: "/admin/reservations", label: "Réservations" },
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
        <button onClick={logout} className="rounded-md px-2 py-2 text-sm text-stone-700 hover:bg-stone-100 text-left ">
          🚪 Déconnexion
        </button>
      </nav>
      
    </aside>
  );
}

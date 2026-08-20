"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/api/auth";

type SidebarLink = { href: string; label: string };
interface SidebarProps {
  title: string;
  links: SidebarLink[];
}

/* ── tiny chevron for toggle ─────────────────────────────────── */
function IcoMenu() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6h16M4 12h16M4 18h10"
      />
    </svg>
  );
}
function IcoClose() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}
function IcoLogout() {
  return (
    <svg
      className="w-4.5 h-4.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  );
}

export default function Sidebar({ title, links }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ── mobile top bar ─────────────────────────────────────── */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between px-5 py-3.5 bg-[#0B162C]">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="font-serif font-bold text-xl text-white tracking-tight">
            FreeFor<span className="text-[#9D8099]">U.</span>
          </span>
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-center w-9 h-9 rounded-xl text-white/70 hover:bg-white/10 transition"
          aria-label="Toggle menu"
        >
          {open ? <IcoClose /> : <IcoMenu />}
        </button>
      </div>

      {/* ── sidebar ────────────────────────────────────────────── */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-40 h-screen w-64 shrink-0
          bg-[#0B162C] flex flex-col
          transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* brand */}
        <div className="px-7 pt-8 pb-8 border-b border-white/[.07]">
          <Link href="/" className="flex items-center gap-3 mb-5 group">
            <div className="w-9 h-9 rounded-xl bg-[#9D8099]/20 ring-1 ring-[#9D8099]/30 flex items-center justify-center shrink-0">
              <span className="font-serif font-bold text-[#9D8099] text-base leading-none">
                F
              </span>
            </div>
            <span className="font-serif font-bold text-xl text-white tracking-tight group-hover:text-white/90 transition">
              FreeFor<span className="text-[#9D8099]">U.</span>
            </span>
          </Link>

          {/* role badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/[.06] px-3 py-1.5 ring-1 ring-white/10">
            <span className="h-1.5 w-1.5 rounded-full bg-[#9D8099]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/50">
              {title}
            </span>
          </div>
        </div>

        {/* nav */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`
                  relative flex items-center gap-3 rounded-xl px-4 py-3
                  text-[14px] font-semibold transition-all duration-200
                  ${
                    active
                      ? "bg-white/[.08] text-white"
                      : "text-white/45 hover:bg-white/[.05] hover:text-white/80"
                  }
                `}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-full bg-[#9D8099]" />
                )}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* footer */}
        <div className="px-4 pb-7 pt-4 border-t border-white/[.07]">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-semibold text-white/35 hover:bg-white/[.05] hover:text-rose-400 transition-all duration-200 text-left cursor-pointer"
          >
            <IcoLogout />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}
    </>
  );
}

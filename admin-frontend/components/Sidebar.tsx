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

export default function Sidebar({ title, links }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-white border-b border-[var(--color-border)] shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0B162C] text-white flex items-center justify-center font-bold text-sm">
            F
          </div>
          <span className="font-serif font-bold text-lg text-[#0B162C]">
            FreeForU<span className="text-[#9D8099]">.</span>
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-[#0B162C] hover:bg-[#EEECF2] rounded-lg transition"
          aria-label="Toggle Navigation Sidebar"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Desktop & Mobile Drawer Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 shrink-0 bg-white border-r border-[var(--color-border)] p-5 flex flex-col justify-between transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* Brand & Section Header */}
          <div className="mb-8 pt-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[#0B162C] text-white flex items-center justify-center font-bold text-base shadow-sm">
                F
              </div>
              <span className="font-serif font-bold text-xl text-[#0B162C] tracking-tight">
                FreeForU<span className="text-[#9D8099]">.</span>
              </span>
            </Link>
            <div className="px-3 py-1 rounded-full bg-[#EEECF2] text-[#291527] text-xs font-bold uppercase tracking-wider inline-block">
              {title}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {links.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-3 ${
                    isActive
                      ? "bg-[#0B162C] text-white shadow-sm"
                      : "text-[#393D3A] hover:bg-[#EEECF2]/80 hover:text-[#0B162C]"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-[#9D8099]" : "bg-transparent"}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout Button */}
        <div className="pt-4 border-t border-[var(--color-border)]">
          <button
            onClick={logout}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition flex items-center gap-2.5 text-left cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}
    </>
  );
}
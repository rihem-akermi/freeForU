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

function IcoMenu() {
  return <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h10" /></svg>;
}
function IcoClose() {
  return <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
}
function IcoLogout() {
  return <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
}
function IcoNav({ index }: { index: number }) {
  const paths = ["M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z", "M4 5h16M4 12h16M4 19h16", "M5 19V5m0 0l4 4m-4-4L1 9M19 5v14m0 0l-4-4m4 4l4-4", "M12 3v18m9-9H3", "M4 6h16v12H4zM8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01", "M5 4h14v16H5zM8 8h8M8 12h8M8 16h5", "M4 5h16v14H4zM8 9h8M8 13h5"]; 
  return <svg className="h-[19px] w-[19px] shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d={paths[index % paths.length]} /></svg>;
}

export default function Sidebar({ title, links }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isClient = title.toLowerCase().includes("client");
  const intro = isClient ? "Trouvez le bon service" : title.toLowerCase().includes("agent") ? "Gérez votre activité" : "Pilotez la plateforme";

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-sidebar-border bg-sidebar px-5 py-4 md:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="font-serif text-xl font-bold tracking-tight text-sidebar-foreground">FreeFor<span className="text-sidebar-primary">U.</span></span>
        </Link>
        <button onClick={() => setOpen(!open)} className="flex h-10 w-10 items-center justify-center rounded-xl text-sidebar-foreground/75 transition hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring" aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={open}>{open ? <IcoClose /> : <IcoMenu />}</button>
      </div>

      <aside className={`fixed md:sticky top-0 left-0 z-40 flex h-screen w-[286px] shrink-0 flex-col overflow-hidden bg-sidebar text-sidebar-foreground shadow-[12px_0_40px_-30px_hsl(var(--sidebar-foreground)/.55)] transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="relative border-b border-sidebar-border px-6 pb-7 pt-8" style={{ paddingInline: "1.5rem", paddingTop: "2rem", paddingBottom: "1.75rem" }}>
          <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-sidebar-primary/10 blur-3xl" />
          <Link href="/" className="group relative mb-7 flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20 transition-transform group-hover:-rotate-3"><span className="font-serif text-xl font-bold leading-none">F</span></div>
            <span className="font-serif text-[25px] font-bold tracking-tight text-sidebar-foreground transition group-hover:text-sidebar-primary">FreeFor<span className="text-sidebar-primary">U.</span></span>
          </Link>
          <div className="relative flex items-end justify-between gap-3">
            <div><p className="text-lg font-semibold tracking-tight text-sidebar-foreground">{title}</p></div>
            <span className="mb-1 h-2.5 w-2.5 rounded-full bg-sidebar-primary shadow-[0_0_0_5px_hsl(var(--sidebar-primary)/.12)]" />
          </div>
          <p className="mt-2 text-sm leading-5 text-sidebar-foreground/55">{intro}</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 py-6" style={{ paddingInline: "1.5rem", paddingBlock: "1.5rem" }} aria-label={`${title} navigation`}>
          <div className="space-y-2">
            {links.map((link, index) => {
              const active = pathname === link.href || (link.href !== "/admin" && link.href !== "/client" && link.href !== "/agent" && pathname.startsWith(`${link.href}/`));
              return <Link key={link.href} href={link.href} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined} className={`group relative flex items-center gap-3 rounded-xl px-3 py-3 text-base font-semibold leading-5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring ${active ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" : "text-sidebar-foreground/60 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"}`}>
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "bg-sidebar-foreground/5 text-sidebar-foreground/55 group-hover:bg-sidebar-primary/15 group-hover:text-sidebar-primary"}`}><IcoNav index={index} /></span>
                <span>{link.label}</span>{active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />}
              </Link>;
            })}
          </div>
        </nav>

        <div className="border-t border-sidebar-border px-6 pb-6 pt-6">
          <button onClick={logout} className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] font-semibold leading-5 text-sidebar-foreground/55 transition-colors duration-200 hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-foreground/5"><IcoLogout /></span>Déconnexion</button>
        </div>
      </aside>
      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-foreground/30 backdrop-blur-[3px] md:hidden" />}
    </>
  );
}

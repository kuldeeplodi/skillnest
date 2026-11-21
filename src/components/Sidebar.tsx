"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LayoutDashboard, LogOut, NotebookPen, Settings, Target, Timer } from "lucide-react";
import { logout } from "@/lib/auth-actions";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/skills", label: "Skills", icon: Target },
  { href: "/notes", label: "Notes", icon: NotebookPen },
  { href: "/reading", label: "Reading", icon: BookOpen },
  { href: "/focus", label: "Focus", icon: Timer },
];

export function Logo() {
  return (
    <span className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight text-white">
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-[13px] font-black text-accent-fg shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
        S
      </span>
      SkillNest
    </span>
  );
}

export default function Sidebar({ name, email }: { name: string; email: string }) {
  const path = usePathname();
  const initial = name.trim().charAt(0).toUpperCase() || "U";
  const isActive = (href: string) => path === href || path.startsWith(href + "/");

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-white/[0.06] bg-ink-900 px-4 py-5 lg:flex">
        <Link href="/dashboard" className="mb-8 px-2">
          <Logo />
        </Link>

        <div className="mb-2 px-2 text-[11px] font-medium uppercase tracking-wider text-zinc-600">Workspace</div>
        <nav className="flex flex-1 flex-col gap-0.5">
          {links.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  active ? "bg-white/[0.07] font-medium text-white" : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100"
                }`}
              >
                {active && <span className="absolute -left-4 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r bg-accent" />}
                <l.icon size={17} className={active ? "text-accent" : "text-zinc-500"} />
                {l.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/settings"
          className={`mb-3 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
            isActive("/settings") ? "bg-white/[0.07] text-white" : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100"
          }`}
        >
          <Settings size={17} className="text-zinc-500" /> Settings
        </Link>

        <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-2.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink-700 text-xs font-semibold text-zinc-200 ring-1 ring-white/10">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium text-white">{name}</div>
            <div className="truncate text-[11px] text-zinc-500">{email}</div>
          </div>
          <form action={logout}>
            <button aria-label="Log out" title="Log out" className="rounded-md p-1.5 text-zinc-500 hover:bg-white/10 hover:text-white">
              <LogOut size={15} />
            </button>
          </form>
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-white/[0.07] bg-ink-900/95 px-2 py-2 backdrop-blur lg:hidden">
        {[...links, { href: "/settings", label: "Settings", icon: Settings }].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1.5 text-[10.5px] font-medium ${
              isActive(l.href) ? "text-accent" : "text-zinc-500"
            }`}
          >
            <l.icon size={19} />
            {l.label}
          </Link>
        ))}
      </nav>
    </>
  );
}

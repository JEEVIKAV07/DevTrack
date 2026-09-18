"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Rocket, Ticket, Server, Activity,
  FileText, Settings, LogOut, X, Menu, Zap,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/deployments", label: "Deployments", icon: Rocket },
  { href: "/tickets", label: "Tickets", icon: Ticket },
  { href: "/environments", label: "Environments", icon: Server },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/reports", label: "Reports", icon: FileText },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-[#e2e8f0]">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#2563eb]">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-[#0f172a]">Eng Dashboard</span>
        </div>
        <button
          id="btn-mobile-menu"
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg text-[#475569] hover:bg-[#f8fafc]"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`
          fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-xl flex flex-col
          transition-transform duration-200 md:hidden
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#2563eb]">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#0f172a]">Engineering</p>
              <p className="text-[11px] text-[#475569]">Productivity Dashboard</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg text-[#94a3b8] hover:bg-[#f1f5f9]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? "bg-[#eff6ff] text-[#2563eb]"
                    : "text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a]"
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-[#2563eb]" : "text-[#94a3b8]"}`} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-2 py-3 border-t border-[#e2e8f0] space-y-0.5">
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${
              pathname === "/settings"
                ? "bg-[#eff6ff] text-[#2563eb]"
                : "text-[#475569] hover:bg-[#f8fafc]"
            }`}
          >
            <Settings className="w-5 h-5 text-[#94a3b8]" />
            Settings
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-[#dc2626] hover:bg-[#fff1f2] transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </div>
      </div>
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Rocket,
  Ticket,
  Server,
  Activity,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  Zap,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/deployments", label: "Deployments", icon: Rocket },
  { href: "/tickets", label: "Tickets", icon: Ticket },
  { href: "/environments", label: "Environments", icon: Server },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/reports", label: "Reports", icon: FileText },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <aside
      className={`
        sidebar flex flex-col h-full transition-all duration-200
        ${collapsed ? "w-16" : "w-64"}
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[#e2e8f0]">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#2563eb] shrink-0">
          <Zap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-[#0f172a] leading-tight truncate">
              Engineering
            </p>
            <p className="text-[11px] text-[#475569] leading-tight truncate">
              Productivity Dashboard
            </p>
          </div>
        )}
        <button
          id="sidebar-toggle"
          onClick={onToggle}
          className="ml-auto text-[#94a3b8] hover:text-[#475569] p-1 rounded-md hover:bg-[#f1f5f9] transition-colors"
          aria-label="Toggle sidebar"
        >
          {collapsed ? (
            <Menu className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {!collapsed && (
          <p className="px-3 py-1.5 text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">
            Main Menu
          </p>
        )}
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              id={`nav-${label.toLowerCase()}`}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? "bg-[#eff6ff] text-[#2563eb]"
                  : "text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a]"
                }
                ${collapsed ? "justify-center" : ""}
              `}
              title={collapsed ? label : undefined}
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${isActive ? "text-[#2563eb]" : "text-[#94a3b8]"}`}
              />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-2 py-3 border-t border-[#e2e8f0] space-y-0.5">
        <Link
          href="/settings"
          id="nav-settings"
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
            ${pathname === "/settings"
              ? "bg-[#eff6ff] text-[#2563eb]"
              : "text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a]"
            }
            ${collapsed ? "justify-center" : ""}
          `}
          title={collapsed ? "Settings" : undefined}
        >
          <Settings
            className={`w-5 h-5 shrink-0 ${
              pathname === "/settings" ? "text-[#2563eb]" : "text-[#94a3b8]"
            }`}
          />
          {!collapsed && "Settings"}
        </Link>
        <button
          id="btn-logout"
          onClick={handleSignOut}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
            text-[#475569] hover:bg-[#fff1f2] hover:text-[#dc2626] transition-colors
            ${collapsed ? "justify-center" : ""}
          `}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0 text-[#94a3b8]" />
          {!collapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
}

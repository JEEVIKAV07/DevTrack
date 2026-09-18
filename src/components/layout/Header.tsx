"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { RefreshCw, Bell, ChevronDown, LogOut, Settings } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  lastUpdated?: string;
}

export function Header({
  title,
  subtitle,
  onRefresh,
  isRefreshing = false,
  lastUpdated,
}: HeaderProps) {
  const { data: session } = useSession();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const userName = session?.user?.name ?? "User";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="bg-white border-b border-[#e2e8f0] px-6 py-4 flex items-center justify-between shrink-0">
      {/* Left: Title & subtitle */}
      <div>
        <h1 className="text-xl font-bold text-[#0f172a]">{title}</h1>
        {subtitle && (
          <p className="text-sm text-[#475569] mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Right: Actions & profile */}
      <div className="flex items-center gap-3">
        {/* Date/Time */}
        <div className="hidden md:flex flex-col items-end">
          <span className="text-xs font-medium text-[#0f172a]">{timeStr}</span>
          <span className="text-xs text-[#94a3b8]">{dateStr}</span>
        </div>

        {/* Last updated */}
        {lastUpdated && (
          <div className="hidden lg:flex items-center gap-2 text-xs text-[#475569] bg-[#f8fafc] px-3 py-1.5 rounded-full border border-[#e2e8f0]">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" />
              Live
            </span>
            <span>Updated {lastUpdated}</span>
          </div>
        )}

        {/* Refresh */}
        {onRefresh && (
          <button
            id="btn-refresh"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#475569] bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] hover:border-[#cbd5e1] transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}

        {/* Notifications placeholder */}
        <button
          id="btn-notifications"
          className="relative p-2 text-[#94a3b8] hover:text-[#475569] hover:bg-[#f8fafc] rounded-lg transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ef4444] rounded-full"></span>
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            id="btn-user-menu"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-[#f8fafc] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#2563eb] flex items-center justify-center text-white text-xs font-semibold">
              {userInitials}
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-sm font-medium text-[#0f172a] leading-tight">
                {userName}
              </span>
              <span className="text-xs text-[#94a3b8] leading-tight capitalize">
                {(session?.user as { role?: string })?.role?.toLowerCase() ?? "engineer"}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-[#94a3b8] transition-transform ${
                userMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown */}
          {userMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setUserMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-[#e2e8f0] rounded-xl shadow-[0_10px_15px_-3px_rgb(0_0_0/0.1)] z-20 py-1 overflow-hidden">
                <div className="px-4 py-3 border-b border-[#f1f5f9]">
                  <p className="text-sm font-semibold text-[#0f172a]">{userName}</p>
                  <p className="text-xs text-[#94a3b8] truncate">
                    {session?.user?.email}
                  </p>
                </div>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a] transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#dc2626] hover:bg-[#fff1f2] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

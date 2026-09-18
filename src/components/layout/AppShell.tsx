"use client";

import { ReactNode, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Header } from "@/components/layout/Header";

interface AppShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  lastUpdated?: string;
}

export function AppShell({
  title,
  subtitle,
  children,
  onRefresh,
  isRefreshing = false,
  lastUpdated,
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      <div className="flex min-h-screen">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <MobileNav />
          <Header
            title={title}
            subtitle={subtitle}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
            lastUpdated={lastUpdated}
          />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

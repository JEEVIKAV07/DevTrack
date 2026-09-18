"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ShieldCheck, Users, Bell } from "lucide-react";

export default function SettingsPage() {
  return (
    <AppShell title="Settings" subtitle="Workspace preferences and operational controls.">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-[#eff6ff] p-2 text-[#2563eb]"><ShieldCheck className="h-4 w-4" /></div>
            <p className="text-sm font-semibold text-[#0f172a]">Access controls</p>
          </div>
          <p className="text-sm text-[#475569]">Role-based permissions are configured for engineering managers and reviewers.</p>
        </div>

        <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-[#eff6ff] p-2 text-[#2563eb]"><Users className="h-4 w-4" /></div>
            <p className="text-sm font-semibold text-[#0f172a]">Team configuration</p>
          </div>
          <p className="text-sm text-[#475569]">Define default owners and notification routing for product, platform, and backend squads.</p>
        </div>

        <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-[#eff6ff] p-2 text-[#2563eb]"><Bell className="h-4 w-4" /></div>
            <p className="text-sm font-semibold text-[#0f172a]">Alert preferences</p>
          </div>
          <p className="text-sm text-[#475569]">Set thresholds for deployment failure, ticket backlog, and environment health notifications.</p>
        </div>
      </div>
    </AppShell>
  );
}

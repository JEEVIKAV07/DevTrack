"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ShieldCheck, Users, Bell, Activity, RefreshCw } from "lucide-react";
import { ErrorState } from "@/components/ui/EmptyState";

interface SettingsData {
  access?: { role: string; authenticated: boolean };
  integrations?: Array<{ name: string; status: string; detail: string }>;
  refreshIntervals?: Record<string, string>;
  generatedAt?: string;
}

export default function SettingsPage() {
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/settings", { cache: "no-store" });
      const json = await response.json();
      if (!response.ok || json.status !== "success") throw new Error(json.error ?? "Unable to load workspace settings.");
      setData(json.data); setError("");
    } catch (fetchError) { setError(fetchError instanceof Error ? fetchError.message : "Unable to load workspace settings."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(() => void fetchSettings(), 0);
    const timer = window.setInterval(() => void fetchSettings(), 60000);
    return () => { window.clearTimeout(initial); window.clearInterval(timer); };
  }, [fetchSettings]);

  return (
    <AppShell title="Settings" subtitle="Workspace preferences and operational controls." onRefresh={fetchSettings} isRefreshing={loading} lastUpdated={data?.generatedAt ? new Date(data.generatedAt).toLocaleTimeString() : undefined}>
      <div className="space-y-6">
        {error ? <ErrorState title="Settings unavailable" description={error} onRetry={fetchSettings} /> : (
        <>
        <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-[#eff6ff] p-2 text-[#2563eb]"><ShieldCheck className="h-4 w-4" /></div>
            <p className="text-sm font-semibold text-[#0f172a]">Access controls</p>
          </div>
          <p className="text-sm text-[#475569]">Signed in as <span className="font-semibold text-[#0f172a]">{data?.access?.role ?? "Loading"}</span>. Role-based permissions are active for this workspace.</p>
        </div>

        <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-[#eff6ff] p-2 text-[#2563eb]"><Users className="h-4 w-4" /></div>
            <p className="text-sm font-semibold text-[#0f172a]">Team configuration</p>
          </div>
          <p className="text-sm text-[#475569]">Teams, ownership, and routing are represented in the live Teams and Incidents views.</p>
        </div>

        <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-[#eff6ff] p-2 text-[#2563eb]"><Bell className="h-4 w-4" /></div>
            <p className="text-sm font-semibold text-[#0f172a]">Alert preferences</p>
          </div>
          <p className="text-sm text-[#475569]">Incident detection is active for critical tickets and warning or critical environments.</p>
        </div>
      </div>
      <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-3"><div className="rounded-lg bg-[#eff6ff] p-2 text-[#2563eb]"><Activity className="h-4 w-4" /></div><div><p className="text-sm font-semibold text-[#0f172a]">Live system status</p><p className="text-xs text-[#64748b]">Integration and refresh state from the backend</p></div></div><div className="grid gap-3 md:grid-cols-3">{(data?.integrations ?? []).map((integration) => <div key={integration.name} className="rounded-xl border border-[#f1f5f9] p-4"><div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-[#0f172a]">{integration.name}</p><span className="rounded-full bg-[#f0fdf4] px-2 py-1 text-[10px] font-semibold text-[#15803d]">{integration.status}</span></div><p className="mt-2 text-xs text-[#64748b]">{integration.detail}</p></div>)}</div></div>
      <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-3"><div className="rounded-lg bg-[#eff6ff] p-2 text-[#2563eb]"><RefreshCw className="h-4 w-4" /></div><p className="text-sm font-semibold text-[#0f172a]">Refresh policy</p></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{Object.entries(data?.refreshIntervals ?? {}).map(([name, interval]) => <div key={name} className="rounded-lg bg-[#f8fafc] p-3"><p className="text-xs capitalize text-[#64748b]">{name}</p><p className="mt-1 text-sm font-semibold text-[#0f172a]">{interval}</p></div>)}</div></div>
        </>
        )}
      </div>
    </AppShell>
  );
}

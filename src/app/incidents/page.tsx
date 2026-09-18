"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Clock3, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface Incident { id: string; title: string; source: string; severity: string; status: string; owner: string; updatedAt: string }
interface IncidentData { incidents?: Incident[]; generatedAt?: string }

export default function IncidentsPage() {
  const [data, setData] = useState<IncidentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/incidents?range=30d", { cache: "no-store" });
      const json = await response.json();
      if (!response.ok || json.status !== "success") throw new Error(json.error ?? "Unable to load incident data.");
      setData(json.data); setError("");
    } catch (fetchError) { setError(fetchError instanceof Error ? fetchError.message : "Unable to load incident data."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { const initial = window.setTimeout(() => void fetchIncidents(), 0); const timer = window.setInterval(() => void fetchIncidents(), 15000); return () => { window.clearTimeout(initial); window.clearInterval(timer); }; }, [fetchIncidents]);
  const incidents = data?.incidents ?? [];
  const generatedAt = data?.generatedAt ? new Date(data.generatedAt).getTime() : 0;
  return <AppShell title="Incidents" subtitle="A live queue of service risks, critical tickets, and environment alerts." onRefresh={fetchIncidents} isRefreshing={loading} lastUpdated={data?.generatedAt ? new Date(data.generatedAt).toLocaleTimeString() : undefined}>
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3"><Summary label="Active incidents" value={incidents.length} icon={ShieldAlert} tone="red" /><Summary label="Critical" value={incidents.filter((incident) => incident.severity === "CRITICAL").length} icon={AlertTriangle} tone="amber" /><Summary label="Updated recently" value={incidents.filter((incident) => generatedAt - new Date(incident.updatedAt).getTime() < 3600000).length} icon={Clock3} tone="blue" /></div>
      {error ? <ErrorState title="Incident feed unavailable" description={error} onRetry={fetchIncidents} /> : loading && !data ? <div className="h-64 animate-pulse rounded-2xl bg-[#e2e8f0]" /> : incidents.length ? <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm"><div className="mb-4"><p className="text-sm font-semibold text-[#0f172a]">Active operational risks</p><p className="text-xs text-[#64748b]">Automatically refreshed every 15 seconds</p></div><div className="space-y-3">{incidents.map((incident) => <div key={incident.id} className="flex flex-col gap-3 rounded-xl border border-[#f1f5f9] p-4 md:flex-row md:items-center md:justify-between"><div className="flex items-start gap-3"><div className="mt-0.5 rounded-lg bg-[#fff7ed] p-2 text-[#ea580c]"><AlertTriangle className="h-4 w-4" /></div><div><p className="font-medium text-[#0f172a]">{incident.title}</p><p className="mt-1 text-xs text-[#64748b]">{incident.source} · Owner: {incident.owner}</p></div></div><div className="flex items-center gap-3"><StatusBadge label={incident.severity} variant={incident.severity === "CRITICAL" ? "danger" : "warning"} dot /><span className="text-xs text-[#64748b]">{new Date(incident.updatedAt).toLocaleTimeString()}</span></div></div>)}</div></div> : <EmptyState title="No active incidents" description="All monitored systems and critical queues are currently clear." />}
    </div>
  </AppShell>;
}

function Summary({ label, value, icon: Icon, tone }: { label: string; value: number; icon: typeof ShieldAlert; tone: "red" | "amber" | "blue" }) {
  const colors = { red: "bg-[#fff1f2] text-[#dc2626]", amber: "bg-[#fffbeb] text-[#d97706]", blue: "bg-[#eff6ff] text-[#2563eb]" };
  return <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">{label}</p><div className={`rounded-lg p-2 ${colors[tone]}`}><Icon className="h-4 w-4" /></div></div><p className="mt-3 text-2xl font-bold text-[#0f172a]">{value}</p></div>;
}
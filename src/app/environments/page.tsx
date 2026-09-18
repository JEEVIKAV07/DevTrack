"use client";

import { useEffect, useState } from "react";
import { Activity, Gauge, ServerCog } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { EnvironmentHealthChart } from "@/components/charts/Charts";
import { HealthStatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";

interface EnvironmentRecord {
  id: string;
  name: string;
  status: "HEALTHY" | "WARNING" | "CRITICAL" | "UNKNOWN";
  cpu: number;
  memory: number;
  disk: number;
  responseTime: number;
  uptime: number;
  lastChecked: string;
}

interface EnvironmentSummaryData {
  healthy: number;
  warning: number;
  critical: number;
  total: number;
}

interface EnvironmentPageData {
  summary?: EnvironmentSummaryData;
  environments?: EnvironmentRecord[];
}

export default function EnvironmentsPage() {
  const [data, setData] = useState<EnvironmentPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/environments", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok || json.status !== "success") {
          throw new Error(json.error ?? "Unable to load environment data.");
        }
        setData(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load environment data.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (error) {
    return (
      <AppShell title="Environments" subtitle="Infrastructure health and performance across the release chain.">
        <ErrorState title="Environment data unavailable" description={error} onRetry={() => window.location.reload()} />
      </AppShell>
    );
  }

  return (
    <AppShell title="Environments" subtitle="Infrastructure health and performance across the release chain.">
      <div className="space-y-6">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-32 animate-pulse rounded-2xl bg-[#e2e8f0]" />
            ))}
          </div>
        ) : data ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">Healthy</p>
                  <div className="rounded-lg bg-[#dcfce7] p-2 text-[#16a34a]"><ServerCog className="h-4 w-4" /></div>
                </div>
                <p className="text-2xl font-bold text-[#0f172a]">{data.summary?.healthy ?? 0}</p>
                <p className="mt-1 text-xs text-[#64748b]">Operational environments</p>
              </div>
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">Warning</p>
                  <div className="rounded-lg bg-[#fef3c7] p-2 text-[#d97706]"><Gauge className="h-4 w-4" /></div>
                </div>
                <p className="text-2xl font-bold text-[#0f172a]">{data.summary?.warning ?? 0}</p>
                <p className="mt-1 text-xs text-[#64748b]">Need attention</p>
              </div>
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">Critical</p>
                  <div className="rounded-lg bg-[#ffe4e6] p-2 text-[#dc2626]"><Activity className="h-4 w-4" /></div>
                </div>
                <p className="text-2xl font-bold text-[#0f172a]">{data.summary?.critical ?? 0}</p>
                <p className="mt-1 text-xs text-[#64748b]">Service-impacting</p>
              </div>
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">Total</p>
                  <div className="rounded-lg bg-[#eff6ff] p-2 text-[#2563eb]"><ServerCog className="h-4 w-4" /></div>
                </div>
                <p className="text-2xl font-bold text-[#0f172a]">{data.summary?.total ?? 0}</p>
                <p className="mt-1 text-xs text-[#64748b]">Tracked environments</p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
              <div className="mb-4">
                <p className="text-sm font-semibold text-[#0f172a]">Environment performance</p>
                <p className="text-xs text-[#64748b]">CPU, memory, and disk utilization</p>
              </div>
              <EnvironmentHealthChart data={(data.environments ?? []).map((env: EnvironmentRecord) => ({ name: env.name, cpu: env.cpu, memory: env.memory, disk: env.disk }))} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {(data.environments ?? []).map((env: EnvironmentRecord) => (
                <div key={env.id} className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-base font-semibold text-[#0f172a]">{env.name}</p>
                      <p className="text-xs text-[#64748b]">Last checked {new Date(env.lastChecked).toLocaleTimeString()}</p>
                    </div>
                    <HealthStatusBadge status={env.status} />
                  </div>

                  <div className="space-y-3 text-sm text-[#475569]">
                    <div className="flex items-center justify-between"><span>CPU</span><span>{env.cpu}%</span></div>
                    <div className="flex items-center justify-between"><span>Memory</span><span>{env.memory}%</span></div>
                    <div className="flex items-center justify-between"><span>Disk</span><span>{env.disk}%</span></div>
                    <div className="flex items-center justify-between"><span>Response time</span><span>{env.responseTime} ms</span></div>
                    <div className="flex items-center justify-between"><span>Uptime</span><span>{env.uptime}%</span></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <EmptyState title="No environment data" description="Environment telemetry has not been returned yet." />
        )}
      </div>
    </AppShell>
  );
}

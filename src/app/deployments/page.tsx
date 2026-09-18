"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Clock3, Gauge, Rocket } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";

const RANGE_OPTIONS = ["today", "7d", "30d", "90d"];

interface DeploymentRecord {
  id: string;
  application: string;
  version: string;
  environment: string;
  developer: string;
  status: "SUCCESS" | "FAILED" | "IN_PROGRESS" | "ROLLED_BACK" | "PENDING";
  duration: number;
}

interface DeploymentSummaryData {
  total: number;
  successful: number;
  failed: number;
  avgDuration: number;
  successRate: number;
}

interface DeploymentPageData {
  summary?: DeploymentSummaryData;
  deployments?: DeploymentRecord[];
}

function SummaryCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof ArrowRight;
}) {
  return (
    <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">{label}</p>
        <div className="rounded-lg bg-[#eff6ff] p-2 text-[#2563eb]">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-[#0f172a]">{value}</p>
      <p className="mt-1 text-xs text-[#64748b]">{hint}</p>
    </div>
  );
}

export default function DeploymentsPage() {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState<DeploymentPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/deployments?range=${range}&pageSize=10`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok || json.status !== "success") {
          throw new Error(json.error ?? "Unable to load deployment data.");
        }
        setData(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load deployment data.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [range]);

  if (error) {
    return (
      <AppShell title="Deployments" subtitle="Release health and delivery outcomes across environments.">
        <ErrorState title="Deployment data unavailable" description={error} onRetry={() => window.location.reload()} />
      </AppShell>
    );
  }

  return (
    <AppShell title="Deployments" subtitle="Release health and delivery outcomes across environments.">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {RANGE_OPTIONS.map((item) => (
            <button
              key={item}
              onClick={() => setRange(item)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                range === item
                  ? "border-[#2563eb] bg-[#eff6ff] text-[#2563eb]"
                  : "border-[#e2e8f0] bg-white text-[#475569]"
              }`}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-28 animate-pulse rounded-2xl bg-[#e2e8f0]" />
            ))}
          </div>
        ) : data ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard label="Total" value={String(data.summary?.total ?? 0)} hint="Releases in selected range" icon={Rocket} />
              <SummaryCard label="Successful" value={String(data.summary?.successful ?? 0)} hint={`${data.summary?.successRate ?? 0}% success rate`} icon={CheckCircle2} />
              <SummaryCard label="Failed" value={String(data.summary?.failed ?? 0)} hint="Intervention required" icon={Gauge} />
              <SummaryCard label="Avg duration" value={`${Math.round((data.summary?.avgDuration ?? 0) / 60)} min`} hint="Across completed deploys" icon={Clock3} />
            </div>

            <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#0f172a]">Recent deployments</p>
                  <p className="text-xs text-[#64748b]">Latest release events and outcomes</p>
                </div>
              </div>

              {data.deployments?.length ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#e2e8f0] text-[#64748b]">
                        <th className="py-2 pr-4 font-medium">Application</th>
                        <th className="py-2 pr-4 font-medium">Version</th>
                        <th className="py-2 pr-4 font-medium">Environment</th>
                        <th className="py-2 pr-4 font-medium">Developer</th>
                        <th className="py-2 pr-4 font-medium">Status</th>
                        <th className="py-2 pr-4 font-medium">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.deployments.map((item: DeploymentRecord) => (
                        <tr key={item.id} className="border-b border-[#f1f5f9]">
                          <td className="py-3 pr-4 font-medium text-[#0f172a]">{item.application}</td>
                          <td className="py-3 pr-4 text-[#475569]">{item.version}</td>
                          <td className="py-3 pr-4 text-[#475569]">{item.environment}</td>
                          <td className="py-3 pr-4 text-[#475569]">{item.developer}</td>
                          <td className="py-3 pr-4">
                            <StatusBadge
                              label={item.status.replace("_", " ")}
                              variant={
                                item.status === "SUCCESS"
                                  ? "success"
                                  : item.status === "FAILED"
                                    ? "danger"
                                    : item.status === "IN_PROGRESS"
                                      ? "info"
                                      : "warning"
                              }
                              dot
                            />
                          </td>
                          <td className="py-3 pr-4 text-[#475569]">{Math.round(item.duration / 60)} min</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState title="No deployment records" description="No release activity matches the selected period." />
              )}
            </div>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}

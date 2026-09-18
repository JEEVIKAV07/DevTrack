"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, FileText, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState } from "@/components/ui/EmptyState";

const RANGE_OPTIONS = ["7d", "30d", "90d"];

interface ReportEnvironment {
  status: "HEALTHY" | "WARNING" | "CRITICAL" | "UNKNOWN";
  name: string;
}

interface ReportPageData {
  deployments?: { total: number; successRate: number };
  tickets?: { open: number };
  environments?: ReportEnvironment[];
  activity?: {
    totalCommits: number;
    totalPullRequests: number;
    totalCodeReviews: number;
    totalIssuesResolved: number;
  };
  generatedAt?: string;
  filters?: {
    environment?: string;
    team?: string;
  };
}

function SummaryCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">{label}</p>
      <p className="mt-3 text-2xl font-bold text-[#0f172a]">{value}</p>
      <p className="mt-1 text-xs text-[#64748b]">{hint}</p>
    </div>
  );
}

export default function ReportsPage() {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState<ReportPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/reports?range=${range}`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok || json.status !== "success") {
          throw new Error(json.error ?? "Unable to load report data.");
        }
        setData(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load report data.");
      } finally {
        setLoading(false);
      }
  }, [range]);

  useEffect(() => {
    const initial = window.setTimeout(() => void fetchData(), 0);
    const timer = window.setInterval(() => void fetchData(), 60000);
    return () => { window.clearTimeout(initial); window.clearInterval(timer); };
  }, [fetchData]);

  async function exportCsv() {
    const res = await fetch(`/api/reports?range=${range}&format=csv`, { cache: "no-store" });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `engineering-report-${range}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  if (error) {
    return (
      <AppShell title="Reports" subtitle="Operational exports and summary reporting for engineering stakeholders." onRefresh={fetchData} isRefreshing={loading}>
        <ErrorState title="Report data unavailable" description={error} onRetry={() => window.location.reload()} />
      </AppShell>
    );
  }

  return (
    <AppShell title="Reports" subtitle="Operational exports and summary reporting for engineering stakeholders." onRefresh={fetchData} isRefreshing={loading}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
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
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-3 py-2 text-sm font-medium text-white hover:bg-[#1d4ed8]"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
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
              <SummaryCard label="Deployments" value={String(data.deployments?.total ?? 0)} hint="Release count" />
              <SummaryCard label="Success rate" value={`${data.deployments?.successRate ?? 0}%`} hint="Reliable delivery" />
              <SummaryCard label="Open tickets" value={String(data.tickets?.open ?? 0)} hint="Needs triage" />
              <SummaryCard label="Healthy envs" value={String((data.environments ?? []).filter((env: ReportEnvironment) => env.status === "HEALTHY").length)} hint="Within SLA" />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#2563eb]" />
                  <p className="text-sm font-semibold text-[#0f172a]">Report overview</p>
                </div>
                <div className="space-y-3 text-sm text-[#475569]">
                  <div className="flex items-center justify-between"><span>Generated</span><span>{data.generatedAt ? new Date(data.generatedAt).toLocaleString() : "Not available"}</span></div>
                  <div className="flex items-center justify-between"><span>Environment focus</span><span>{data.filters?.environment ?? "All"}</span></div>
                  <div className="flex items-center justify-between"><span>Team focus</span><span>{data.filters?.team ?? "All"}</span></div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[#16a34a]" />
                  <p className="text-sm font-semibold text-[#0f172a]">Delivery summary</p>
                </div>
                <div className="space-y-3 text-sm text-[#475569]">
                  <div className="flex items-center justify-between"><span>Commits</span><span>{data.activity?.totalCommits ?? 0}</span></div>
                  <div className="flex items-center justify-between"><span>PRs</span><span>{data.activity?.totalPullRequests ?? 0}</span></div>
                  <div className="flex items-center justify-between"><span>Reviews</span><span>{data.activity?.totalCodeReviews ?? 0}</span></div>
                  <div className="flex items-center justify-between"><span>Issues resolved</span><span>{data.activity?.totalIssuesResolved ?? 0}</span></div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}

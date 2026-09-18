"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Gauge,
  ServerCog,
  ShieldAlert,
  Ticket,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { KPICard } from "@/components/dashboard/KPICard";
import {
  ActivityTrendChart,
  DeploymentTrendChart,
  TicketVolumeChart,
} from "@/components/charts/Charts";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState, ErrorState, WarningBanner } from "@/components/ui/EmptyState";
import { SkeletonChart, SkeletonKPIRow } from "@/components/ui/Skeleton";
import type {
  ActivityTrend,
  DashboardKPIs,
  DeploymentTrend,
  TicketVolumeTrend,
} from "@/types";

interface DashboardData {
  metrics: DashboardKPIs;
  deploymentTrend: DeploymentTrend[];
  ticketTrend: TicketVolumeTrend[];
  activityTrend: ActivityTrend[];
  recentDeployments: Array<{
    id: string;
    application: string;
    version: string;
    environment: string;
    developer: string;
    deployedAt: string;
    duration: number;
    status: string;
  }>;
}

function getDateLabel(value: string | undefined) {
  if (!value) return "just now";
  const diff = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff} min ago`;
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)} days ago`;
}

const LIVE_REFRESH_MS = 30000;

export default function DashboardPage() {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [dashboardRes, deploymentsRes, ticketsRes, activityRes] = await Promise.all([
        fetch(`/api/dashboard?range=${range}`, { cache: "no-store" }),
        fetch(`/api/deployments?range=${range}&view=trend&pageSize=5`, { cache: "no-store" }),
        fetch(`/api/tickets?range=${range}&view=trend&pageSize=5`, { cache: "no-store" }),
        fetch(`/api/activity?range=${range}&view=trend&pageSize=5`, { cache: "no-store" }),
      ]);

      const dashboardJson = await dashboardRes.json();
      if (!dashboardRes.ok || dashboardJson.status !== "success") {
        throw new Error(dashboardJson.error ?? "Unable to load dashboard data.");
      }

      const deploymentsTrendJson = await deploymentsRes.json();
      const ticketsTrendJson = await ticketsRes.json();
      const activityTrendJson = await activityTrendJsonResponse(activityRes);

      const recentDeploymentsRes = await fetch(`/api/deployments?range=${range}&pageSize=5`, { cache: "no-store" });
      const recentDeploymentsJson = await recentDeploymentsRes.json();

      setWarnings(dashboardJson.warnings ?? []);
      setData({
        metrics: dashboardJson.data,
        deploymentTrend: deploymentsTrendJson?.data ?? [],
        ticketTrend: ticketsTrendJson?.data ?? [],
        activityTrend: activityTrendJson ?? [],
        recentDeployments: recentDeploymentsJson?.data?.deployments ?? [],
      });
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load dashboard data.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    const initialFetchTimer = window.setTimeout(() => {
      void fetchDashboard();
    }, 0);

    const refreshTimer = window.setInterval(() => {
      void fetchDashboard();
    }, LIVE_REFRESH_MS);

    return () => {
      window.clearTimeout(initialFetchTimer);
      window.clearInterval(refreshTimer);
    };
  }, [fetchDashboard]);

  const metrics = data?.metrics;

  return (
    <AppShell
      title="Engineering Productivity Dashboard"
      subtitle="Overview of deployment health, delivery velocity, and engineering activity"
      onRefresh={fetchDashboard}
      isRefreshing={loading}
      lastUpdated={metrics ? getDateLabel(metrics.lastUpdated) : undefined}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: "Today", value: "today" },
              { label: "7D", value: "7d" },
              { label: "30D", value: "30d" },
              { label: "90D", value: "90d" },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setRange(item.value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  range === item.value
                    ? "border-[#2563eb] bg-[#eff6ff] text-[#2563eb]"
                    : "border-[#e2e8f0] bg-white text-[#475569] hover:bg-[#f8fafc]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm text-[#475569]">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#dcfce7] bg-[#f0fdf4] px-2.5 py-1 text-[#15803d]">
              <span className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" />
              Live data stream
            </span>
            <span className="hidden md:inline text-xs text-[#64748b]">Auto-refresh every 30s</span>
          </div>
        </div>

        {warnings.length > 0 && warnings.map((warning) => <WarningBanner key={warning} message={warning} />)}

        {loading && !data ? (
          <div className="space-y-4">
            <SkeletonKPIRow />
            <div className="grid gap-4 md:grid-cols-2">
              <SkeletonChart />
              <SkeletonChart />
            </div>
          </div>
        ) : error ? (
          <ErrorState title="Unable to load dashboard data" description={error} onRetry={fetchDashboard} />
        ) : metrics ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <KPICard
                title="Total Deployments"
                value={metrics.deployments.total}
                description="Across all environments"
                trend={12.4}
                trendLabel="vs last period"
                icon={ArrowRight}
                iconColor="#2563eb"
                iconBg="#eff6ff"
                status="neutral"
              />
              <KPICard
                title="Successful Deployments"
                value={metrics.deployments.successful}
                description="Completed successfully"
                trend={11.2}
                trendLabel="vs previous"
                icon={CheckCircle2}
                iconColor="#16a34a"
                iconBg="#dcfce7"
                status="success"
              />
              <KPICard
                title="Failed Deployments"
                value={metrics.deployments.failed}
                description="Required intervention"
                trend={-4.9}
                trendLabel="improved"
                icon={CircleAlert}
                iconColor="#dc2626"
                iconBg="#ffe4e6"
                status="danger"
              />
              <KPICard
                title="Open Tickets"
                value={metrics.tickets.open}
                description="Awaiting triage"
                trend={5.6}
                trendLabel="this week"
                icon={Ticket}
                iconColor="#2563eb"
                iconBg="#dbeafe"
                status="neutral"
              />
              <KPICard
                title="Critical Tickets"
                value={metrics.tickets.critical}
                description="Priority attention"
                trend={-2.1}
                trendLabel="reduced"
                icon={ShieldAlert}
                iconColor="#ef4444"
                iconBg="#fff1f2"
                status="danger"
              />
              <KPICard
                title="Healthy Environments"
                value={metrics.environments.healthy}
                description="Fully operational"
                trend={6.7}
                trendLabel="monitoring"
                icon={ServerCog}
                iconColor="#16a34a"
                iconBg="#dcfce7"
                status="success"
              />
              <KPICard
                title="Unhealthy Environments"
                value={metrics.environments.warning + metrics.environments.critical}
                description="Need attention"
                trend={-1.8}
                trendLabel="stable"
                icon={Gauge}
                iconColor="#d97706"
                iconBg="#fef3c7"
                status="warning"
              />
              <KPICard
                title="Average Deployment Time"
                value={`${Math.round(metrics.deployments.avgDuration / 60)} min`}
                description="Across completed deploys"
                trend={-8.3}
                trendLabel="faster"
                icon={Clock3}
                iconColor="#0284c7"
                iconBg="#e0f2fe"
                status="neutral"
              />
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#0f172a]">Deployment activity</p>
                    <p className="text-xs text-[#64748b]">Successful vs failed over time</p>
                  </div>
                  <StatusBadge label="Live" variant="success" dot />
                </div>
                <DeploymentTrendChart data={data.deploymentTrend} />
              </div>

              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#0f172a]">Ticket volume</p>
                    <p className="text-xs text-[#64748b]">Created vs resolved trends</p>
                  </div>
                  <StatusBadge label="Monitor" variant="info" dot />
                </div>
                <TicketVolumeChart data={data.ticketTrend} />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#0f172a]">Recent deployments</p>
                    <p className="text-xs text-[#64748b]">Most recent engineering delivery activity</p>
                  </div>
                  <a href="/deployments" className="text-xs font-medium text-[#2563eb] hover:text-[#1d4ed8]">
                    View all
                  </a>
                </div>

                {data.recentDeployments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-[#e2e8f0] text-[#64748b]">
                          <th className="py-2 pr-4 font-medium">Application</th>
                          <th className="py-2 pr-4 font-medium">Version</th>
                          <th className="py-2 pr-4 font-medium">Environment</th>
                          <th className="py-2 pr-4 font-medium">Status</th>
                          <th className="py-2 pr-4 font-medium">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.recentDeployments.map((deployment) => (
                          <tr key={deployment.id} className="border-b border-[#f1f5f9]">
                            <td className="py-3 pr-4 font-medium text-[#0f172a]">{deployment.application}</td>
                            <td className="py-3 pr-4 text-[#475569]">{deployment.version}</td>
                            <td className="py-3 pr-4 text-[#475569]">{deployment.environment}</td>
                            <td className="py-3 pr-4">
                              <StatusBadge
                                label={deployment.status.replace("_", " ")}
                                variant={
                                  deployment.status === "SUCCESS"
                                    ? "success"
                                    : deployment.status === "FAILED"
                                      ? "danger"
                                      : deployment.status === "IN_PROGRESS"
                                        ? "info"
                                        : "warning"
                                }
                                dot
                              />
                            </td>
                            <td className="py-3 pr-4 text-[#64748b]">{getDateLabel(deployment.deployedAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState title="No deployment data available" description="No deployment records were returned for the selected period." />
                )}
              </div>

              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#0f172a]">Engineering activity</p>
                    <p className="text-xs text-[#64748b]">Recent delivery trend</p>
                  </div>
                  <TrendingUp className="h-4 w-4 text-[#2563eb]" />
                </div>
                <ActivityTrendChart data={data.activityTrend} />
              </div>
            </div>

            <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#0f172a]">Engineering Reporting Impact</p>
                  <p className="text-xs text-[#64748b]">Illustrative demo metrics only</p>
                </div>
                <Activity className="h-4 w-4 text-[#2563eb]" />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl bg-[#f8fafc] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#64748b]">Manual reporting</p>
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold text-[#0f172a]">8h</p>
                      <p className="text-xs text-[#64748b]">Before</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#94a3b8]" />
                    <div>
                      <p className="text-2xl font-bold text-[#15803d]">6h</p>
                      <p className="text-xs text-[#64748b]">After</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-[#f8fafc] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#64748b]">Visibility</p>
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold text-[#0f172a]">Periodic</p>
                      <p className="text-xs text-[#64748b]">Before</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#94a3b8]" />
                    <div>
                      <p className="text-2xl font-bold text-[#2563eb]">Real-time</p>
                      <p className="text-xs text-[#64748b]">After</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-[#f8fafc] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#64748b]">Expected outcome</p>
                  <div className="mt-3">
                    <p className="text-2xl font-bold text-[#0f172a]">10–20%</p>
                    <p className="text-xs text-[#64748b]">Reduction in manual reporting effort</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}

async function activityTrendJsonResponse(response: Response) {
  const value = await response.json();
  return value?.data ?? [];
}

"use client";

import { useEffect, useState } from "react";
import { Activity, ArrowUpRight, GitBranch, Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";

const RANGE_OPTIONS = ["today", "7d", "30d", "90d"];

interface ActivityRecord {
  id: string;
  developer: string;
  team: string;
  commits: number;
  pullRequests: number;
  codeReviews: number;
  deployments: number;
}

interface ActivitySummaryData {
  totalCommits: number;
  totalPullRequests: number;
  totalCodeReviews: number;
  totalDeployments: number;
}

interface ActivityPageData {
  summary?: ActivitySummaryData;
  activities?: ActivityRecord[];
}

function SummaryCard({ label, value, hint, icon: Icon }: { label: string; value: string; hint: string; icon: typeof Activity }) {
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

export default function ActivityPage() {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState<ActivityPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/activity?range=${range}`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok || json.status !== "success") {
          throw new Error(json.error ?? "Unable to load activity data.");
        }
        setData(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load activity data.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [range]);

  if (error) {
    return (
      <AppShell title="Activity" subtitle="Developer output and delivery trends across the engineering organization.">
        <ErrorState title="Activity data unavailable" description={error} onRetry={() => window.location.reload()} />
      </AppShell>
    );
  }

  return (
    <AppShell title="Activity" subtitle="Developer output and delivery trends across the engineering organization.">
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
              <SummaryCard label="Commits" value={String(data.summary?.totalCommits ?? 0)} hint="Code changes" icon={GitBranch} />
              <SummaryCard label="PRs" value={String(data.summary?.totalPullRequests ?? 0)} hint="Merged pull requests" icon={ArrowUpRight} />
              <SummaryCard label="Reviews" value={String(data.summary?.totalCodeReviews ?? 0)} hint="Code reviews completed" icon={Users} />
              <SummaryCard label="Deployments" value={String(data.summary?.totalDeployments ?? 0)} hint="Shipments delivered" icon={Activity} />
            </div>

            <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
              <div className="mb-4">
                <p className="text-sm font-semibold text-[#0f172a]">Developer contribution</p>
                <p className="text-xs text-[#64748b]">Engineering output by individual contributor</p>
              </div>

              {data.activities?.length ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#e2e8f0] text-[#64748b]">
                        <th className="py-2 pr-4 font-medium">Developer</th>
                        <th className="py-2 pr-4 font-medium">Team</th>
                        <th className="py-2 pr-4 font-medium">Commits</th>
                        <th className="py-2 pr-4 font-medium">PRs</th>
                        <th className="py-2 pr-4 font-medium">Reviews</th>
                        <th className="py-2 pr-4 font-medium">Deployments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.activities.map((item: ActivityRecord) => (
                        <tr key={item.id} className="border-b border-[#f1f5f9]">
                          <td className="py-3 pr-4 font-medium text-[#0f172a]">{item.developer}</td>
                          <td className="py-3 pr-4 text-[#475569]">{item.team}</td>
                          <td className="py-3 pr-4 text-[#475569]">{item.commits}</td>
                          <td className="py-3 pr-4 text-[#475569]">{item.pullRequests}</td>
                          <td className="py-3 pr-4 text-[#475569]">{item.codeReviews}</td>
                          <td className="py-3 pr-4 text-[#475569]">{item.deployments}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState title="No activity data" description="No individual engineering activity has been captured for this range." />
              )}
            </div>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}

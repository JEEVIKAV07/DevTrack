"use client";

import { useCallback, useEffect, useState } from "react";
import { GitPullRequest, MessageSquare, Rocket, Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState, EmptyState } from "@/components/ui/EmptyState";

interface TeamRecord {
  team: string;
  contributors: number;
  commits: number;
  pullRequests: number;
  reviews: number;
  deployments: number;
  issuesResolved: number;
}

interface TeamData { teams?: TeamRecord[]; generatedAt?: string }

export default function TeamsPage() {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/teams?range=${range}`, { cache: "no-store" });
      const json = await response.json();
      if (!response.ok || json.status !== "success") throw new Error(json.error ?? "Unable to load team data.");
      setData(json.data);
      setError("");
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load team data.");
    } finally { setLoading(false); }
  }, [range]);

  useEffect(() => {
    const initial = window.setTimeout(() => void fetchTeams(), 0);
    const timer = window.setInterval(() => void fetchTeams(), 30000);
    return () => { window.clearTimeout(initial); window.clearInterval(timer); };
  }, [fetchTeams]);

  return (
    <AppShell title="Teams" subtitle="Live delivery activity and workload by engineering team." onRefresh={fetchTeams} isRefreshing={loading} lastUpdated={data?.generatedAt ? new Date(data.generatedAt).toLocaleTimeString() : undefined}>
      <div className="space-y-6">
        <div className="flex gap-2">{["7d", "30d", "90d"].map((item) => <button key={item} onClick={() => setRange(item)} className={`rounded-full border px-3 py-1.5 text-xs font-medium ${range === item ? "border-[#2563eb] bg-[#eff6ff] text-[#2563eb]" : "border-[#e2e8f0] bg-white text-[#475569]"}`}>{item.toUpperCase()}</button>)}</div>
        {error ? <ErrorState title="Team data unavailable" description={error} onRetry={fetchTeams} /> : loading && !data ? <div className="h-64 animate-pulse rounded-2xl bg-[#e2e8f0]" /> : data?.teams?.length ? <div className="grid gap-4 md:grid-cols-2">{data.teams.map((team) => <div key={team.team} className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm"><div className="mb-5 flex items-center justify-between"><div><p className="text-base font-semibold text-[#0f172a]">{team.team}</p><p className="text-xs text-[#64748b]">{team.contributors} active contributors</p></div><div className="rounded-lg bg-[#eff6ff] p-2 text-[#2563eb]"><Users className="h-4 w-4" /></div></div><div className="grid grid-cols-2 gap-3 text-sm"><Metric icon={GitPullRequest} label="Commits" value={team.commits} /><Metric icon={GitPullRequest} label="Pull requests" value={team.pullRequests} /><Metric icon={MessageSquare} label="Reviews" value={team.reviews} /><Metric icon={Rocket} label="Deployments" value={team.deployments} /></div><p className="mt-4 text-xs text-[#64748b]">{team.issuesResolved} issues resolved in this period</p></div>)}</div> : <EmptyState title="No team activity" description="No engineering activity matches this period." />}
      </div>
    </AppShell>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return <div className="rounded-lg bg-[#f8fafc] p-3"><div className="flex items-center gap-2 text-[#64748b]"><Icon className="h-4 w-4" /><span className="text-xs">{label}</span></div><p className="mt-1 text-lg font-semibold text-[#0f172a]">{value}</p></div>;
}
"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCheck, Clock3, Ticket } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";

const RANGE_OPTIONS = ["today", "7d", "30d", "90d"];

interface TicketRecord {
  id: string;
  title: string;
  team: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  assignee: string;
  updatedAt: string;
}

interface TicketSummaryData {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
}

interface TicketPageData {
  summary?: TicketSummaryData;
  tickets?: TicketRecord[];
}

function SummaryCard({ label, value, hint, icon: Icon }: { label: string; value: string; hint: string; icon: typeof Ticket }) {
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

export default function TicketsPage() {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState<TicketPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/tickets?range=${range}&pageSize=10`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok || json.status !== "success") {
          throw new Error(json.error ?? "Unable to load ticket data.");
        }
        setData(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load ticket data.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [range]);

  if (error) {
    return (
      <AppShell title="Tickets" subtitle="Current operational issues, priorities, and resolution workload.">
        <ErrorState title="Ticket data unavailable" description={error} onRetry={() => window.location.reload()} />
      </AppShell>
    );
  }

  return (
    <AppShell title="Tickets" subtitle="Current operational issues, priorities, and resolution workload.">
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
              <SummaryCard label="Total" value={String(data.summary?.total ?? 0)} hint="Tickets queued" icon={Ticket} />
              <SummaryCard label="Open" value={String(data.summary?.open ?? 0)} hint="Awaiting triage" icon={AlertTriangle} />
              <SummaryCard label="In progress" value={String(data.summary?.inProgress ?? 0)} hint="Active work" icon={Clock3} />
              <SummaryCard label="Resolved" value={String(data.summary?.resolved ?? 0)} hint="Completed this period" icon={CheckCheck} />
            </div>

            <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#0f172a]">Recent tickets</p>
                  <p className="text-xs text-[#64748b]">Operational issues and ownership</p>
                </div>
              </div>

              {data.tickets?.length ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#e2e8f0] text-[#64748b]">
                        <th className="py-2 pr-4 font-medium">Title</th>
                        <th className="py-2 pr-4 font-medium">Team</th>
                        <th className="py-2 pr-4 font-medium">Priority</th>
                        <th className="py-2 pr-4 font-medium">Status</th>
                        <th className="py-2 pr-4 font-medium">Assignee</th>
                        <th className="py-2 pr-4 font-medium">Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.tickets.map((item: TicketRecord) => (
                        <tr key={item.id} className="border-b border-[#f1f5f9]">
                          <td className="py-3 pr-4 font-medium text-[#0f172a]">{item.title}</td>
                          <td className="py-3 pr-4 text-[#475569]">{item.team}</td>
                          <td className="py-3 pr-4">
                            <StatusBadge
                              label={item.priority}
                              variant={
                                item.priority === "CRITICAL"
                                  ? "danger"
                                  : item.priority === "HIGH"
                                    ? "warning"
                                    : item.priority === "MEDIUM"
                                      ? "info"
                                      : "neutral"
                              }
                              dot
                            />
                          </td>
                          <td className="py-3 pr-4">
                            <StatusBadge
                              label={item.status.replace("_", " ")}
                              variant={
                                item.status === "OPEN"
                                  ? "info"
                                  : item.status === "IN_PROGRESS"
                                    ? "purple"
                                    : item.status === "RESOLVED"
                                      ? "success"
                                      : "neutral"
                              }
                              dot
                            />
                          </td>
                          <td className="py-3 pr-4 text-[#475569]">{item.assignee}</td>
                          <td className="py-3 pr-4 text-[#64748b]">{new Date(item.updatedAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState title="No tickets found" description="No issue records match the selected criteria." />
              )}
            </div>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}

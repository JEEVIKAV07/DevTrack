"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { DeploymentTrend, TicketVolumeTrend, ActivityTrend, ChartDataPoint } from "@/types";

// =====================================================
// Chart components — All using Recharts
// =====================================================

const CHART_COLORS = {
  blue: "#2563eb",
  green: "#22c55e",
  red: "#ef4444",
  orange: "#f59e0b",
  purple: "#8b5cf6",
  teal: "#14b8a6",
  slate: "#94a3b8",
};

const TOOLTIP_STYLE = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  fontSize: "12px",
  color: "#0f172a",
};

// --- Deployment Trend Chart ---
export function DeploymentTrendChart({ data }: { data: DeploymentTrend[] }) {
  if (!data?.length) return null;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradSuccess" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.green} stopOpacity={0.15} />
            <stop offset="95%" stopColor={CHART_COLORS.green} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradFailed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.red} stopOpacity={0.12} />
            <stop offset="95%" stopColor={CHART_COLORS.red} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend
          wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
          formatter={(val) => <span className="text-[#475569]">{val}</span>}
        />
        <Area
          type="monotone"
          dataKey="successful"
          name="Successful"
          stroke={CHART_COLORS.green}
          strokeWidth={2}
          fill="url(#gradSuccess)"
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="failed"
          name="Failed"
          stroke={CHART_COLORS.red}
          strokeWidth={2}
          fill="url(#gradFailed)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// --- Deployment Status Bar Chart ---
export function DeploymentStatusBarChart({ data }: { data: DeploymentTrend[] }) {
  if (!data?.length) return null;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
        <Bar dataKey="successful" name="Successful" fill={CHART_COLORS.green} radius={[3, 3, 0, 0]} maxBarSize={20} />
        <Bar dataKey="failed" name="Failed" fill={CHART_COLORS.red} radius={[3, 3, 0, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// --- Ticket Volume Chart ---
export function TicketVolumeChart({ data }: { data: TicketVolumeTrend[] }) {
  if (!data?.length) return null;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.blue} stopOpacity={0.15} />
            <stop offset="95%" stopColor={CHART_COLORS.blue} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradResolved" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.green} stopOpacity={0.12} />
            <stop offset="95%" stopColor={CHART_COLORS.green} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
        <Area type="monotone" dataKey="created" name="Created" stroke={CHART_COLORS.blue} strokeWidth={2} fill="url(#gradCreated)" dot={false} />
        <Area type="monotone" dataKey="resolved" name="Resolved" stroke={CHART_COLORS.green} strokeWidth={2} fill="url(#gradResolved)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// --- Ticket Status Donut Chart ---
export function TicketStatusDonut({ data }: { data: ChartDataPoint[] }) {
  const colors = [CHART_COLORS.blue, CHART_COLORS.purple, CHART_COLORS.green, CHART_COLORS.slate];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} strokeWidth={0} />
          ))}
        </Pie>
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend
          wrapperStyle={{ fontSize: "12px" }}
          formatter={(val) => <span className="text-[#475569]">{val}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// --- Ticket Priority Bar Chart ---
export function TicketPriorityChart({ data }: { data: ChartDataPoint[] }) {
  const colors = [CHART_COLORS.red, CHART_COLORS.orange, CHART_COLORS.blue, CHART_COLORS.slate];

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11, fill: "#475569" }}
          tickLine={false}
          axisLine={false}
          width={60}
        />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Bar dataKey="value" radius={[0, 3, 3, 0]} maxBarSize={22}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// --- Activity Trend Chart ---
export function ActivityTrendChart({ data }: { data: ActivityTrend[] }) {
  if (!data?.length) return null;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
        <Line type="monotone" dataKey="commits" name="Commits" stroke={CHART_COLORS.blue} strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="pullRequests" name="Pull Requests" stroke={CHART_COLORS.purple} strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="codeReviews" name="Code Reviews" stroke={CHART_COLORS.teal} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// --- Environment Health Bar Chart ---
export function EnvironmentHealthChart({
  data,
}: {
  data: Array<{ name: string; cpu: number; memory: number; disk: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(val) => [`${val}%`]}
        />
        <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
        <Bar dataKey="cpu" name="CPU" fill={CHART_COLORS.blue} radius={[3, 3, 0, 0]} maxBarSize={18} />
        <Bar dataKey="memory" name="Memory" fill={CHART_COLORS.purple} radius={[3, 3, 0, 0]} maxBarSize={18} />
        <Bar dataKey="disk" name="Disk" fill={CHART_COLORS.orange} radius={[3, 3, 0, 0]} maxBarSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}

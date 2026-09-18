import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";

// =====================================================
// KPI Card — Main dashboard metric card component
// =====================================================

interface KPICardProps {
  id?: string;
  title: string;
  value: string | number;
  description?: string;
  trend?: number; // percentage change (positive = up, negative = down)
  trendLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  status?: "success" | "warning" | "danger" | "neutral";
}

export function KPICard({
  id,
  title,
  value,
  description,
  trend,
  trendLabel,
  icon: Icon,
  iconColor = "#2563eb",
  iconBg = "#eff6ff",
  status = "neutral",
}: KPICardProps) {
  const hasTrend = trend !== undefined && trend !== null;
  const trendIsUp = hasTrend && trend! > 0;
  const trendIsDown = hasTrend && trend! < 0;

  const trendColor = trendIsUp
    ? "text-[#16a34a]"
    : trendIsDown
    ? "text-[#dc2626]"
    : "text-[#94a3b8]";

  const TrendIcon = trendIsUp ? TrendingUp : trendIsDown ? TrendingDown : Minus;

  // Left border color based on status
  const borderColors: Record<string, string> = {
    success: "border-l-[#22c55e]",
    warning: "border-l-[#f59e0b]",
    danger: "border-l-[#ef4444]",
    neutral: "border-l-transparent",
  };

  return (
    <div
      id={id}
      className={`card p-5 border-l-4 transition-card ${borderColors[status]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">
            {title}
          </p>
          <p className="text-3xl font-bold text-[#0f172a] leading-none mb-1">
            {value}
          </p>
          {description && (
            <p className="text-xs text-[#94a3b8] mt-1">{description}</p>
          )}
        </div>
        <div
          className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
          style={{ backgroundColor: iconBg }}
        >
          <Icon className="w-6 h-6" style={{ color: iconColor }} />
        </div>
      </div>

      {hasTrend && (
        <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${trendColor}`}>
          <TrendIcon className="w-3.5 h-3.5" />
          <span>
            {trendIsUp ? "+" : ""}{trend}%
          </span>
          {trendLabel && (
            <span className="text-[#94a3b8] font-normal ml-0.5">{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}

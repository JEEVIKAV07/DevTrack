import { DeploymentStatus, TicketStatus, TicketPriority, HealthStatus } from "@/types";

// =====================================================
// StatusBadge — Reusable status indicator component
// =====================================================

type BadgeVariant = "success" | "danger" | "warning" | "info" | "neutral" | "purple";

function getBadgeClass(variant: BadgeVariant): string {
  const variants: Record<BadgeVariant, string> = {
    success: "badge-success",
    danger: "badge-danger",
    warning: "badge-warning",
    info: "badge-info",
    neutral: "badge-neutral",
    purple: "badge-purple",
  };
  return variants[variant];
}

interface StatusBadgeProps {
  label: string;
  variant: BadgeVariant;
  dot?: boolean;
  size?: "sm" | "md";
}

export function StatusBadge({ label, variant, dot = false, size = "sm" }: StatusBadgeProps) {
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1";
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${sizeClass} ${getBadgeClass(variant)}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === "success" ? "bg-[#16a34a]" :
            variant === "danger" ? "bg-[#dc2626]" :
            variant === "warning" ? "bg-[#d97706]" :
            variant === "info" ? "bg-[#0284c7]" :
            variant === "purple" ? "bg-[#7c3aed]" :
            "bg-[#64748b]"
          }`}
        />
      )}
      {label}
    </span>
  );
}

// --- Deployment Status Badge ---
export function DeploymentStatusBadge({ status }: { status: DeploymentStatus }) {
  const config: Record<DeploymentStatus, { label: string; variant: BadgeVariant }> = {
    SUCCESS: { label: "Success", variant: "success" },
    FAILED: { label: "Failed", variant: "danger" },
    IN_PROGRESS: { label: "In Progress", variant: "info" },
    ROLLED_BACK: { label: "Rolled Back", variant: "warning" },
    PENDING: { label: "Pending", variant: "neutral" },
  };
  const { label, variant } = config[status];
  return <StatusBadge label={label} variant={variant} dot />;
}

// --- Ticket Status Badge ---
export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const config: Record<TicketStatus, { label: string; variant: BadgeVariant }> = {
    OPEN: { label: "Open", variant: "info" },
    IN_PROGRESS: { label: "In Progress", variant: "purple" },
    RESOLVED: { label: "Resolved", variant: "success" },
    CLOSED: { label: "Closed", variant: "neutral" },
  };
  const { label, variant } = config[status];
  return <StatusBadge label={label} variant={variant} dot />;
}

// --- Ticket Priority Badge ---
export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  const config: Record<TicketPriority, { label: string; variant: BadgeVariant }> = {
    CRITICAL: { label: "Critical", variant: "danger" },
    HIGH: { label: "High", variant: "warning" },
    MEDIUM: { label: "Medium", variant: "info" },
    LOW: { label: "Low", variant: "neutral" },
  };
  const { label, variant } = config[priority];
  return <StatusBadge label={label} variant={variant} />;
}

// --- Health Status Badge ---
export function HealthStatusBadge({ status }: { status: HealthStatus }) {
  const config: Record<HealthStatus, { label: string; variant: BadgeVariant }> = {
    HEALTHY: { label: "Healthy", variant: "success" },
    WARNING: { label: "Warning", variant: "warning" },
    CRITICAL: { label: "Critical", variant: "danger" },
    UNKNOWN: { label: "Unknown", variant: "neutral" },
  };
  const { label, variant } = config[status];
  return <StatusBadge label={label} variant={variant} dot />;
}

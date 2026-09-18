import { AlertTriangle, RefreshCw, InboxIcon } from "lucide-react";

// =====================================================
// Empty State & Error State Components
// =====================================================

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#f1f5f9] mb-4">
        {icon ?? <InboxIcon className="w-7 h-7 text-[#94a3b8]" />}
      </div>
      <h3 className="text-base font-semibold text-[#0f172a] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[#94a3b8] max-w-xs">{description}</p>
      )}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  description = "Unable to load data. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#fff1f2] mb-4">
        <AlertTriangle className="w-7 h-7 text-[#ef4444]" />
      </div>
      <h3 className="text-base font-semibold text-[#0f172a] mb-1">{title}</h3>
      <p className="text-sm text-[#94a3b8] max-w-xs mb-4">{description}</p>
      {onRetry && (
        <button
          id="btn-retry"
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#2563eb] rounded-lg hover:bg-[#1d4ed8] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
}

interface WarningBannerProps {
  message: string;
}

export function WarningBanner({ message }: WarningBannerProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-[#fffbeb] border border-[#fef3c7] rounded-lg text-sm text-[#92400e]">
      <AlertTriangle className="w-4 h-4 text-[#f59e0b] shrink-0" />
      {message}
    </div>
  );
}

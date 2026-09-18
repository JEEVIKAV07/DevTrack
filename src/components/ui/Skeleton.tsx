// Skeleton loading components for dashboard pages

export function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-8 w-8 rounded-lg" />
      </div>
      <div className="skeleton h-8 w-20 rounded" />
      <div className="skeleton h-3 w-32 rounded" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-[#e2e8f0]">
        <div className="skeleton h-5 w-40 rounded" />
      </div>
      <div className="divide-y divide-[#f1f5f9]">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-4 py-3 flex items-center gap-4">
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-4 w-32 rounded" />
            <div className="skeleton h-4 w-20 rounded" />
            <div className="skeleton h-4 w-16 rounded" />
            <div className="skeleton h-6 w-16 rounded-full ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="card p-5 space-y-3">
      <div className="skeleton h-5 w-40 rounded" />
      <div className="skeleton h-[220px] w-full rounded-lg" />
    </div>
  );
}

export function SkeletonKPIRow() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

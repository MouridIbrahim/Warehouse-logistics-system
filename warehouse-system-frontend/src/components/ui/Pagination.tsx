export function Pagination({
  page,
  totalPages,
  totalElements,
  size,
  onPageChange,
  onSizeChange,
}: {
  page: number
  totalPages: number
  totalElements: number
  size: number
  onPageChange: (page: number) => void
  onSizeChange: (size: number) => void
}) {
  const from = totalElements === 0 ? 0 : page * size + 1
  const to = Math.min((page + 1) * size, totalElements)

  return (
    <div className="px-space-md py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-surface border-t border-border-default">
      <div className="flex items-center gap-4">
        <span className="text-caption-meta text-text-secondary">
          Showing <span className="font-semibold text-text-primary tabular-nums">{from}</span> to{' '}
          <span className="font-semibold text-text-primary tabular-nums">{to}</span> of{' '}
          <span className="font-semibold text-text-primary tabular-nums">{totalElements}</span>
        </span>
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="text-caption-meta text-text-secondary">Rows per page:</span>
          <select
            value={size}
            onChange={(e) => onSizeChange(Number(e.target.value))}
            className="bg-app-bg text-caption-meta text-text-primary rounded px-2 py-1 focus:outline-none cursor-pointer"
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          className="h-8 px-2.5 inline-flex items-center gap-1 rounded bg-app-bg text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50 text-button-text font-semibold"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
        >
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          Previous
        </button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            // Show a window of pages around the current page.
            let p: number
            if (totalPages <= 5) {
              p = i
            } else if (page < 3) {
              p = i
            } else if (page > totalPages - 3) {
              p = totalPages - 5 + i
            } else {
              p = page - 2 + i
            }
            return (
              <button
                key={p}
                className={`w-8 h-8 rounded text-caption-meta font-semibold transition-colors ${
                  p === page
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface hover:bg-app-bg text-text-primary'
                }`}
                onClick={() => onPageChange(p)}
              >
                {p + 1}
              </button>
            )
          })}
        </div>
        <button
          className="h-8 px-2.5 inline-flex items-center gap-1 rounded bg-app-bg text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50 text-button-text font-semibold"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </div>
    </div>
  )
}

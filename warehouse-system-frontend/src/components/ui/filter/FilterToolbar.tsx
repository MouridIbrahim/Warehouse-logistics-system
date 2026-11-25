
import { useEffect, useRef, useState } from 'react'

export interface FilterToolbarProps {
  search?: {
    value: string
    onChange: (value: string) => void
    placeholder?: string
  }
  selects?: Array<{
    key: string
    value: string
    onChange: (value: string) => void
    options: { value: string; label: string }[]
    placeholder?: string
    label?: string
  }>
  dateRange?: {
    startValue: string
    endValue: string
    onStartChange: (value: string) => void
    onEndChange: (value: string) => void
    placeholder?: string
  }
  onReset: () => void
  className?: string
}

export function FilterToolbar({
  search,
  selects,
  dateRange,
  onReset,
  className = '',
}: FilterToolbarProps) {
  const [searchDraft, setSearchDraft] = useState(search?.value ?? '')
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setSearchDraft(search?.value ?? '')
  }, [search?.value])

  useEffect(() => () => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
  }, [])

  function handleSearchChange(value: string) {
    setSearchDraft(value)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    if (value === '') {
      search?.onChange('')
      return
    }
    searchTimer.current = setTimeout(() => {
      search?.onChange(value.trim())
      searchTimer.current = null
    }, 300)
  }

  const hasActiveFilters =
    (search?.value?.trim() ?? false) ||
    (selects?.some((s) => s.value?.trim()) ?? false) ||
    (dateRange?.startValue?.trim() ?? false) ||
    (dateRange?.endValue?.trim() ?? false)

  return (
    <div
      className={`p-space-md flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-border-default ${className}`}
    >
      <div className="flex flex-col lg:flex-row items-center gap-2 w-full lg:w-auto">
        {search && (
          <div className="relative w-full sm:w-80">
            <span
              className="material-symbols-outlined absolute left-3 top-2.5 text-text-secondary text-[18px] pointer-events-none"
            >
              search
            </span>
            <input
              aria-label={search.placeholder ?? 'Search'}
              className="w-full pl-9 pr-3 h-[38px] text-body-default bg-app-bg rounded-lg placeholder:text-sidebar-muted text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder={search.placeholder ?? 'Search...'}
              value={searchDraft}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {searchDraft.trim() && (
              <button
                type="button"
                aria-label="Clear search"
                className="absolute right-3 top-2.5 p-1 text-text-secondary hover:text-text-primary"
                onClick={() => handleSearchChange('')}
                title="Clear search"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        )}
        {selects?.map((sel) => (
          <div
            key={sel.key}
            className="relative w-full sm:w-48"
          >
            <select
              aria-label={sel.label ?? sel.placeholder ?? sel.key}
              value={sel.value}
              onChange={(e) => sel.onChange(e.target.value)}
              className="appearance-none h-[38px] pl-3 pr-8 bg-app-bg text-body-default text-text-primary rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {sel.placeholder !== undefined && (
                <option value="">{sel.placeholder}</option>
              )}
              {sel.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <span
              className="material-symbols-outlined absolute right-2 top-2.5 text-text-secondary pointer-events-none text-[18px]"
            >
              unfold_more
            </span>
          </div>
        ))}
        {dateRange && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              aria-label="Start date"
              type="date"
              max={dateRange.endValue || undefined}
              className="h-[38px] pl-3 pr-3 bg-app-bg text-body-default text-text-primary rounded-lg border border-border-default focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={dateRange.startValue}
              onChange={(e) => {
                const value = e.target.value
                dateRange.onStartChange(value)
                if (value && dateRange.endValue && value > dateRange.endValue) {
                  dateRange.onEndChange('')
                }
              }}
            />
            <input
              aria-label="End date"
              type="date"
              min={dateRange.startValue || undefined}
              className="h-[38px] pl-3 pr-3 bg-app-bg text-body-default text-text-primary rounded-lg border border-border-default focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={dateRange.endValue}
              onChange={(e) => {
                const value = e.target.value
                dateRange.onEndChange(value)
              }}
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 h-10 px-3 rounded-lg bg-surface text-text-primary border border-border-default text-body-default text-sm font-medium transition-colors hover:bg-app-bg"
          >
            <span className="material-symbols-outlined text-[16px]">clear</span>
            Reset Filters
          </button>
        )}
      </div>
    </div>
  )
}

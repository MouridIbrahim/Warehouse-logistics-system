import { useCallback } from 'react'

export interface ActiveFilterChip {
  key: string
  label: string
  value: string
  onRemove: () => void
}

export interface ActiveFilterChipsProps {
  chips: ActiveFilterChip[]
  onClearAll: () => void
  className?: string
}

export function ActiveFilterChips({
  chips,
  onClearAll,
  className = '',
}: ActiveFilterChipsProps) {
  const handleRemove = useCallback(
    (chip: ActiveFilterChip) => () => {
      chip.onRemove()
    },
    [],
  )

  if (chips.length === 0) return null

  return (
    <div
      className={`flex flex-wrap items-center gap-2 p-space-md ${className}`}
    >
      <span className="text-caption-meta text-text-secondary">Active filters:</span>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 rounded-lg bg-app-bg px-2.5 py-1.5 text-caption-meta font-medium text-text-secondary border border-border-default"
        >
          <span className="truncate max-w-[200px]">{chip.label}</span>
          <button
            type="button"
            onClick={handleRemove(chip)}
            className="p-1 text-text-secondary hover:text-status-danger-text"
            title={`Remove ${chip.label} filter`}
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </span>
      ))}
      {chips.length > 1 && (
        <button
          type="button"
          onClick={onClearAll}
          className="ml-2 text-caption-meta font-semibold text-status-danger-text hover:underline"
        >
          Clear all
        </button>
      )}
    </div>
  )
}

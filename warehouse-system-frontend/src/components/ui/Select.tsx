export interface SelectOption {
  value: string
  label: string
}

export function Select({
  value,
  onChange,
  options,
  placeholder,
  className = '',
  id,
  ariaLabel,
}: {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
  id?: string
  ariaLabel?: string
}) {
  return (
    <div className={`relative ${className}`}>
      <select
        id={id}
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none h-[38px] pl-3 pr-8 bg-app-bg text-body-default text-text-primary rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="material-symbols-outlined absolute right-2 top-2.5 text-text-secondary pointer-events-none text-[18px]">
        unfold_more
      </span>
    </div>
  )
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  className = '',
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <div className={`relative ${className}`}>
      <span className="material-symbols-outlined absolute left-3 top-2.5 text-text-secondary text-[18px] pointer-events-none">
        search
      </span>
      <input
        className="w-full pl-9 pr-3 h-[38px] text-body-default bg-app-bg rounded-lg placeholder:text-sidebar-muted text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

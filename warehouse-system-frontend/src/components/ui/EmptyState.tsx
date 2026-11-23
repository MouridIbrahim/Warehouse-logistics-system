export function EmptyState({
  icon = 'inbox',
  title,
  description,
}: {
  icon?: string
  title: string
  description?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <span className="material-symbols-outlined text-[40px] text-sidebar-muted">{icon}</span>
      <h3 className="text-headline-h3 font-semibold text-text-primary mt-3">{title}</h3>
      {description && (
        <p className="text-body-default text-text-secondary mt-1 max-w-sm">{description}</p>
      )}
    </div>
  )
}

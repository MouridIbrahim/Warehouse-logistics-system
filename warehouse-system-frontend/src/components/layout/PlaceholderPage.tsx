export function PlaceholderPage({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-headline-h1 font-bold text-text-primary">{title}</h1>
        {description && (
          <p className="text-body-default text-text-secondary mt-1">{description}</p>
        )}
      </div>
      <div className="bg-surface rounded-xl border border-border-default p-16 flex flex-col items-center justify-center text-center">
        <span className="material-symbols-outlined text-[40px] text-sidebar-muted">construction</span>
        <h2 className="text-headline-h3 font-semibold text-text-primary mt-3">Coming soon</h2>
        <p className="text-body-default text-text-secondary mt-1">
          This screen is not implemented yet.
        </p>
      </div>
    </div>
  )
}

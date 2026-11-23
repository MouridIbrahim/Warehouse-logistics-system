import { PageHeader } from '../../components/ui/PageHeader'

export function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="System Settings"
        description="Configure application-wide settings."
      />

      <div className="mt-6 bg-surface rounded-xl border border-border-default p-16 flex flex-col items-center justify-center text-center">
        <span className="material-symbols-outlined text-[40px] text-sidebar-muted">settings</span>
        <h2 className="text-headline-h3 font-semibold text-text-primary mt-3">
          No configurable settings
        </h2>
        <p className="text-body-default text-text-secondary mt-1 max-w-md">
          There are no user-configurable settings in this version. System configuration
          (database, JWT, CORS, and rate limits) is managed through environment variables on the
          server and is intentionally kept out of the browser.
        </p>
      </div>
    </div>
  )
}

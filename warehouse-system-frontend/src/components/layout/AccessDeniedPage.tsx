import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'

export function AccessDeniedPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24">
      <span className="material-symbols-outlined text-[48px] text-status-danger-text">block</span>
      <h1 className="text-headline-h1 font-bold text-text-primary mt-4">Access Denied</h1>
      <p className="text-body-default text-text-secondary mt-1 max-w-sm">
        You don't have permission to view this page. Contact an administrator if you believe this is a mistake.
      </p>
      <Link to="/app" className="mt-6">
        <Button icon="dashboard">Back to Dashboard</Button>
      </Link>
    </div>
  )
}

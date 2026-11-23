import { useState } from 'react'
import type { FormEvent } from 'react'
import { getErrorMessage } from '../../lib/api'
import { useAuth } from '../auth/auth-context'
import { changePassword } from '../auth/api'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'

function roleLabel(name: string): string {
  return name
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function ProfilePage() {
  const { user } = useAuth()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (next !== confirm) {
      setError('New passwords do not match')
      return
    }
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      await changePassword({ currentPassword: current, newPassword: next })
      setCurrent('')
      setNext('')
      setConfirm('')
      setSuccess(true)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader title="My Profile" description="View and manage your account." />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-surface rounded-xl border border-border-default p-space-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shrink-0">
              {user?.displayName?.charAt(0) ?? 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-headline-h3 font-semibold text-text-primary truncate">
                {user?.displayName ?? 'Unknown'}
              </div>
              <div className="text-caption-meta text-text-secondary">@{user?.username}</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border-default">
            <div className="text-caption-meta text-text-secondary uppercase tracking-wider mb-2">Assigned roles</div>
            <div className="flex flex-wrap gap-2">
              {user?.roles.map((r) => (
                <StatusBadge key={r} tone="neutral">
                  {roleLabel(r)}
                </StatusBadge>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-surface rounded-xl border border-border-default p-space-lg shadow-sm">
          <h2 className="text-headline-h3 font-semibold text-text-primary">Change Password</h2>
          <p className="text-body-default text-text-secondary mt-1">
            Update your account password.
          </p>

          {success && (
            <div className="mt-4 p-3 rounded-lg bg-status-success-bg text-status-success-text text-caption-meta">
              Password updated successfully.
            </div>
          )}

          <form className="mt-4 flex flex-col gap-4 max-w-md" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <label className="text-form-label text-text-primary">Current password *</label>
              <input
                type="password"
                className="h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-form-label text-text-primary">New password *</label>
              <input
                type="password"
                className="h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Minimum 8 characters"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-form-label text-text-primary">Confirm new password *</label>
              <input
                type="password"
                className="h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-status-danger-bg text-status-danger-text text-caption-meta">
                {error}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

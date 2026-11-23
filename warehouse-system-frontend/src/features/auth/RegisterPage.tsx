import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from './auth-context'
import { getErrorMessage } from '../../lib/api'

export function RegisterPage() {
  const { register } = useAuth()
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await register({ username, password, displayName })
      setSuccess(true)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative bg-app-bg px-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-b from-primary/10 to-transparent blur-3xl rounded-full" />
      </div>

      <div className="relative w-full max-w-[420px] flex flex-col items-center">
        <div className="w-full bg-surface rounded-xl shadow-xl p-space-xl flex flex-col">
          <div className="flex flex-col items-center text-center mb-space-lg">
            <div className="w-14 h-14 rounded-lg bg-surface shadow-sm flex items-center justify-center mb-space-sm">
              <span className="material-symbols-outlined text-[28px] text-primary">local_shipping</span>
            </div>
            <div className="flex items-center gap-1.5 tracking-wider">
              <span className="text-headline-h3 font-bold text-text-primary tracking-tight">LOGISTICS</span>
              <span className="text-caption-meta text-primary font-semibold">OS</span>
            </div>
            <p className="text-caption-meta tracking-widest text-text-secondary uppercase mt-0.5 font-medium">
              Warehouse System
            </p>
          </div>

          {success ? (
            <div className="text-center">
              <span className="material-symbols-outlined text-[40px] text-status-success-text">check_circle</span>
              <h1 className="text-headline-h2 font-bold text-text-primary mt-2">Administrator created</h1>
              <p className="text-body-default text-text-secondary mt-1">
                Your administrator account is ready. Sign in to continue.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-1.5 w-full h-11 mt-space-lg bg-primary hover:bg-primary-hover text-on-primary text-button-text font-bold rounded-lg transition-colors"
              >
                Go to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-space-lg">
                <h1 className="text-headline-h2 font-bold text-text-primary">Create your account</h1>
                <p className="text-body-default text-text-secondary mt-1">
                  The first registered account becomes the system Administrator.
                </p>
              </div>

              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-1.5">
                  <label className="text-form-label text-text-primary" htmlFor="displayName">
                    Full name
                  </label>
                  <input
                    id="displayName"
                    className="w-full h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    placeholder="e.g. Jane Cooper"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-form-label text-text-primary" htmlFor="reg-username">
                    Username
                  </label>
                  <input
                    id="reg-username"
                    className="w-full h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    placeholder="e.g. admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-form-label text-text-primary" htmlFor="reg-password">
                    Password
                  </label>
                  <input
                    id="reg-password"
                    className="w-full h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-form-label text-text-primary" htmlFor="reg-confirm">
                    Confirm password
                  </label>
                  <input
                    id="reg-confirm"
                    className="w-full h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    type="password"
                    placeholder="Re-enter password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 mt-2 bg-primary hover:bg-primary-hover text-on-primary text-button-text font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Administrator</span>
                  )}
                </button>
              </form>

              {error && (
                <div className="mt-space-lg flex items-start gap-2.5 p-3 rounded-lg bg-status-danger-bg text-status-danger-text">
                  <span className="material-symbols-outlined text-[20px] flex-shrink-0 mt-0.5">warning</span>
                  <p className="text-caption-meta leading-snug">{error}</p>
                </div>
              )}
            </>
          )}
        </div>

        <Link to="/login" className="mt-space-lg text-caption-meta font-semibold text-text-secondary hover:text-text-primary">
          ← Back to Sign In
        </Link>
      </div>
    </div>
  )
}

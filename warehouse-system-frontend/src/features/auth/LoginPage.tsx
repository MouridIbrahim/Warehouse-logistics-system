import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './auth-context'
import { getErrorMessage } from '../../lib/api'
import { useToast } from '../../components/ui/toast'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(username, password)
      addToast({
        type: 'success',
        title: 'Welcome back',
        message: 'You have successfully signed in',
      })
      navigate('/app')
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

          <div className="text-center mb-space-lg">
            <h1 className="text-headline-h2 font-bold text-text-primary">Welcome back</h1>
            <p className="text-body-default text-text-secondary mt-1">
              Sign in to manage your warehouse operations
            </p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <label className="text-form-label text-text-primary" htmlFor="username">
                Username or Email Address
              </label>
              <input
                id="username"
                className="w-full h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                placeholder="e.g. admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-form-label text-text-primary" htmlFor="password">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  id="password"
                  className="w-full h-10 pl-3 pr-10 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  placeholder="••••••••••••"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  aria-label="Toggle password visibility"
                  className="absolute right-2.5 text-text-secondary hover:text-text-primary p-1 rounded"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" className="w-4 h-4 rounded accent-[#C45D16] cursor-pointer" />
                <span className="text-caption-meta text-text-secondary">Remember this device</span>
              </label>
              <a href="#" className="text-caption-meta font-semibold text-primary hover:text-primary-hover">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-2 bg-primary hover:bg-primary-hover active:scale-[0.99] text-on-primary text-button-text font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">lock_open</span>
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-space-lg flex items-start gap-2.5 p-3 rounded-lg bg-status-danger-bg text-status-danger-text">
              <span className="material-symbols-outlined text-[20px] flex-shrink-0 mt-0.5">warning</span>
              <p className="text-caption-meta leading-snug">{error}</p>
            </div>
          )}
        </div>

        <div className="mt-space-lg text-center flex flex-col items-center gap-1">
          <Link
            to="/register"
            className="text-caption-meta font-semibold text-primary hover:text-primary-hover"
          >
            First time here? Register as administrator
          </Link>
          <div className="flex items-center gap-2 text-caption-meta text-sidebar-muted mt-2">
            <span className="material-symbols-outlined text-[14px]">shield</span>
            <span>Transit Operations Portal v2.4.0 • Authorized Personnel Only</span>
          </div>
        </div>
      </div>
    </div>
  )
}

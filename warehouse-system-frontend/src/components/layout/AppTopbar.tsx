import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/auth-context'
import { useOnboarding } from './OnboardingContext'

export function AppTopbar({ onOpenNavigation }: { onOpenNavigation: () => void }) {
  const { user, logout } = useAuth()
  const { restartTour } = useOnboarding()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="h-16 shrink-0 bg-surface border-b border-border-default flex items-center justify-between px-6 relative">
      <div className="flex items-center gap-3 text-caption-meta text-text-secondary">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary hover:bg-app-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary md:hidden"
          aria-label="Open navigation"
          aria-controls="app-navigation"
          onClick={onOpenNavigation}
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <span className="hidden sm:inline">
          <span className="material-symbols-outlined text-[16px] align-middle mr-1.5">warehouse</span>
          Warehouse operations
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-app-bg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={open}
          >
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
              {user?.displayName?.charAt(0) ?? 'U'}
            </div>
            <div className="text-left leading-tight hidden sm:block">
              <div className="text-body-default font-semibold text-text-primary">
                {user?.displayName ?? 'Unknown'}
              </div>
              <div className="text-[11px] text-text-secondary">{user?.roles?.[0]}</div>
            </div>
            <span className="material-symbols-outlined text-[18px] text-text-secondary">
              expand_more
            </span>
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div role="menu" aria-label="Account menu" className="absolute right-0 mt-1 w-48 bg-surface border border-border-default rounded-lg shadow-lg z-20 py-1">
                <button
                  type="button"
                  role="menuitem"
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-body-default text-text-primary hover:bg-app-bg"
                  onClick={() => {
                    setOpen(false)
                    navigate('/app')
                    restartTour()
                  }}
                >
                  <span className="material-symbols-outlined text-[18px]">help</span>
                  Restart welcome tour
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="w-full flex items-center gap-2 px-3 py-2 text-body-default text-text-primary hover:bg-app-bg"
                  onClick={() => {
                    setOpen(false)
                    navigate('/app/profile')
                  }}
                >
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  My Profile
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="w-full flex items-center gap-2 px-3 py-2 text-body-default text-status-danger-text hover:bg-app-bg"
                  onClick={handleLogout}
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

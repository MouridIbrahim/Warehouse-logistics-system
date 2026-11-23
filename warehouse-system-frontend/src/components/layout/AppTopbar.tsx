import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/auth-context'

export function AppTopbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="h-16 shrink-0 bg-surface border-b border-border-default flex items-center justify-between px-6 relative">
      <div className="text-caption-meta text-text-secondary">
        <span className="material-symbols-outlined text-[16px] align-middle mr-1.5">warehouse</span>
        Main Distribution Center
      </div>

      <div className="flex items-center gap-3">
        <button
          className="relative w-9 h-9 rounded-lg hover:bg-app-bg flex items-center justify-center text-text-secondary transition-colors"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-status-danger" />
        </button>

        <div className="relative">
          <button
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-app-bg transition-colors"
            onClick={() => setOpen((v) => !v)}
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
              <div className="absolute right-0 mt-1 w-48 bg-surface border border-border-default rounded-lg shadow-lg z-20 py-1">
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-body-default text-text-primary hover:bg-app-bg"
                  onClick={() => {
                    setOpen(false)
                    navigate('/profile')
                  }}
                >
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  My Profile
                </button>
                <button
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

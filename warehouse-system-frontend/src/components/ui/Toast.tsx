import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

const ToastContext = createContext<{
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
} | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const clearTimer = useCallback((id: string) => {
    const timer = timersRef.current.get(id)
    if (timer) clearTimeout(timer)
    timersRef.current.delete(id)
  }, [])

  const removeToast = useCallback((id: string) => {
    clearTimer(id)
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [clearTimer])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 9)
    const newToast: Toast = { ...toast, id, duration: toast.duration ?? 5000 }
    setToasts(prev => [...prev, newToast])
    const timer = setTimeout(() => removeToast(id), newToast.duration)
    timersRef.current.set(id, timer)
    return id
  }, [removeToast])

  useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer))
      timersRef.current.clear()
    }
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-lg shadow-lg p-4 min-w-[300px] ${
              toast.type === 'success'
                ? 'bg-status-success-bg text-status-success-text border border-status-success/30'
                : toast.type === 'error'
                ? 'bg-status-danger-bg text-status-danger-text border border-status-danger/30'
                : toast.type === 'warning'
                ? 'bg-status-warning-bg text-status-warning-text border border-status-warning/30'
                : 'bg-status-info-bg text-status-info-text border border-status-info/30'
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] mt-0.5 ${
              toast.type === 'success'
                ? 'text-status-success-text'
                : toast.type === 'error'
                ? 'text-status-danger-text'
                : toast.type === 'warning'
                ? 'text-status-warning-text'
                : 'text-status-info-text'
            }`}>
              {toast.type === 'success' ? 'check_circle' :
               toast.type === 'error' ? 'error' :
               toast.type === 'warning' ? 'warning' : 'info'}
            </span>
            <div className="flex-1">
              <div className="text-body-default font-semibold">{toast.title}</div>
              {toast.message && (
                <div className="text-caption-meta text-text-secondary mt-0.5">{toast.message}</div>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="material-symbols-outlined text-[16px] text-text-secondary hover:text-text-primary p-1"
            >
              close
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

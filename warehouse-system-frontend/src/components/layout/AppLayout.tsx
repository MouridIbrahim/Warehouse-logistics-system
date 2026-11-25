import { Suspense, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'
import { AppTopbar } from './AppTopbar'
import { PageLoader } from './PageLoader'
import { ToastProvider } from '../ui/Toast.tsx'
import { OnboardingProvider } from './OnboardingContext'

export function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <ToastProvider>
      <OnboardingProvider>
        <div className="flex h-screen overflow-hidden">
          <AppSidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
          <div className="flex-1 flex flex-col min-w-0">
            <AppTopbar onOpenNavigation={() => setMobileNavOpen(true)} />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
              <Suspense fallback={<PageLoader />}>
                <Outlet />
              </Suspense>
            </main>
          </div>
        </div>
      </OnboardingProvider>
    </ToastProvider>
  )
}

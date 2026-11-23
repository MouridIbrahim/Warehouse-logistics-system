import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'
import { AppTopbar } from './AppTopbar'
import { PageLoader } from './PageLoader'

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AppTopbar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth/auth-context'
import { ADMIN, ALL_ROLES, AUDIT_VIEW, OPERATIONS, SHIPMENT_VIEW, hasAnyRole } from '../../features/auth/permissions'

interface NavItem {
  label: string
  icon: string
  to: string
  roles: string[]
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Daily work',
    items: [
      { label: 'Receiving', icon: 'south_west', to: '/app/inbound', roles: ALL_ROLES },
      { label: 'Outbound orders', icon: 'north_east', to: '/app/outbound', roles: ALL_ROLES },
      { label: 'Shipments', icon: 'local_shipping', to: '/app/shipments', roles: SHIPMENT_VIEW },
    ],
  },
  {
    label: 'Stock & catalog',
    items: [
      { label: 'Inventory', icon: 'package_2', to: '/app/inventory', roles: ALL_ROLES },
      { label: 'Cycle counting', icon: 'qr_code_scanner', to: '/app/cycle-count', roles: OPERATIONS },
      { label: 'Products', icon: 'inventory_2', to: '/app/products', roles: ALL_ROLES },
      { label: 'Warehouses', icon: 'warehouse', to: '/app/warehouses', roles: ALL_ROLES },
    ],
  },
  {
    label: 'Reports & administration',
    items: [
      { label: 'Reports & Analytics', icon: 'monitoring', to: '/app/reports', roles: ALL_ROLES },
      { label: 'Audit Logs', icon: 'history', to: '/app/audit-logs', roles: AUDIT_VIEW },
      { label: 'User Management', icon: 'group', to: '/app/users', roles: ADMIN },
      { label: 'Roles & Permissions', icon: 'admin_panel_settings', to: '/app/roles', roles: ADMIN },
      { label: 'System Settings', icon: 'settings', to: '/app/settings', roles: ADMIN },
    ],
  },
  { label: 'Account', items: [{ label: 'My Profile', icon: 'person', to: '/app/profile', roles: ALL_ROLES }] },
]

export function AppSidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean
  onClose: () => void
}) {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ 'Daily work': true })

  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => hasAnyRole(user, item.roles)),
  })).filter((group) => group.items.length > 0)

  useEffect(() => {
    const activeGroup = NAV_GROUPS.find((group) =>
      group.items.some((item) => pathname === item.to || pathname.startsWith(`${item.to}/`)),
    )
    if (activeGroup) {
      setExpanded((current) => ({ ...current, [activeGroup.label]: true }))
    }
  }, [pathname])

  return (
    <>
    {mobileOpen && (
      <button
        type="button"
        className="fixed inset-0 z-20 bg-black/40 md:hidden"
        aria-label="Close navigation"
        onClick={onClose}
      />
    )}
    <aside className={`fixed inset-y-0 left-0 z-30 flex w-[250px] shrink-0 flex-col bg-sidebar-bg transition-transform md:static md:z-auto md:translate-x-0 ${
      mobileOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/5">
        <img src="/images/logo.png" alt="LogiTrack" className="w-9 h-9 rounded-lg object-cover shrink-0" />
        <div className="leading-tight">
          <div className="text-sidebar-text font-bold text-body-default tracking-tight">
            LOGISTICS<span className="text-primary"> OS</span>
          </div>
          <div className="text-sidebar-muted text-[10px] uppercase tracking-widest">Warehouse System</div>
        </div>
      </div>

      <nav id="app-navigation" aria-label="Main navigation" className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        <NavLink
          to="/app"
          end
          onClick={onClose}
          className={({ isActive }) =>
            `mb-4 flex items-center gap-3 rounded-lg px-3 py-2 text-body-default transition-colors ${
              isActive ? 'bg-primary text-on-primary' : 'text-sidebar-text hover:bg-white/5'
            }`
          }
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">dashboard</span>
          <span>Dashboard</span>
        </NavLink>
        {visibleGroups.map((group) => (
          <div key={group.label}>
            <button
              type="button"
              className="mb-1.5 flex w-full items-center justify-between rounded px-3 py-1 text-left text-[11px] font-semibold uppercase tracking-widest text-sidebar-muted/70 hover:text-sidebar-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              aria-expanded={expanded[group.label] ?? false}
              onClick={() => setExpanded((current) => ({ ...current, [group.label]: !current[group.label] }))}
            >
              {group.label}
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                {expanded[group.label] ? 'expand_less' : 'expand_more'}
              </span>
            </button>
            {expanded[group.label] && (
              <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-body-default transition-colors ${
                      isActive ? 'border-l-2 border-primary bg-white/10 pl-[10px] text-sidebar-text font-semibold' : 'text-sidebar-text hover:bg-white/5'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-white/5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-sidebar-muted/30 text-sidebar-text flex items-center justify-center font-semibold text-sm shrink-0">
          {user?.displayName?.charAt(0) ?? 'U'}
        </div>
        <div className="min-w-0 leading-tight">
          <div className="text-sidebar-text text-caption-meta font-semibold truncate">
            {user?.displayName ?? 'Unknown'}
          </div>
          <div className="text-sidebar-muted text-[11px] truncate">
            {user?.roles?.map((r) => r.replace('_', ' ').toLowerCase()).join(', ') ?? ''}
          </div>
        </div>
      </div>
    </aside>
    </>
  )
}

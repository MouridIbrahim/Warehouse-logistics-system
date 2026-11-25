import { NavLink } from 'react-router-dom'
import { useAuth } from '../../features/auth/auth-context'
import { ADMIN, ALL_ROLES, AUDIT_VIEW, SHIPMENT_VIEW, hasAnyRole } from '../../features/auth/permissions'

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
  { label: 'Overview', items: [{ label: 'Dashboard', icon: 'dashboard', to: '/app', roles: ALL_ROLES }] },
  {
    label: 'Catalog & Storage',
    items: [
      { label: 'Products', icon: 'inventory_2', to: '/app/products', roles: ALL_ROLES },
      { label: 'Warehouses', icon: 'warehouse', to: '/app/warehouses', roles: ALL_ROLES },
      { label: 'Inventory', icon: 'package_2', to: '/app/inventory', roles: ALL_ROLES },
      { label: 'Cycle Counting', icon: 'qr_code_scanner', to: '/app/cycle-count', roles: ALL_ROLES },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Inbound Operations', icon: 'south_west', to: '/app/inbound', roles: ALL_ROLES },
      { label: 'Outbound Operations', icon: 'north_east', to: '/app/outbound', roles: ALL_ROLES },
      { label: 'Shipments', icon: 'local_shipping', to: '/app/shipments', roles: SHIPMENT_VIEW },
    ],
  },
  {
    label: 'Insights',
    items: [
      { label: 'Reports & Analytics', icon: 'monitoring', to: '/app/reports', roles: ALL_ROLES },
      { label: 'Audit Logs', icon: 'history', to: '/app/audit-logs', roles: AUDIT_VIEW },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'User Management', icon: 'group', to: '/app/users', roles: ADMIN },
      { label: 'Roles & Permissions', icon: 'admin_panel_settings', to: '/app/roles', roles: ADMIN },
      { label: 'System Settings', icon: 'settings', to: '/app/settings', roles: ADMIN },
    ],
  },
  { label: 'Account', items: [{ label: 'My Profile', icon: 'person', to: '/app/profile', roles: ALL_ROLES }] },
]

export function AppSidebar() {
  const { user } = useAuth()

  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => hasAnyRole(user, item.roles)),
  })).filter((group) => group.items.length > 0)

  return (
    <aside className="w-[250px] shrink-0 bg-sidebar-bg flex flex-col">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/5">
        <img src="/images/logo.png" alt="LogiTrack" className="w-9 h-9 rounded-lg object-cover shrink-0" />
        <div className="leading-tight">
          <div className="text-sidebar-text font-bold text-body-default tracking-tight">
            LOGISTICS<span className="text-primary"> OS</span>
          </div>
          <div className="text-sidebar-muted text-[10px] uppercase tracking-widest">Warehouse System</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {visibleGroups.map((group) => (
          <div key={group.label}>
            <div className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-sidebar-muted/70">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/app'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-body-default transition-colors ${
                      isActive ? 'bg-primary text-on-primary' : 'text-sidebar-text hover:bg-white/5'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
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
  )
}

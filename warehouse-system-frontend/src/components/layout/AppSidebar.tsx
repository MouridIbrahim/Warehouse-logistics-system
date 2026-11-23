import { NavLink } from 'react-router-dom'
import { useAuth } from '../../features/auth/auth-context'

interface NavItem {
  label: string
  icon: string
  to: string
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  { label: 'Overview', items: [{ label: 'Dashboard', icon: 'dashboard', to: '/' }] },
  {
    label: 'Catalog & Storage',
    items: [
      { label: 'Products', icon: 'inventory_2', to: '/products' },
      { label: 'Warehouses', icon: 'warehouse', to: '/warehouses' },
      { label: 'Inventory', icon: 'package_2', to: '/inventory' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Inbound Operations', icon: 'south_west', to: '/inbound' },
      { label: 'Outbound Operations', icon: 'north_east', to: '/outbound' },
      { label: 'Shipments', icon: 'local_shipping', to: '/shipments' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { label: 'Reports & Analytics', icon: 'monitoring', to: '/reports' },
      { label: 'Audit Logs', icon: 'history', to: '/audit-logs' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'User Management', icon: 'group', to: '/users' },
      { label: 'Roles & Permissions', icon: 'admin_panel_settings', to: '/roles' },
      { label: 'System Settings', icon: 'settings', to: '/settings' },
    ],
  },
  { label: 'Account', items: [{ label: 'My Profile', icon: 'person', to: '/profile' }] },
]

export function AppSidebar() {
  const { user } = useAuth()

  return (
    <aside className="w-[250px] shrink-0 bg-sidebar-bg flex flex-col">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/5">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[20px] text-on-primary">local_shipping</span>
        </div>
        <div className="leading-tight">
          <div className="text-sidebar-text font-bold text-body-default tracking-tight">
            LOGISTICS<span className="text-primary"> OS</span>
          </div>
          <div className="text-sidebar-muted text-[10px] uppercase tracking-widest">Warehouse System</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-sidebar-muted/70">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-body-default transition-colors ${
                      isActive
                        ? 'bg-primary text-on-primary'
                        : 'text-sidebar-text hover:bg-white/5'
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

      {/* User profile */}
      <div className="px-4 py-3 border-t border-white/5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-sidebar-muted/30 text-sidebar-text flex items-center justify-center font-semibold text-sm shrink-0">
          {user?.displayName?.charAt(0) ?? 'U'}
        </div>
        <div className="min-w-0 leading-tight">
          <div className="text-sidebar-text text-caption-meta font-semibold truncate">
            {user?.displayName ?? 'Unknown'}
          </div>
          <div className="text-sidebar-muted text-[11px] truncate">{user?.roles?.[0]}</div>
        </div>
      </div>
    </aside>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../auth/auth-context'
import { ADMIN_MANAGER, AUDIT_VIEW, OPERATIONS, SHIPMENT_MANAGE, hasAnyRole } from '../auth/permissions'
import { fetchDashboard } from './api'

interface Stats {
  totalInventory: number
  pendingInbound: number
  pendingOutbound: number
  activeShipments: number
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-surface rounded-xl border border-border-default p-space-md shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-caption-meta font-semibold uppercase tracking-wider text-text-secondary">
          {label}
        </span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-status-info-bg text-status-info-text">
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        </div>
      </div>
      <div className="mt-3">
        <div className="text-display-kpi font-bold text-text-primary tabular-nums">{value}</div>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const loadDashboard = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchDashboard(undefined)
      .then((dash) => {
        const activeShipments = (dash.shipmentStatusCounts ?? [])
          .filter((s) => !['DELIVERED', 'CANCELLED'].includes(s.status))
          .reduce((sum, s) => sum + s.count, 0)
        setStats({
          totalInventory: dash.totalInventoryOnHand,
          pendingInbound: dash.pendingInboundOrders,
          pendingOutbound: dash.pendingOutboundOrders,
          activeShipments,
        })
      })
      .catch(() => setError('Dashboard data could not be loaded. Check your connection and try again.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const cards = hasAnyRole(user, ADMIN_MANAGER)
    ? [
        { label: 'Pending inbound', value: stats?.pendingInbound, icon: 'south_west' },
        { label: 'Pending outbound', value: stats?.pendingOutbound, icon: 'north_east' },
        { label: 'Active shipments', value: stats?.activeShipments, icon: 'local_shipping' },
        { label: 'Inventory units', value: stats?.totalInventory, icon: 'package_2' },
      ]
    : hasAnyRole(user, OPERATIONS)
      ? [
        { label: 'Pending inbound', value: stats?.pendingInbound, icon: 'south_west' },
        { label: 'Pending outbound', value: stats?.pendingOutbound, icon: 'north_east' },
        { label: 'Inventory units', value: stats?.totalInventory, icon: 'package_2' },
        ]
      : hasAnyRole(user, SHIPMENT_MANAGE)
        ? [
          { label: 'Active shipments', value: stats?.activeShipments, icon: 'local_shipping' },
          { label: 'Pending outbound', value: stats?.pendingOutbound, icon: 'north_east' },
          ]
        : hasAnyRole(user, AUDIT_VIEW)
          ? [
            { label: 'Inventory units', value: stats?.totalInventory, icon: 'package_2' },
            { label: 'Pending inbound', value: stats?.pendingInbound, icon: 'south_west' },
            { label: 'Pending outbound', value: stats?.pendingOutbound, icon: 'north_east' },
            ]
          : []

  const quickActions = [
    ...(hasAnyRole(user, OPERATIONS)
      ? [
          { icon: 'south_west', label: 'Receive goods', to: '/app/inbound/new' },
          { icon: 'north_east', label: 'Create outbound order', to: '/app/outbound/new' },
          { icon: 'qr_code_scanner', label: 'Cycle count', to: '/app/cycle-count' },
        ]
      : []),
    ...(hasAnyRole(user, SHIPMENT_MANAGE)
      ? [{ icon: 'local_shipping', label: 'Manage shipments', to: '/app/shipments' }]
      : []),
    ...(hasAnyRole(user, ADMIN_MANAGER)
      ? [
          { icon: 'inventory_2', label: 'Manage products', to: '/app/products' },
          { icon: 'warehouse', label: 'Manage warehouses', to: '/app/warehouses' },
        ]
      : []),
    ...(hasAnyRole(user, AUDIT_VIEW)
      ? [
          { icon: 'monitoring', label: 'View reports', to: '/app/reports' },
          { icon: 'history', label: 'Review audit logs', to: '/app/audit-logs' },
        ]
      : []),
  ]

  const roleDescription = hasAnyRole(user, OPERATIONS)
    ? 'Focus on receiving, dispatch preparation, and accurate stock records.'
    : hasAnyRole(user, SHIPMENT_MANAGE)
      ? 'Focus on shipment status and delivery progress.'
      : hasAnyRole(user, AUDIT_VIEW)
        ? 'Review warehouse activity, reports, and audit history.'
        : 'Use the shortcuts below to access the areas available to your account.'

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-headline-h1 font-bold text-text-primary">Dashboard</h1>
          </div>
          <p className="text-body-default text-text-secondary mt-0.5">
            {roleDescription}
          </p>
        </div>
      </div>

      {error ? (
        <div role="alert" className="mt-6 flex flex-col items-start gap-3 rounded-lg bg-status-danger-bg p-4 text-status-danger-text sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <Button variant="secondary" onClick={loadDashboard}>Retry</Button>
        </div>
      ) : (
        <>
          {loading && !stats ? (
            <p role="status" className="mt-6 text-body-default text-text-secondary">Loading your operational summary…</p>
          ) : stats && cards.length > 0 ? (
            <div aria-busy={loading} className="mt-6 grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => (
                <StatCard
                  key={card.label}
                  label={card.label}
                  value={card.value?.toLocaleString() ?? '—'}
                  icon={card.icon}
                />
              ))}
            </div>
          ) : null}

          <div className="mt-6 bg-surface rounded-xl border border-border-default p-space-lg shadow-sm">
            <h2 className="text-headline-h3 font-semibold text-text-primary">Your shortcuts</h2>
            <p className="text-caption-meta text-text-secondary mt-0.5">Common tasks for your role</p>
            {quickActions.length > 0 ? (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.to}
                    to={action.to}
                    className="flex min-h-12 items-center gap-3 rounded-lg border border-border-default p-3 text-body-semibold text-text-primary transition-colors hover:bg-app-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <span className="material-symbols-outlined text-[20px] text-primary" aria-hidden="true">{action.icon}</span>
                    {action.label}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-body-default text-text-secondary">No shortcuts are available for this account.</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

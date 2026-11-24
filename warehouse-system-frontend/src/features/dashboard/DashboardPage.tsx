import { useEffect, useState } from 'react'
import { fetchDashboard, fetchProductCount, fetchWarehouseCount } from './api'

interface Stats {
  totalProducts: number
  totalWarehouses: number
  totalInventory: number
  pendingInbound: number
  pendingOutbound: number
  activeShipments: number
  inboundVolume: number
  outboundVolume: number
}

function StatCard({
  label,
  value,
  icon,
  tone = 'neutral',
  hint,
}: {
  label: string
  value: string
  icon: string
  tone?: 'neutral' | 'success' | 'warning' | 'info' | 'danger'
  hint?: string
}) {
  const iconTone: Record<string, string> = {
    neutral: 'bg-status-neutral-bg text-status-neutral-text',
    success: 'bg-status-success-bg text-status-success-text',
    warning: 'bg-status-warning-bg text-status-warning-text',
    info: 'bg-status-info-bg text-status-info-text',
    danger: 'bg-status-danger-bg text-status-danger-text',
  }

  return (
    <div className="bg-surface rounded-xl border border-border-default p-space-md shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-caption-meta font-semibold uppercase tracking-wider text-text-secondary">
          {label}
        </span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconTone[tone]}`}>
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        </div>
      </div>
      <div className="mt-3">
        <div className="text-display-kpi font-bold text-text-primary tabular-nums">{value}</div>
        {hint && <div className="text-caption-meta text-text-secondary mt-0.5">{hint}</div>}
      </div>
    </div>
  )
}

export function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetchDashboard(undefined),
      fetchProductCount(),
      fetchWarehouseCount(),
    ])
      .then(([dash, products, warehouseCount]) => {
        const activeShipments = (dash.shipmentStatusCounts ?? [])
          .filter((s) => !['DELIVERED', 'CANCELLED'].includes(s.status))
          .reduce((sum, s) => sum + s.count, 0)
        setStats({
          totalProducts: products,
          totalWarehouses: warehouseCount,
          totalInventory: dash.totalInventoryOnHand,
          pendingInbound: dash.pendingInboundOrders,
          pendingOutbound: dash.pendingOutboundOrders,
          activeShipments,
          inboundVolume: dash.inboundVolume,
          outboundVolume: dash.outboundVolume,
        })
      })
      .catch(() => setError('Failed to load dashboard data.'))
  }, [])

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-headline-h1 font-bold text-text-primary">Dashboard</h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-neutral-bg text-status-neutral-text text-caption-meta">
              <span className="w-1.5 h-1.5 rounded-full bg-text-secondary" />
              Live Data
            </span>
          </div>
          <p className="text-body-default text-text-secondary mt-0.5">
            Real-time overview of warehouse transit operations.
          </p>
        </div>
      </div>

      {error ? (
        <div className="mt-6 p-4 rounded-lg bg-status-danger-bg text-status-danger-text">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-space-md mt-6">
          <StatCard label="Total Products" value={stats ? stats.totalProducts.toLocaleString() : '—'} icon="inventory_2" />
          <StatCard label="Warehouses" value={stats ? stats.totalWarehouses.toLocaleString() : '—'} icon="warehouse" />
          <StatCard label="Inventory Units" value={stats ? stats.totalInventory.toLocaleString() : '—'} icon="package_2" tone="info" />
          <StatCard label="Pending Inbound" value={stats ? stats.pendingInbound.toLocaleString() : '—'} icon="south_west" tone="warning" />
          <StatCard label="Pending Outbound" value={stats ? stats.pendingOutbound.toLocaleString() : '—'} icon="north_east" tone="info" />
          <StatCard label="Active Shipments" value={stats ? stats.activeShipments.toLocaleString() : '—'} icon="local_shipping" tone="success" />
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg mt-6">
          <div className="bg-surface rounded-xl border border-border-default p-space-lg shadow-sm">
            <h2 className="text-headline-h3 font-semibold text-text-primary">Throughput Volume</h2>
            <p className="text-caption-meta text-text-secondary mt-0.5">Cumulative inbound vs outbound units</p>
            <div className="mt-4 flex items-end gap-8">
              <div className="flex-1">
                <div className="text-caption-meta text-text-secondary uppercase tracking-wider">Inbound</div>
                <div className="text-display-kpi font-bold text-text-primary tabular-nums mt-1">
                  {stats.inboundVolume.toLocaleString()}
                </div>
                <div className="mt-2 h-2 rounded-full bg-status-neutral-bg overflow-hidden">
                  <div className="h-full bg-status-info rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
              <div className="flex-1">
                <div className="text-caption-meta text-text-secondary uppercase tracking-wider">Outbound</div>
                <div className="text-display-kpi font-bold text-text-primary tabular-nums mt-1">
                  {stats.outboundVolume.toLocaleString()}
                </div>
                <div className="mt-2 h-2 rounded-full bg-status-neutral-bg overflow-hidden">
                  <div className="h-full bg-sidebar-bg rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-border-default p-space-lg shadow-sm">
            <h2 className="text-headline-h3 font-semibold text-text-primary">Quick Actions</h2>
            <p className="text-caption-meta text-text-secondary mt-0.5">Common operational routines</p>
            <div className="grid grid-cols-2 gap-space-md mt-4">
              {[
                { icon: 'south_west', label: 'Receive Goods', to: '/app/inbound' },
                { icon: 'north_east', label: 'Create Outbound', to: '/app/outbound' },
                { icon: 'inventory_2', label: 'Manage Products', to: '/app/products' },
                { icon: 'local_shipping', label: 'Track Shipments', to: '/app/shipments' },
              ].map((a) => (
                <a
                  key={a.label}
                  href={a.to}
                  className="p-4 rounded-xl bg-app-bg hover:bg-surface-container transition-colors text-left flex flex-col gap-2"
                >
                  <span className="material-symbols-outlined text-[20px] text-primary">{a.icon}</span>
                  <span className="text-body-semibold text-text-primary">{a.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

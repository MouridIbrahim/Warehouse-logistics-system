import { useEffect, useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Select } from '../../components/ui/Select'
import { fetchDashboard, downloadCustomReport } from '../dashboard/api'
import type { DashboardDto } from '../dashboard/api'
import { listWarehouses } from '../warehouses/api'
import type { WarehouseDto } from '../warehouses/api'
import { shipmentBadge } from '../shipments/ShipmentsPage'

function KpiCard({
  label,
  value,
  icon,
  tone = 'neutral',
}: {
  label: string
  value: string
  icon: string
  tone?: 'success' | 'info' | 'warning' | 'neutral'
}) {
  const iconTone: Record<string, string> = {
    success: 'bg-status-success-bg text-status-success-text',
    info: 'bg-status-info-bg text-status-info-text',
    warning: 'bg-status-warning-bg text-status-warning-text',
    neutral: 'bg-status-neutral-bg text-status-neutral-text',
  }
  return (
    <div className="bg-surface rounded-xl border border-border-default p-space-md shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-caption-meta font-semibold uppercase tracking-wider text-text-secondary">
          {label}
        </span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconTone[tone]}`}>
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        </div>
      </div>
      <div className="mt-3 text-display-kpi font-bold text-text-primary tabular-nums">{value}</div>
    </div>
  )
}

export function ReportsPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [warehouseId, setWarehouseId] = useState<number | null>(null)
  const [warehouses, setWarehouses] = useState<WarehouseDto[]>([])
  const [data, setData] = useState<DashboardDto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listWarehouses(undefined, 0, 100).then((d) => setWarehouses(d.content))
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchDashboard(warehouseId || undefined, from || undefined, to || undefined)
      .then(setData)
      .finally(() => setLoading(false))
  }, [warehouseId, from, to])

  const maxVolume = data ? Math.max(data.inboundVolume, data.outboundVolume, 1) : 1

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        description="Consolidated view of warehouse operations."
      />

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-form-label text-text-primary">From</label>
          <input
            type="date"
            className="h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-form-label text-text-primary">To</label>
          <input
            type="date"
            className="h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        {(from || to) && (
          <Button
            variant="ghost"
            onClick={() => {
              setFrom('')
              setTo('')
            }}
          >
            Clear
          </Button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-form-label text-text-primary">Warehouse</label>
          <Select
            value={warehouseId ? String(warehouseId) : ''}
            onChange={(v) => setWarehouseId(v ? Number(v) : null)}
            placeholder="All warehouses"
            options={warehouses.map((w) => ({ value: String(w.id), label: w.code + ' — ' + w.name }))}
          />
        </div>
        <div className="flex items-end gap-2">
          <Button
            variant="secondary"
            onClick={() =>
              downloadCustomReport(
                'inventory-movements',
                warehouseId || undefined,
                from || undefined,
                to || undefined,
              )
                .then((blob) => downloadBlob(blob, 'inventory-movements.csv'))
                .catch((err) => {
                  alert('Export failed: ' + (err?.message ?? String(err)))
                })
            }
          >
            <span className="material-symbols-outlined mr-1">inventory_2</span>
            Inventory Movements
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              downloadCustomReport(
                'inbound-summary',
                warehouseId || undefined,
                from || undefined,
                to || undefined,
              )
                .then((blob) => downloadBlob(blob, 'inbound-summary.csv'))
                .catch((err) => {
                  alert('Export failed: ' + (err?.message ?? String(err)))
                })
            }
          >
            <span className="material-symbols-outlined mr-1">inventory_2</span>
            Inbound Summary
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              downloadCustomReport(
                'outbound-summary',
                warehouseId || undefined,
                from || undefined,
                to || undefined,
              )
                .then((blob) => downloadBlob(blob, 'outbound-summary.csv'))
                .catch((err) => {
                  alert('Export failed: ' + (err?.message ?? String(err)))
                })
            }
          >
            <span className="material-symbols-outlined mr-1">outbox</span>
            Outbound Summary
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              downloadCustomReport(
                'shipment-summary',
                warehouseId || undefined,
                from || undefined,
                to || undefined,
              )
                .then((blob) => downloadBlob(blob, 'shipment-summary.csv'))
                .catch((err) => {
                  alert('Export failed: ' + (err?.message ?? String(err)))
                })
            }
          >
            <span className="material-symbols-outlined mr-1">local_shipping</span>
            Shipment Summary
          </Button>
        </div>
      </div>

      {loading && !data ? (
        <div className="mt-6 text-text-secondary">
          <span className="material-symbols-outlined animate-spin align-middle mr-2">sync</span>
          Loading reports...
        </div>
      ) : data ? (
        <>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-md">
            <KpiCard label="Inbound Volume" value={data.inboundVolume.toLocaleString()} icon="south_west" tone="info" />
            <KpiCard label="Outbound Volume" value={data.outboundVolume.toLocaleString()} icon="north_east" tone="info" />
            <KpiCard label="Inventory On Hand" value={data.totalInventoryOnHand.toLocaleString()} icon="package_2" />
            <KpiCard label="Pending Inbound" value={data.pendingInboundOrders.toLocaleString()} icon="inventory_2" tone="warning" />
            <KpiCard label="Pending Outbound" value={data.pendingOutboundOrders.toLocaleString()} icon="outbox" tone="warning" />
          </div>

          <div className="mt-6 bg-surface rounded-xl border border-border-default p-space-lg shadow-sm">
            <h2 className="text-headline-h3 font-semibold text-text-primary">Volume Comparison</h2>
            <div className="mt-6 space-y-4">
              <div>
                <div className="flex justify-between text-caption-meta text-text-secondary mb-1.5">
                  <span>Inbound Volume</span>
                  <span className="font-semibold tabular-nums text-text-primary">
                    {data.inboundVolume.toLocaleString()}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-status-neutral-bg overflow-hidden">
                  <div
                    className="h-full bg-status-info rounded-full"
                    style={{ width: `${(data.inboundVolume / maxVolume) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-caption-meta text-text-secondary mb-1.5">
                  <span>Outbound Volume</span>
                  <span className="font-semibold tabular-nums text-text-primary">
                    {data.outboundVolume.toLocaleString()}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-status-neutral-bg overflow-hidden">
                  <div
                    className="h-full bg-sidebar-bg rounded-full"
                    style={{ width: `${(data.outboundVolume / maxVolume) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <p className="text-caption-meta text-text-secondary mt-4">
              Volumes are cumulative totals for the selected period. Trend history
              requires a date-range-specific query API.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-surface rounded-xl border border-border-default p-space-lg shadow-sm">
              <h2 className="text-headline-h3 font-semibold text-text-primary">Inbound vs Outbound Volume</h2>
              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex justify-between text-caption-meta text-text-secondary mb-1.5">
                    <span>Inbound</span>
                    <span className="font-semibold tabular-nums text-text-primary">
                      {data.inboundVolume.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-status-neutral-bg overflow-hidden">
                    <div
                      className="h-full bg-status-info rounded-full"
                      style={{ width: `${(data.inboundVolume / maxVolume) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-caption-meta text-text-secondary mb-1.5">
                    <span>Outbound</span>
                    <span className="font-semibold tabular-nums text-text-primary">
                      {data.outboundVolume.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-status-neutral-bg overflow-hidden">
                    <div
                      className="h-full bg-sidebar-bg rounded-full"
                      style={{ width: `${(data.outboundVolume / maxVolume) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-border-default p-space-lg shadow-sm">
              <h2 className="text-headline-h3 font-semibold text-text-primary">Shipment Status</h2>
              <div className="mt-4 space-y-2">
                {data.shipmentStatusCounts.length === 0 ? (
                  <p className="text-body-default text-text-secondary">No shipments in the selected period.</p>
                ) : (
                  data.shipmentStatusCounts.map((s) => (
                    <div key={s.status} className="flex items-center justify-between py-1.5 border-b border-border-default/50 last:border-0">
                      <StatusBadge tone={shipmentBadge(s.status).tone}>{shipmentBadge(s.status).label}</StatusBadge>
                      <span className="font-semibold tabular-nums text-text-primary">{s.count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { PageResponse } from '../../types'
import { formatDateTime } from '../../lib/format'
import { getErrorMessage } from '../../lib/api'
import { useAuth } from '../auth/auth-context'
import { PageHeader } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { EmptyState } from '../../components/ui/EmptyState'
import { Modal } from '../../components/ui/Modal'
import { FilterToolbar } from '../../components/ui/filter'
import { ActiveFilterChips } from '../../components/ui/filter'
import { listOutboundOrders } from '../outbound/api'
import { createShipment, listShipments, exportShipments, splitShipment } from './api'
import type { ShipmentDto } from './api'

export function shipmentBadge(status: string): { tone: 'success' | 'warning' | 'info' | 'danger' | 'neutral'; label: string } {
  switch (status) {
    case 'DELIVERED':
      return { tone: 'success', label: 'Delivered' }
    case 'PENDING':
      return { tone: 'warning', label: 'Pending' }
    case 'PREPARED':
    case 'IN_TRANSIT':
      return { tone: 'info', label: status === 'PREPARED' ? 'Prepared' : 'In Transit' }
    case 'DELAYED':
      return { tone: 'danger', label: 'Delayed' }
    case 'CANCELLED':
      return { tone: 'neutral', label: 'Cancelled' }
    default:
      return { tone: 'neutral', label: status }
  }
}

const SHIPMENT_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PREPARED', label: 'Prepared' },
  { value: 'IN_TRANSIT', label: 'In Transit' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'DELAYED', label: 'Delayed' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export function ShipmentsPage() {
  const { user } = useAuth()
  const canManage = !!user?.roles.some((r) =>
    ['ADMINISTRATOR', 'WAREHOUSE_MANAGER', 'SHIPMENT_MANAGER'].includes(r),
  )
  const [term, setTerm] = useState('')
  const [status, setStatus] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [data, setData] = useState<PageResponse<ShipmentDto> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [splitTarget, setSplitTarget] = useState<ShipmentDto | null>(null)
  const [splitTracking, setSplitTracking] = useState('')
  const [splitCarrier, setSplitCarrier] = useState('')

  useEffect(() => {
    setLoading(true)
    setError(null)
    listShipments(term || undefined, status || undefined, page, size, from || undefined, to || undefined)
      .then(setData)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [term, status, from, to, page, size])

  function refresh() {
    setLoading(true)
    setError(null)
    listShipments(term || undefined, status || undefined, page, size, from || undefined, to || undefined)
      .then(setData)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  const activeChips = [
    ...(term ? [{ key: 'search', label: `Search: "${term}"`, value: term, onRemove: () => setTerm('') }] : []),
    ...(status
      ? [{ key: 'status', label: `Status: ${SHIPMENT_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status}`, value: status, onRemove: () => setStatus('') }]
      : []),
    ...(from ? [{ key: 'from', label: `From: ${from}`, value: from, onRemove: () => setFrom('') }] : []),
    ...(to ? [{ key: 'to', label: `To: ${to}`, value: to, onRemove: () => setTo('') }] : []),
  ]

  return (
    <div>
      <PageHeader
        title="Shipments"
        description="Monitor outgoing shipments."
        actions={
          canManage && (
            <Button icon="add" onClick={() => setShowCreate(true)}>
              Create Shipment
            </Button>
          )
        }
      />

      {error && (
        <div role="alert" className="mt-4 p-3 rounded-lg bg-status-danger-bg text-status-danger-text text-caption-meta">
          Could not load shipments: {error}
        </div>
      )}

      {activeChips.length > 0 && (
        <ActiveFilterChips chips={activeChips} onClearAll={() => { setTerm(''); setStatus(''); setFrom(''); setTo('') }} />
      )}

      <div className="mt-6 bg-surface rounded-xl border border-border-default shadow-sm overflow-hidden">
        <div className="p-space-md border-b border-border-default">
          <FilterToolbar
            search={{
              value: term,
              onChange: setTerm,
              placeholder: 'Search tracking number...',
            }}
            selects={[
              {
                key: 'status',
                value: status,
                onChange: setStatus,
                options: SHIPMENT_STATUS_OPTIONS,
                placeholder: 'All statuses',
              },
            ]}
            dateRange={{
              startValue: from,
              endValue: to,
              onStartChange: setFrom,
              onEndChange: setTo,
            }}
            onReset={() => { setTerm(''); setStatus(''); setFrom(''); setTo('') }}
          />
          <Button
            variant="secondary"
            className="ml-2"
            onClick={() => exportShipments(term || undefined, status || undefined, from || undefined, to || undefined)}
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export CSV
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-app-bg text-table-header uppercase text-text-secondary select-none">
              <tr>
                <th className="px-4 py-3">Tracking #</th>
                <th className="px-4 py-3">Outbound Order</th>
                <th className="px-4 py-3">Carrier</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3">Dispatched</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/60 text-body-default text-text-primary">
              {loading && !data ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">
                    <span className="material-symbols-outlined animate-spin align-middle mr-2">sync</span>
                    Loading shipments...
                  </td>
                </tr>
              ) : error && !data ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-status-danger-text">
                    Shipments could not be loaded.
                  </td>
                </tr>
              ) : data && data.content.length > 0 ? (
                data.content.map((s) => {
                  const badge = shipmentBadge(s.status)
                  return (
                    <tr key={s.id} className="hover:bg-app-bg/50 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          to={`/app/shipments/${s.id}`}
                          className="text-body-semibold tabular-nums text-text-primary hover:text-primary"
                        >
                          {s.trackingNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className="tabular-nums text-text-secondary">{s.outboundReferenceNumber}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-table-data text-text-secondary">{s.carrierName ?? '—'}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge tone={badge.tone}>{badge.label}</StatusBadge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-table-data text-text-secondary tabular-nums">
                          {formatDateTime(s.shippedAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/app/shipments/${s.id}`}
                          className="p-1 rounded text-text-secondary hover:text-primary transition-colors"
                          title="View details"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </Link>
                        {s.status !== 'DELIVERED' && s.status !== 'CANCELLED' && (
                          <button
                            type="button"
                            className="p-2 rounded text-text-secondary hover:text-status-danger-text transition-colors"
                            onClick={() => {
                              setSplitTarget(s)
                              setSplitTracking(s.trackingNumber)
                              setSplitCarrier(s.carrierName || '')
                            }}
                            title="Split shipment"
                          >
                            <span className="material-symbols-outlined text-[18px]">content_copy</span>
                          </button>
                        )}
                      </div>
                    </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon="local_shipping"
                      title="No shipments"
                      description="Create a shipment for a dispatched outbound order."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data && data.totalElements > 0 && (
          <Pagination
            page={page}
            totalPages={data.totalPages}
            totalElements={data.totalElements}
            size={size}
            onPageChange={setPage}
            onSizeChange={(s) => {
              setSize(s)
              setPage(0)
            }}
          />
        )}
      </div>

      <CreateShipmentModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={refresh} />
      {splitTarget != null && (
        <SplitShipmentModal
          open={splitTarget != null}
          onClose={() => { setSplitTarget(null); setSplitTracking(''); setSplitCarrier('') }}
          splitTarget={splitTarget!}
          initialTracking={splitTracking}
          initialCarrier={splitCarrier}
          onSplit={refresh}
        />
      )}
    </div>
  )
}

function CreateShipmentModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: () => void
}) {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [outboundOrderId, setOutboundOrderId] = useState('')
  const [carrierName, setCarrierName] = useState('')
  const [outboundOptions, setOutboundOptions] = useState<{ value: string; label: string }[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      listOutboundOrders(undefined, 'DISPATCHED', 0, 100).then((d) =>
        setOutboundOptions(d.content.map((o) => ({ value: String(o.id), label: o.referenceNumber }))),
      )
    }
  }, [open])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await createShipment({
        trackingNumber,
        outboundOrderId: Number(outboundOrderId),
        carrierName: carrierName || undefined,
      })
      setTrackingNumber('')
      setOutboundOrderId('')
      setCarrierName('')
      onCreated()
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Shipment">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <label className="text-form-label text-text-primary">Tracking number *</label>
          <input
            className="h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="e.g. TRK-0000001"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-form-label text-text-primary">Outbound order *</label>
          <Select
            value={outboundOrderId}
            onChange={setOutboundOrderId}
            placeholder="Select dispatched order"
            options={outboundOptions}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-form-label text-text-primary">Carrier</label>
          <input
            className="h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="e.g. DHL Express"
            value={carrierName}
            onChange={(e) => setCarrierName(e.target.value)}
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-status-danger-bg text-status-danger-text text-caption-meta">{error}</div>
        )}

        <div className="flex items-center justify-end gap-2 mt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Shipment'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function SplitShipmentModal({
  open,
  onClose,
  splitTarget,
  initialTracking,
  initialCarrier,
  onSplit,
}: {
  open: boolean
  onClose: () => void
  splitTarget: ShipmentDto
  initialTracking: string
  initialCarrier: string
  onSplit: () => void
}) {
  const [trackingNumber, setTrackingNumber] = useState(initialTracking)
  const [carrierName, setCarrierName] = useState(initialCarrier)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await splitShipment(splitTarget.id, trackingNumber, carrierName || undefined)
      setTrackingNumber('')
      setCarrierName('')
      onClose()
      onSplit()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Split Shipment">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <label className="text-form-label text-text-primary">Original tracking number</label>
          <span className="text-table-data text-text-secondary tabular-nums">{splitTarget.trackingNumber}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-form-label text-text-primary">New tracking number *</label>
          <input
            className="h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="e.g. TRK-0000002"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-form-label text-text-primary">Carrier</label>
          <input
            className="h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="e.g. DHL Express"
            value={carrierName}
            onChange={(e) => setCarrierName(e.target.value)}
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-status-danger-bg text-status-danger-text text-caption-meta">{error}</div>
        )}

        <div className="flex items-center justify-end gap-2 mt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Splitting...' : 'Split Shipment'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getErrorMessage } from '../../lib/api'
import { formatDateTime } from '../../lib/format'
import { useAuth } from '../auth/auth-context'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Modal } from '../../components/ui/Modal'
import { getShipment, getShipmentHistory, SHIPMENT_TRANSITIONS, updateShipmentStatus } from './api'
import { shipmentBadge } from './ShipmentsPage'
import type { ShipmentDto, ShipmentStatusHistoryDto } from './api'

const FLOW = ['PENDING', 'PREPARED', 'IN_TRANSIT', 'DELIVERED']

export function ShipmentDetailsPage() {
  const { id } = useParams()
  const shipmentId = Number(id)
  const { user } = useAuth()
  const canManage = !!user?.roles.some((r) =>
    ['ADMINISTRATOR', 'WAREHOUSE_MANAGER', 'SHIPMENT_MANAGER'].includes(r),
  )
  const [shipment, setShipment] = useState<ShipmentDto | null>(null)
  const [history, setHistory] = useState<ShipmentStatusHistoryDto[]>([])
  const [statusOpen, setStatusOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    getShipment(shipmentId)
      .then(setShipment)
      .catch(() => setError('Shipment not found'))
    getShipmentHistory(shipmentId).then(setHistory)
  }, [shipmentId])

  async function handleStatusChange(status: string, note?: string) {
    setUpdating(true)
    setError(null)
    try {
      const updated = await updateShipmentStatus(shipmentId, status, note)
      setShipment(updated)
      setHistory(await getShipmentHistory(shipmentId))
      setStatusOpen(false)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setUpdating(false)
    }
  }

  if (error) {
    return <div className="p-4 rounded-lg bg-status-danger-bg text-status-danger-text">{error}</div>
  }

  if (!shipment) {
    return <div className="text-text-secondary">Loading...</div>
  }

  const badge = shipmentBadge(shipment.status)
  const allowed = SHIPMENT_TRANSITIONS[shipment.status] ?? []
  const flowIndex = FLOW.indexOf(shipment.status)

  return (
    <div>
      <div className="text-caption-meta text-text-secondary mb-2 flex items-center gap-1.5">
        <Link to="/app/shipments" className="hover:text-primary">
          Shipments
        </Link>
        <span className="text-text-secondary/50">/</span>
        <span className="text-text-primary font-semibold">{shipment.trackingNumber}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-headline-h1 font-bold text-text-primary">{shipment.trackingNumber}</h1>
            <StatusBadge tone={badge.tone}>{badge.label}</StatusBadge>
          </div>
          <p className="text-body-default text-text-secondary mt-0.5">
            Outbound {shipment.outboundReferenceNumber} · {shipment.carrierName ?? 'No carrier'}
          </p>
        </div>
        {canManage && allowed.length > 0 && (
          <Button icon="update" onClick={() => setStatusOpen(true)}>
            Update Status
          </Button>
        )}
      </div>

      {/* Status stepper */}
      <div className="mt-6 bg-surface rounded-xl border border-border-default p-space-lg shadow-sm">
        <div className="flex items-center">
          {FLOW.map((s, i) => {
            const reached = flowIndex >= i && flowIndex !== -1
            const current = shipment.status === s
            return (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      reached ? 'bg-primary text-on-primary' : 'bg-status-neutral-bg text-status-neutral-text'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span
                    className={`mt-1.5 text-caption-meta ${
                      current ? 'font-semibold text-text-primary' : 'text-text-secondary'
                    }`}
                  >
                    {s.replace('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                </div>
                {i < FLOW.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${reached && flowIndex > i ? 'bg-primary' : 'bg-status-neutral-bg'}`} />
                )}
              </div>
            )
          })}
        </div>
        {(shipment.status === 'DELAYED' || shipment.status === 'CANCELLED') && (
          <div className="mt-4 p-3 rounded-lg bg-status-neutral-bg text-caption-meta text-text-secondary">
            This shipment is <strong className="text-text-primary">{shipment.status.toLowerCase()}</strong>.
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="bg-surface rounded-xl border border-border-default p-space-lg shadow-sm">
            <h2 className="text-headline-h3 font-semibold text-text-primary">Details</h2>
            <dl className="mt-3 space-y-2 text-body-default">
              <div className="flex justify-between">
                <dt className="text-text-secondary">Tracking #</dt>
                <dd className="font-semibold text-text-primary tabular-nums">{shipment.trackingNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">Outbound order</dt>
                <dd className="font-semibold text-text-primary">{shipment.outboundReferenceNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">Carrier</dt>
                <dd className="font-semibold text-text-primary">{shipment.carrierName ?? '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">Shipped</dt>
                <dd className="font-semibold text-text-primary">{formatDateTime(shipment.shippedAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">Delivered</dt>
                <dd className="font-semibold text-text-primary">{formatDateTime(shipment.deliveredAt)}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="lg:col-span-2 bg-surface rounded-xl border border-border-default shadow-sm overflow-hidden">
          <div className="p-space-md border-b border-border-default">
            <h2 className="text-headline-h3 font-semibold text-text-primary">Status History</h2>
          </div>
          <div className="p-space-md">
            {history.length === 0 ? (
              <p className="text-body-default text-text-secondary">No status changes recorded yet.</p>
            ) : (
              <div className="relative pl-5 space-y-4">
                <div className="absolute top-1 bottom-1 left-1.5 w-0.5 bg-status-neutral-bg" />
                {history.map((h) => (
                  <div key={h.id} className="relative flex items-start gap-3">
                    <span className="absolute -left-[18px] top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-surface" />
                    <div className="text-body-default">
                      <div className="text-text-primary">
                        <strong className="font-semibold">{h.changedByName}</strong> changed status{' '}
                        {h.previousStatus ? (
                          <>
                            from <span className="text-text-secondary">{h.previousStatus}</span>{' '}
                          </>
                        ) : (
                          ''
                        )}
                        to <strong className="text-primary">{h.newStatus}</strong>
                      </div>
                      <div className="text-caption-meta text-text-secondary mt-0.5">
                        {formatDateTime(h.changedAt)}
                        {h.note ? ` · ${h.note}` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <UpdateStatusModal
        open={statusOpen}
        current={shipment.status}
        allowed={allowed}
        onClose={() => setStatusOpen(false)}
        onConfirm={handleStatusChange}
        updating={updating}
      />
    </div>
  )
}

function UpdateStatusModal({
  open,
  current,
  allowed,
  onClose,
  onConfirm,
  updating,
}: {
  open: boolean
  current: string
  allowed: string[]
  onClose: () => void
  onConfirm: (status: string, note?: string) => void
  updating: boolean
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const [note, setNote] = useState('')

  return (
    <Modal open={open} onClose={onClose} title="Update Status">
      <p className="text-body-default text-text-secondary">
        Current status: <strong className="text-text-primary">{current}</strong>
      </p>
      <div className="mt-4 space-y-2">
        {allowed.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSelected(s)}
            className={`w-full text-left px-4 py-2.5 rounded-lg border transition-colors ${
              selected === s
                ? 'border-primary bg-primary/5 text-text-primary'
                : 'border-border-default text-text-primary hover:bg-app-bg'
            }`}
          >
            {s.replace('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-1.5">
        <label className="text-form-label text-text-primary">Note (optional)</label>
        <input
          className="h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="e.g. Handed to carrier"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <div className="flex items-center justify-end gap-2 mt-6">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          disabled={!selected || updating}
          onClick={() => selected && onConfirm(selected, note || undefined)}
        >
          {updating ? 'Updating...' : 'Update Status'}
        </Button>
      </div>
    </Modal>
  )
}

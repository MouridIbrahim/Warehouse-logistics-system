import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getErrorMessage } from '../../lib/api'
import { formatDateTime } from '../../lib/format'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Modal } from '../../components/ui/Modal'
import { useAuth } from '../auth/auth-context'
import { OPERATIONS, hasAnyRole } from '../auth/permissions'
import { confirmInboundOrder, getInboundOrder } from './api'
import type { InboundOrderDto } from './api'

export function InboundOrderDetailsPage() {
  const { user } = useAuth()
  const canOperate = hasAnyRole(user, OPERATIONS)
  const { id } = useParams()
  const orderId = Number(id)
  const [order, setOrder] = useState<InboundOrderDto | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    getInboundOrder(orderId)
      .then(setOrder)
      .catch(() => setError('Inbound order not found'))
  }, [orderId])

  async function handleConfirm() {
    setConfirming(true)
    setError(null)
    try {
      const updated = await confirmInboundOrder(orderId)
      setOrder(updated)
      setConfirmOpen(false)
    } catch (err) {
      setError(getErrorMessage(err))
      setConfirmOpen(false)
    } finally {
      setConfirming(false)
    }
  }

  if (error) {
    return <div className="p-4 rounded-lg bg-status-danger-bg text-status-danger-text">{error}</div>
  }

  if (!order) {
    return <div className="text-text-secondary">Loading...</div>
  }

  return (
    <div>
      <div className="text-caption-meta text-text-secondary mb-2 flex items-center gap-1.5">
        <Link to="/app/inbound" className="hover:text-primary">
          Inbound Operations
        </Link>
        <span className="text-text-secondary/50">/</span>
        <span className="text-text-primary font-semibold">{order.referenceNumber}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-headline-h1 font-bold text-text-primary">{order.referenceNumber}</h1>
            <StatusBadge tone={order.status === 'CONFIRMED' ? 'success' : 'warning'}>
              {order.status === 'CONFIRMED' ? 'Confirmed' : 'Draft'}
            </StatusBadge>
          </div>
          <p className="text-body-default text-text-secondary mt-0.5">
            Warehouse #{order.warehouseId} · Created by {order.createdByName}
          </p>
        </div>
        {canOperate && order.status === 'DRAFT' && (
          <Button icon="check_circle" onClick={() => setConfirmOpen(true)}>
            Confirm Receipt
          </Button>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface rounded-xl border border-border-default shadow-sm overflow-hidden">
          <div className="p-space-md border-b border-border-default">
            <h2 className="text-headline-h3 font-semibold text-text-primary">Items</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-app-bg text-table-header uppercase text-text-secondary select-none">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3 text-right">Received Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default/60 text-body-default text-text-primary">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-body-semibold text-text-primary">{item.productName}</span>
                        <span className="text-caption-meta text-text-secondary tabular-nums">{item.productSku}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-body-semibold tabular-nums text-text-primary">{item.storageLocationCode}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold tabular-nums text-text-primary">{item.receivedQuantity}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-surface rounded-xl border border-border-default p-space-lg shadow-sm">
            <h2 className="text-headline-h3 font-semibold text-text-primary">Details</h2>
            <dl className="mt-3 space-y-2 text-body-default">
              <div className="flex justify-between">
                <dt className="text-text-secondary">Reference</dt>
                <dd className="font-semibold text-text-primary tabular-nums">{order.referenceNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">Status</dt>
                <dd className="font-semibold text-text-primary">{order.status}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">Received</dt>
                <dd className="font-semibold text-text-primary">{formatDateTime(order.receivedAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">Created</dt>
                <dd className="font-semibold text-text-primary">{formatDateTime(order.createdAt)}</dd>
              </div>
            </dl>
          </div>

          {order.notes && (
            <div className="bg-surface rounded-xl border border-border-default p-space-lg shadow-sm">
              <h2 className="text-headline-h3 font-semibold text-text-primary">Notes</h2>
              <p className="mt-2 text-body-default text-text-secondary">{order.notes}</p>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-status-danger-bg text-status-danger-text text-caption-meta">
              {error}
            </div>
          )}
        </div>
      </div>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm Receipt">
        <p className="text-body-default text-text-secondary">
          This will mark the inbound order as <strong>Confirmed</strong> and add{' '}
          <strong className="text-text-primary">
            {order.items.reduce((sum, i) => sum + i.receivedQuantity, 0)} units
          </strong>{' '}
          to inventory. This action cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-2 mt-6">
          <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={confirming}>
            {confirming ? 'Confirming...' : 'Confirm Receipt'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

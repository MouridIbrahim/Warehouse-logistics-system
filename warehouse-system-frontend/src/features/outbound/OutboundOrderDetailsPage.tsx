import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getErrorMessage } from '../../lib/api'
import { formatDateTime } from '../../lib/format'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Modal } from '../../components/ui/Modal'
import { useAuth } from '../auth/auth-context'
import { OPERATIONS, hasAnyRole } from '../auth/permissions'
import { dispatchOutboundOrder, getOutboundOrder } from './api'
import type { OutboundOrderDto } from './api'

export function OutboundOrderDetailsPage() {
  const { user } = useAuth()
  const canOperate = hasAnyRole(user, OPERATIONS)
  const { id } = useParams()
  const orderId = Number(id)
  const [order, setOrder] = useState<OutboundOrderDto | null>(null)
  const [dispatchOpen, setDispatchOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dispatching, setDispatching] = useState(false)

  useEffect(() => {
    getOutboundOrder(orderId)
      .then(setOrder)
      .catch(() => setError('Outbound order not found'))
  }, [orderId])

  async function handleDispatch() {
    setDispatching(true)
    setError(null)
    try {
      const updated = await dispatchOutboundOrder(orderId)
      setOrder(updated)
      setDispatchOpen(false)
    } catch (err) {
      setError(getErrorMessage(err))
      setDispatchOpen(false)
    } finally {
      setDispatching(false)
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
        <Link to="/app/outbound" className="hover:text-primary">
          Outbound Operations
        </Link>
        <span className="text-text-secondary/50">/</span>
        <span className="text-text-primary font-semibold">{order.referenceNumber}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-headline-h1 font-bold text-text-primary">{order.referenceNumber}</h1>
            <StatusBadge tone={order.status === 'DISPATCHED' ? 'success' : 'warning'}>
              {order.status === 'DISPATCHED' ? 'Dispatched' : 'Draft'}
            </StatusBadge>
          </div>
          <p className="text-body-default text-text-secondary mt-0.5">
            Warehouse #{order.warehouseId} · Created by {order.createdByName}
          </p>
        </div>
        {canOperate && order.status === 'DRAFT' && (
          <Button icon="local_shipping" onClick={() => setDispatchOpen(true)}>
            Dispatch
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
                  <th className="px-4 py-3 text-right">Requested Quantity</th>
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
                      <span className="font-semibold tabular-nums text-text-primary">{item.requestedQuantity}</span>
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
                <dt className="text-text-secondary">Dispatched</dt>
                <dd className="font-semibold text-text-primary">{formatDateTime(order.requestedAt)}</dd>
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

      <Modal open={dispatchOpen} onClose={() => setDispatchOpen(false)} title="Confirm Dispatch">
        <p className="text-body-default text-text-secondary">
          This will mark the order as <strong>Dispatched</strong> and deduct{' '}
          <strong className="text-text-primary">
            {order.items.reduce((sum, i) => sum + i.requestedQuantity, 0)} units
          </strong>{' '}
          from inventory. This action cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-2 mt-6">
          <Button variant="secondary" onClick={() => setDispatchOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDispatch} disabled={dispatching}>
            {dispatching ? 'Dispatching...' : 'Confirm Dispatch'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { PageResponse } from '../../types'
import { formatDateTime } from '../../lib/format'
import { getErrorMessage } from '../../lib/api'
import { useAuth } from '../auth/auth-context'
import { PageHeader } from '../../components/ui/PageHeader'
import { SearchInput } from '../../components/ui/SearchInput'
import { Pagination } from '../../components/ui/Pagination'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { EmptyState } from '../../components/ui/EmptyState'
import { adjustStock, listBalances, listMovements } from './api'
import type { InventoryBalanceDto, InventoryMovementDto } from './api'

function movementBadge(type: string): { tone: 'success' | 'info' | 'neutral'; label: string } {
  switch (type) {
    case 'INBOUND':
      return { tone: 'success', label: 'Inbound' }
    case 'OUTBOUND':
      return { tone: 'info', label: 'Outbound' }
    default:
      return { tone: 'neutral', label: 'Adjustment' }
  }
}

export function InventoryPage() {
  const { user } = useAuth()
  const canAdjust = !!user?.roles.some((r) => ['ADMINISTRATOR', 'WAREHOUSE_MANAGER'].includes(r))
  const [tab, setTab] = useState<'overview' | 'history'>('overview')

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="Monitor stock across warehouses and trace inventory changes."
      />

      <div className="mt-6">
        <div className="bg-status-neutral-bg p-0.5 rounded-lg inline-flex text-xs mb-4">
          <button
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              tab === 'overview' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => setTab('overview')}
          >
            Stock Overview
          </button>
          <button
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              tab === 'history' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => setTab('history')}
          >
            Movement History
          </button>
        </div>

        {tab === 'overview' ? <BalancesTable canAdjust={canAdjust} /> : <MovementsTable />}
      </div>
    </div>
  )
}

function BalancesTable({ canAdjust }: { canAdjust: boolean }) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [data, setData] = useState<PageResponse<InventoryBalanceDto> | null>(null)
  const [loading, setLoading] = useState(true)
  const [adjustTarget, setAdjustTarget] = useState<InventoryBalanceDto | null>(null)

  useEffect(() => {
    setLoading(true)
    listBalances(page, size)
      .then(setData)
      .finally(() => setLoading(false))
  }, [page, size])

  const filtered = data
    ? {
        ...data,
        content: data.content.filter(
          (b) =>
            !search ||
            b.productName.toLowerCase().includes(search.toLowerCase()) ||
            b.productSku.toLowerCase().includes(search.toLowerCase()),
        ),
      }
    : null

  function refresh() {
    listBalances(page, size).then(setData)
  }

  return (
    <div className="bg-surface rounded-xl border border-border-default shadow-sm overflow-hidden">
      <div className="p-space-md border-b border-border-default">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search product or SKU..."
          className="w-full sm:w-80"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-app-bg text-table-header uppercase text-text-secondary select-none">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3 text-right">On Hand</th>
              <th className="px-4 py-3">Updated</th>
              {canAdjust && <th className="px-4 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default/60 text-body-default text-text-primary">
            {loading && !data ? (
              <tr>
                <td colSpan={canAdjust ? 6 : 5} className="px-4 py-8 text-center text-text-secondary">
                  <span className="material-symbols-outlined animate-spin align-middle mr-2">sync</span>
                  Loading inventory...
                </td>
              </tr>
            ) : filtered && filtered.content.length > 0 ? (
              filtered.content.map((b) => (
                <tr key={b.id} className="hover:bg-app-bg/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-body-semibold text-text-primary">{b.productName}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="tabular-nums text-text-secondary">{b.productSku}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-body-semibold tabular-nums text-text-primary">{b.storageLocationCode}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-semibold tabular-nums ${
                        b.quantityOnHand === 0
                          ? 'text-status-danger-text'
                          : b.quantityOnHand < 10
                            ? 'text-status-warning-text'
                            : 'text-text-primary'
                      }`}
                    >
                      {b.quantityOnHand}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-table-data text-text-secondary tabular-nums">
                      {formatDateTime(b.updatedAt)}
                    </span>
                  </td>
                  {canAdjust && (
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Button variant="secondary" className="h-8 px-2.5 text-xs" onClick={() => setAdjustTarget(b)}>
                        Adjust
                      </Button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={canAdjust ? 6 : 5}>
                  <EmptyState
                    icon="package_2"
                    title="No inventory"
                    description="Stock will appear here once goods are received."
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

      <AdjustModal
        balance={adjustTarget}
        onClose={() => setAdjustTarget(null)}
        onAdjusted={refresh}
      />
    </div>
  )
}

function MovementsTable() {
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [data, setData] = useState<PageResponse<InventoryMovementDto> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    listMovements(page, size)
      .then(setData)
      .finally(() => setLoading(false))
  }, [page, size])

  return (
    <div className="bg-surface rounded-xl border border-border-default shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-app-bg text-table-header uppercase text-text-secondary select-none">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3 text-center">Type</th>
              <th className="px-4 py-3 text-right">Change</th>
              <th className="px-4 py-3">Performed By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default/60 text-body-default text-text-primary">
            {loading && !data ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">
                  <span className="material-symbols-outlined animate-spin align-middle mr-2">sync</span>
                  Loading movements...
                </td>
              </tr>
            ) : data && data.content.length > 0 ? (
              data.content.map((m) => {
                const badge = movementBadge(m.movementType)
                return (
                  <tr key={m.id} className="hover:bg-app-bg/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-table-data text-text-secondary tabular-nums">
                        {formatDateTime(m.occurredAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-body-semibold text-text-primary">{m.productName}</span>
                        <span className="text-caption-meta text-text-secondary tabular-nums">{m.productSku}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="tabular-nums text-text-secondary">{m.storageLocationCode}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge tone={badge.tone}>{badge.label}</StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-semibold tabular-nums ${
                          m.quantityDelta > 0 ? 'text-status-success-text' : 'text-status-danger-text'
                        }`}
                      >
                        {m.quantityDelta > 0 ? '+' : ''}
                        {m.quantityDelta}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-table-data text-text-secondary">{m.performedByName}</span>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    icon="history"
                    title="No movements"
                    description="Inventory changes will be recorded here."
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
  )
}

function AdjustModal({
  balance,
  onClose,
  onAdjusted,
}: {
  balance: InventoryBalanceDto | null
  onClose: () => void
  onAdjusted: () => void
}) {
  const [delta, setDelta] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!balance) return
    setLoading(true)
    setError(null)
    try {
      await adjustStock({
        productId: balance.productId,
        storageLocationId: balance.storageLocationId,
        quantityDelta: Number(delta),
        notes: notes || undefined,
      })
      setDelta('')
      setNotes('')
      onAdjusted()
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={!!balance} onClose={onClose} title="Adjust Stock">
      {balance && (
        <div>
          <div className="p-3 rounded-lg bg-app-bg mb-4">
            <div className="text-body-semibold text-text-primary">{balance.productName}</div>
            <div className="text-caption-meta text-text-secondary">
              {balance.productSku} · Location {balance.storageLocationCode} · On hand{' '}
              <span className="font-semibold text-text-primary">{balance.quantityOnHand}</span>
            </div>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <label className="text-form-label text-text-primary">Quantity adjustment *</label>
              <input
                type="number"
                className="h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Use a negative value to reduce stock"
                value={delta}
                onChange={(e) => setDelta(e.target.value)}
                required
              />
              <span className="text-caption-meta text-text-secondary">
                Result after adjustment:{' '}
                <span className="font-semibold tabular-nums text-text-primary">
                  {balance.quantityOnHand + (Number(delta) || 0)}
                </span>
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-form-label text-text-primary">Notes</label>
              <textarea
                className="px-3 py-2 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                rows={2}
                placeholder="e.g. Cycle count correction"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-status-danger-bg text-status-danger-text text-caption-meta">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 mt-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Adjusting...' : 'Apply Adjustment'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  )
}

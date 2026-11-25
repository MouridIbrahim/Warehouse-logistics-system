import { useEffect, useState } from 'react'
import type { PageResponse } from '../../types'
import { formatDateTime } from '../../lib/format'
import { getErrorMessage } from '../../lib/api'
import { PageHeader } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { EmptyState } from '../../components/ui/EmptyState'
import { FilterToolbar } from '../../components/ui/filter'
import { ActiveFilterChips } from '../../components/ui/filter'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { useToast } from '../../components/ui/toast'
import {
  listBalances,
  listMovements,
  reverseAdjustment as reverseAdjustmentApi,
} from './api'
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

function formatNumberInput(value: string): string {
  return value.replace(/[^0-9-]/g, '')
}

export function InventoryPage() {
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

        {tab === 'overview' ? <BalancesTable /> : <MovementsTable />}
      </div>
    </div>
  )
}

function BalancesTable() {
  const [search, setSearch] = useState('')
  const [productId, setProductId] = useState('')
  const [locationId, setLocationId] = useState('')
  const [quantityCondition, setQuantityCondition] = useState('')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [data, setData] = useState<PageResponse<InventoryBalanceDto> | null>(null)
  const [loading, setLoading] = useState(true)

  const QUANTITY_OPTIONS = [
    { value: 'LOW_STOCK', label: 'Low Stock (< threshold)' },
    { value: 'OUT_OF_STOCK', label: 'Out of Stock (= 0)' },
    { value: 'IN_STOCK', label: 'In Stock (> 0)' },
  ]

  useEffect(() => {
    setLoading(true)
    listBalances(
      page,
      size,
      productId ? Number(productId) : undefined,
      locationId ? Number(locationId) : undefined,
      quantityCondition || undefined,
    )
      .then(setData)
      .finally(() => setLoading(false))
  }, [productId, locationId, quantityCondition, page, size])

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

  const activeChips = [
    ...(search ? [{ key: 'search', label: `Search: "${search}"`, value: search, onRemove: () => setSearch('') }] : []),
    ...(productId ? [{ key: 'productId', label: `Product ID: ${productId}`, value: productId, onRemove: () => setProductId('') }] : []),
    ...(locationId ? [{ key: 'locationId', label: `Location ID: ${locationId}`, value: locationId, onRemove: () => setLocationId('') }] : []),
    ...(quantityCondition ? [{ key: 'quantityCondition', label: `Quantity: ${QUANTITY_OPTIONS.find((o) => o.value === quantityCondition)?.label}`, value: quantityCondition, onRemove: () => setQuantityCondition('') }] : []),
  ]

  return (
    <div className="bg-surface rounded-xl border border-border-default shadow-sm overflow-hidden">
      <div className="p-space-md border-b border-border-default">
        {activeChips.length > 0 && (
          <ActiveFilterChips chips={activeChips} onClearAll={() => { setSearch(''); setProductId(''); setLocationId(''); setQuantityCondition('') }} />
        )}
        <FilterToolbar
          search={{
            value: search,
            onChange: setSearch,
            placeholder: 'Search product or SKU...',
          }}
          selects={[
            {
              key: 'productId',
              value: productId,
              onChange: (v) => setProductId(formatNumberInput(v)),
              options: [],
              placeholder: 'Product ID',
            },
            {
              key: 'locationId',
              value: locationId,
              onChange: (v) => setLocationId(formatNumberInput(v)),
              options: [],
              placeholder: 'Location ID',
            },
            {
              key: 'quantityCondition',
              value: quantityCondition,
              onChange: setQuantityCondition,
              options: QUANTITY_OPTIONS,
              placeholder: 'Quantity condition',
            },
          ]}
          onReset={() => { setSearch(''); setProductId(''); setLocationId(''); setQuantityCondition('') }}
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
              <th className="px-4 py-3 text-right">Reserved</th>
              <th className="px-4 py-3 text-right">Available</th>
              <th className="px-4 py-3 text-right">Low Stock</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default/60 text-body-default text-text-primary">
            {loading && !data ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-text-secondary">
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
                    <span className="text-body-semibold text-text-primary">{b.storageLocationCode}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-semibold tabular-nums text-text-primary`}>{b.quantityOnHand}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-semibold tabular-nums ${b.reservedQuantity > 0 ? 'text-status-warning-text' : 'text-text-secondary'}`}>
                      {b.reservedQuantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-semibold tabular-nums ${b.availableQuantity === 0 ? 'text-status-danger-text' : b.availableQuantity <= (b.lowStockThreshold ?? 10) ? 'text-status-warning-text' : 'text-text-primary'}`}>
                      {b.availableQuantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <span className={`font-semibold tabular-nums text-secondary`}>
                      {b.lowStockThreshold !== undefined && b.availableQuantity <= b.lowStockThreshold ? 'LOW' : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-table-data text-text-secondary tabular-nums">{formatDateTime(b.updatedAt)}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}>
                  <EmptyState icon="package_2" title="No inventory" description="Stock will appear once goods are received." />
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

function MovementsTable() {
  const [productId, setProductId] = useState('')
  const [locationId, setLocationId] = useState('')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [data, setData] = useState<PageResponse<InventoryMovementDto> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reverseTarget, setReverseTarget] = useState<InventoryMovementDto | null>(null)
  const [reversing, setReversing] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    setLoading(true)
    setError(null)
    listMovements(
      page,
      size,
      productId ? Number(productId) : undefined,
      locationId ? Number(locationId) : undefined,
    )
      .then(setData)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [productId, locationId, page, size])

  const activeChips = [
    ...(productId ? [{ key: 'productId', label: `Product ID: ${productId}`, value: productId, onRemove: () => setProductId('') }] : []),
    ...(locationId ? [{ key: 'locationId', label: `Location ID: ${locationId}`, value: locationId, onRemove: () => setLocationId('') }] : []),
  ]

  async function confirmReverse() {
    if (!reverseTarget) return
    setReversing(true)
    try {
      await reverseAdjustmentApi(reverseTarget.id)
      await listMovements(
        page,
        size,
        productId ? Number(productId) : undefined,
        locationId ? Number(locationId) : undefined,
      ).then(setData)
      setReverseTarget(null)
      addToast({ type: 'success', title: 'Adjustment reversed', message: 'A compensating movement was recorded.' })
    } catch {
      addToast({ type: 'error', title: 'Reverse failed', message: 'The adjustment could not be reversed.' })
    } finally {
      setReversing(false)
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface rounded-xl border border-border-default shadow-sm overflow-hidden">
      <div className="p-space-md border-b border-border-default">
        {activeChips.length > 0 && (
          <ActiveFilterChips chips={activeChips} onClearAll={() => { setProductId(''); setLocationId('') }} />
        )}
        <FilterToolbar
          selects={[
            {
              key: 'productId',
              value: productId,
              onChange: (v) => setProductId(formatNumberInput(v)),
              options: [],
              placeholder: 'Product ID',
            },
            {
              key: 'locationId',
              value: locationId,
              onChange: (v) => setLocationId(formatNumberInput(v)),
              options: [],
              placeholder: 'Location ID',
            },
          ]}
          onReset={() => { setProductId(''); setLocationId('') }}
        />
      </div>

      {error && (
        <div role="alert" className="p-3 text-caption-meta text-status-danger-text">
          Could not load inventory movements: {error}
        </div>
      )}

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
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default/60 text-body-default text-text-primary">
            {loading && !data ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-text-secondary">
                  <span className="material-symbols-outlined animate-spin align-middle mr-2">sync</span>
                  Loading movements...
                </td>
              </tr>
            ) : error && !data ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-status-danger-text">
                  Inventory movements could not be loaded.
                </td>
              </tr>
            ) : data && data.content.length > 0 ? (
              data.content.map((m) => {
                const badge = movementBadge(m.movementType)
                return (
                  <tr key={m.id} className="hover:bg-app-bg/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-table-data text-text-secondary tabular-nums">{formatDateTime(m.occurredAt)}</span>
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
                      <span className={`font-semibold tabular-nums ${m.quantityDelta > 0 ? 'text-status-success-text' : 'text-status-danger-text'}`}>
                        {m.quantityDelta > 0 ? '+' : ''}{m.quantityDelta}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-table-data text-text-secondary">{m.performedByName}</span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {m.movementType === 'ADJUSTMENT' && (
                        <button
                          type="button"
                          className="h-8 px-2 text-xs text-status-danger-text"
                          onClick={() => setReverseTarget(m)}
                        >
                          Reverse
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })
            )
          : (
              <tr>
                <td colSpan={7}>
                  <EmptyState icon="history" title="No movements" description="Inventory changes will be recorded here." />
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

      <Modal
        open={reverseTarget !== null}
        onClose={() => setReverseTarget(null)}
        title="Reverse inventory adjustment?"
      >
        <p className="text-body-default text-text-secondary">
          This creates a compensating movement with the opposite quantity. Continue only if the original adjustment was incorrect.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setReverseTarget(null)} disabled={reversing}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={confirmReverse} disabled={reversing}>
            {reversing ? 'Reversing...' : 'Reverse adjustment'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

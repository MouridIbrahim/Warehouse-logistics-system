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
import { Select } from '../../components/ui/Select'
import { WorkflowProgress } from '../../components/ui/WorkflowProgress'
import { useToast } from '../../components/ui/toast'
import { useAuth } from '../auth/auth-context'
import { ADMIN_MANAGER, hasAnyRole } from '../auth/permissions'
import { listProducts } from '../products/api'
import { listLocations, listWarehouses } from '../warehouses/api'
import {
  adjustStock,
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

export function InventoryPage() {
  const { user } = useAuth()
  const canAdjust = hasAnyRole(user, ADMIN_MANAGER)
  const [tab, setTab] = useState<'overview' | 'history'>('overview')
  const [adjustmentOpen, setAdjustmentOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="Monitor stock across warehouses and trace inventory changes."
        actions={canAdjust ? <Button icon="add" onClick={() => setAdjustmentOpen(true)}>Adjust stock</Button> : undefined}
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

        {tab === 'overview' ? <BalancesTable key={refreshKey} /> : <MovementsTable />}
      </div>
      <AdjustStockModal
        open={adjustmentOpen}
        onClose={() => setAdjustmentOpen(false)}
        onAdjusted={() => setRefreshKey((key) => key + 1)}
      />
    </div>
  )
}

function AdjustStockModal({
  open,
  onClose,
  onAdjusted,
}: {
  open: boolean
  onClose: () => void
  onAdjusted: () => void
}) {
  const [step, setStep] = useState(1)
  const [productId, setProductId] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [locationId, setLocationId] = useState('')
  const [quantityDelta, setQuantityDelta] = useState('')
  const [notes, setNotes] = useState('')
  const [productOptions, setProductOptions] = useState<{ value: string; label: string }[]>([])
  const [warehouseOptions, setWarehouseOptions] = useState<{ value: string; label: string }[]>([])
  const [locationOptions, setLocationOptions] = useState<{ value: string; label: string }[]>([])
  const [optionsLoading, setOptionsLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { addToast } = useToast()

  useEffect(() => {
    if (!open) return
    let active = true
    setOptionsLoading(true)
    Promise.all([listProducts(undefined, 0, 100), listWarehouses(undefined, 0, 100)])
      .then(([products, warehouses]) => {
        if (!active) return
        setProductOptions(products.content.map((product) => ({
          value: String(product.id),
          label: `${product.name} (${product.sku})`,
        })))
        setWarehouseOptions(warehouses.content.map((warehouse) => ({
          value: String(warehouse.id),
          label: warehouse.name,
        })))
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err))
      })
      .finally(() => {
        if (active) setOptionsLoading(false)
      })
    return () => { active = false }
  }, [open])

  useEffect(() => {
    if (!warehouseId) {
      setLocationOptions([])
      return
    }
    let active = true
    setLocationOptions([])
    listLocations(Number(warehouseId), undefined, 0, 100)
      .then((locations) => {
        if (active) setLocationOptions(locations.content.map((location) => ({
          value: String(location.id),
          label: location.code,
        })))
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err))
      })
    return () => { active = false }
  }, [warehouseId])

  function reset() {
    setStep(1)
    setProductId('')
    setWarehouseId('')
    setLocationId('')
    setQuantityDelta('')
    setNotes('')
    setError(null)
  }

  function continueToReview() {
    if (!productId || !locationId || quantityDelta === '' || !Number.isInteger(Number(quantityDelta))) {
      setError('Choose a product and location, then enter a whole-number quantity change.')
      return
    }
    setError(null)
    setStep(2)
  }

  async function submitAdjustment() {
    setLoading(true)
    setError(null)
    try {
      await adjustStock({
        productId: Number(productId),
        storageLocationId: Number(locationId),
        quantityDelta: Number(quantityDelta),
        notes: notes || undefined,
      })
      addToast({ type: 'success', title: 'Stock adjusted', message: 'The inventory balance has been updated.' })
      onAdjusted()
      reset()
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const selectedProduct = productOptions.find((option) => option.value === productId)?.label
  const selectedWarehouse = warehouseOptions.find((option) => option.value === warehouseId)?.label
  const selectedLocation = locationOptions.find((option) => option.value === locationId)?.label
  const closeModal = () => {
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={closeModal} title="Adjust stock">
      <WorkflowProgress steps={['Adjustment details', 'Review']} currentStep={step} />
      {step === 1 ? (
        <div className="space-y-4">
          <p className="text-caption-meta text-text-secondary">Record a signed stock change for one product and location.</p>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="adjustment-product" className="text-form-label text-text-primary">Product *</label>
            <Select id="adjustment-product" value={productId} onChange={setProductId} placeholder="Select product" options={productOptions} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="adjustment-warehouse" className="text-form-label text-text-primary">Warehouse *</label>
            <Select
              id="adjustment-warehouse"
              value={warehouseId}
              onChange={(value) => {
                setWarehouseId(value)
                setLocationId('')
              }}
              placeholder="Select warehouse"
              options={warehouseOptions}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="adjustment-location" className="text-form-label text-text-primary">Storage location *</label>
            <Select id="adjustment-location" value={locationId} onChange={setLocationId} placeholder="Select location" options={locationOptions} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="adjustment-quantity" className="text-form-label text-text-primary">Quantity change *</label>
            <input id="adjustment-quantity" type="number" step={1} value={quantityDelta} onChange={(event) => setQuantityDelta(event.target.value)} className="h-10 rounded-lg border border-border-default bg-surface px-3 text-body-default text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <span className="text-caption-meta text-text-secondary">Use a positive number to add stock or a negative number to remove stock.</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="adjustment-notes" className="text-form-label text-text-primary">Notes <span className="text-text-secondary">(optional)</span></label>
            <textarea id="adjustment-notes" maxLength={2000} rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} className="rounded-lg border border-border-default bg-surface px-3 py-2 text-body-default text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          {optionsLoading && <p role="status" className="text-caption-meta text-text-secondary">Loading products and warehouses…</p>}
        </div>
      ) : (
        <section aria-labelledby="adjustment-review-title" className="rounded-lg border border-border-default bg-app-bg p-4">
          <h3 id="adjustment-review-title" className="text-body-semibold text-text-primary">Confirm stock adjustment</h3>
          <p className="mt-1 text-caption-meta text-text-secondary">This creates an inventory movement and updates the stock balance.</p>
          <dl className="mt-4 space-y-3 text-body-default">
            <div><dt className="text-caption-meta text-text-secondary">Product</dt><dd className="font-semibold">{selectedProduct}</dd></div>
            <div><dt className="text-caption-meta text-text-secondary">Warehouse / location</dt><dd className="font-semibold">{selectedWarehouse} / {selectedLocation}</dd></div>
            <div><dt className="text-caption-meta text-text-secondary">Quantity change</dt><dd className="font-semibold tabular-nums">{Number(quantityDelta) > 0 ? '+' : ''}{quantityDelta} units</dd></div>
            {notes && <div><dt className="text-caption-meta text-text-secondary">Notes</dt><dd>{notes}</dd></div>}
          </dl>
        </section>
      )}
      {error && <div role="alert" className="mt-4 rounded-lg bg-status-danger-bg p-3 text-caption-meta text-status-danger-text">{error}</div>}
      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={closeModal} disabled={loading}>Cancel</Button>
        {step === 2 && <Button type="button" variant="secondary" onClick={() => { setError(null); setStep(1) }}>Back</Button>}
        {step === 1 ? (
          <Button type="button" onClick={continueToReview} disabled={optionsLoading}>Review adjustment</Button>
        ) : (
          <Button type="button" onClick={submitAdjustment} disabled={loading}>{loading ? 'Saving...' : 'Confirm adjustment'}</Button>
        )}
      </div>
    </Modal>
  )
}

function BalancesTable() {
  const [search, setSearch] = useState('')
  const [quantityCondition, setQuantityCondition] = useState('')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [data, setData] = useState<PageResponse<InventoryBalanceDto> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const QUANTITY_OPTIONS = [
    { value: 'LOW_STOCK', label: 'Low Stock (< threshold)' },
    { value: 'OUT_OF_STOCK', label: 'Out of Stock (= 0)' },
    { value: 'IN_STOCK', label: 'In Stock (> 0)' },
  ]

  useEffect(() => {
    setLoading(true)
    setError(null)
    listBalances(
      page,
      size,
      undefined,
      undefined,
      quantityCondition || undefined,
    )
      .then(setData)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [quantityCondition, page, size])

  const filtered = data
    ? {
        ...data,
        content: data.content.filter(
          (b) =>
            !search ||
            b.productName.toLowerCase().includes(search.toLowerCase()) ||
            b.productSku.toLowerCase().includes(search.toLowerCase()) ||
            b.storageLocationCode.toLowerCase().includes(search.toLowerCase()),
        ),
      }
    : null

  const activeChips = [
    ...(search ? [{ key: 'search', label: `Search: "${search}"`, value: search, onRemove: () => setSearch('') }] : []),
    ...(quantityCondition ? [{ key: 'quantityCondition', label: `Quantity: ${QUANTITY_OPTIONS.find((o) => o.value === quantityCondition)?.label}`, value: quantityCondition, onRemove: () => setQuantityCondition('') }] : []),
  ]

  return (
    <div className="bg-surface rounded-xl border border-border-default shadow-sm overflow-hidden">
      <div className="p-space-md border-b border-border-default">
        {activeChips.length > 0 && (
          <ActiveFilterChips chips={activeChips} onClearAll={() => { setSearch(''); setQuantityCondition('') }} />
        )}
        <FilterToolbar
          search={{
            value: search,
            onChange: setSearch,
            placeholder: 'Search product, SKU, or location...',
          }}
          selects={[{
              key: 'quantityCondition',
              value: quantityCondition,
              onChange: setQuantityCondition,
              options: QUANTITY_OPTIONS,
              placeholder: 'Quantity condition',
            }]}
          onReset={() => { setSearch(''); setQuantityCondition('') }}
        />
      </div>

      {error && <div role="alert" className="p-3 text-caption-meta text-status-danger-text">Could not load inventory: {error}</div>}
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
                <td colSpan={8} className="px-4 py-8 text-center text-text-secondary">
                  <span className="material-symbols-outlined animate-spin align-middle mr-2">sync</span>
                  Loading inventory...
                </td>
              </tr>
            ) : error && !data ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-status-danger-text">
                  Inventory could not be loaded.
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
                <td colSpan={8}>
                  <EmptyState
                    icon="package_2"
                    title={search || quantityCondition ? 'No matching inventory' : 'No inventory'}
                    description={search || quantityCondition
                      ? 'Try another search or reset the filters.'
                      : 'Stock will appear once goods are received.'}
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

function MovementsTable() {
  const { user } = useAuth()
  const canReverse = hasAnyRole(user, ADMIN_MANAGER)
  const [search, setSearch] = useState('')
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
    listMovements(page, size)
      .then(setData)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [page, size])

  const activeChips = [
    ...(search ? [{ key: 'search', label: `Search: "${search}"`, value: search, onRemove: () => setSearch('') }] : []),
  ]
  const filtered = data
    ? {
        ...data,
        content: data.content.filter((movement) =>
          [movement.productName, movement.productSku, movement.storageLocationCode]
            .some((value) => value.toLowerCase().includes(search.toLowerCase())),
        ),
      }
    : null

  async function confirmReverse() {
    if (!reverseTarget) return
    setReversing(true)
    try {
      await reverseAdjustmentApi(reverseTarget.id)
      await listMovements(page, size).then(setData)
      setReverseTarget(null)
      addToast({ type: 'success', title: 'Adjustment reversed', message: 'A compensating movement was recorded.' })
    } catch (err) {
      addToast({ type: 'error', title: 'Reverse failed', message: getErrorMessage(err) })
    } finally {
      setReversing(false)
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface rounded-xl border border-border-default shadow-sm overflow-hidden">
      <div className="p-space-md border-b border-border-default">
        {activeChips.length > 0 && (
          <ActiveFilterChips chips={activeChips} onClearAll={() => setSearch('')} />
        )}
        <FilterToolbar
          search={{
            value: search,
            onChange: (value) => { setSearch(value); setPage(0) },
            placeholder: 'Search product, SKU, or location...',
          }}
          onReset={() => setSearch('')}
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
            ) : filtered && filtered.content.length > 0 ? (
              filtered.content.map((m) => {
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
                      {canReverse && m.movementType === 'ADJUSTMENT' && (
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
                  <EmptyState
                    icon="history"
                    title={search ? 'No matching movements' : 'No movements'}
                    description={search ? 'Try another search or clear the search field.' : 'Inventory changes will be recorded here.'}
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

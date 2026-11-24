import { useEffect, useState } from 'react'
import { getErrorMessage } from '../../lib/api'
import type { PageResponse } from '../../types'
import { PageHeader } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { FilterToolbar } from '../../components/ui/filter'
import { useToast } from '../../components/ui/toast'
import { listBalances, cycleCount } from './api'
import type { InventoryBalanceDto } from './api'

const QUANTITY_OPTIONS = [
  { value: 'LOW_STOCK', label: 'Low Stock (< threshold)' },
  { value: 'OUT_OF_STOCK', label: 'Out of Stock (= 0)' },
  { value: 'IN_STOCK', label: 'In Stock (> 0)' },
]

export function CycleCountPage() {
  const { addToast } = useToast()
  const [productId, setProductId] = useState('')
  const [locationId, setLocationId] = useState('')
  const [search, setSearch] = useState('')
  const [quantityCondition, setQuantityCondition] = useState('')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [data, setData] = useState<PageResponse<InventoryBalanceDto> | null>(null)
  const [loading, setLoading] = useState(true)
  const [countedQuantities, setCountedQuantities] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState('')

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
  }, [productId, locationId, quantityCondition, search, page, size])

  async function handleCount(productId: number, locationId: number, countedQuantity: number) {
    try {
      await cycleCount(productId, locationId, countedQuantity, notes)
      setCountedQuantities({})
      setNotes('')
      setLoading(true)
      await listBalances(page, size, productId ? Number(productId) : undefined, locationId ? Number(locationId) : undefined, quantityCondition || undefined)
        .then(setData)
        .finally(() => setLoading(false))
      addToast({ type: 'success', title: 'Count recorded', message: 'Inventory has been updated.' })
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to record count', message: getErrorMessage(err) })
    }
  }

  const filtered = data?.content.filter(
    (b) =>
      !search ||
      b.productName.toLowerCase().includes(search.toLowerCase()) ||
      b.productSku.toLowerCase().includes(search.toLowerCase()),
  ) ?? []

  return (
    <div>
      <PageHeader
        title="Cycle Counting"
        description="Record physical stock counts and reconcile with system records."
      />

      <div className="mt-6 bg-surface rounded-xl border border-border-default shadow-sm overflow-hidden">
        <div className="p-space-md border-b border-border-default">
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
                onChange: (v) => setProductId(v),
                options: [],
                placeholder: 'Product ID',
              },
              {
                key: 'locationId',
                value: locationId,
                onChange: (v) => setLocationId(v),
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
            onReset={() => { setProductId(''); setLocationId(''); setQuantityCondition('') }}
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
                <th className="px-4 py-3 text-right">Low Stock</th>
                <th className="px-4 py-3 text-right">Count</th>
                <th className="px-4 py-3 text-right">Actions</th>
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
              ) : filtered.length > 0 ? (
                filtered.map((b) => (
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
                      <span className={`font-semibold tabular-nums ${
                        b.quantityOnHand === 0 ? 'text-status-danger-text' : b.quantityOnHand <= (b.lowStockThreshold ?? 10) ? 'text-status-warning-text' : 'text-text-primary'
                      }`}>
                        {b.quantityOnHand}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="tabular-nums text-text-secondary">{b.lowStockThreshold ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="number"
                          min={0}
                          step={1}
                          className="w-20 h-8 px-2 text-center text-body-default text-text-primary bg-surface border border-border-default rounded focus:outline-none focus:ring-1 focus:ring-primary/30"
                          value={countedQuantities[b.id] ?? ''}
                          onChange={(e) => setCountedQuantities((current) => ({
                            ...current,
                            [b.id]: e.target.value,
                          }))}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-8 px-3 text-xs text-status-danger-text"
                        onClick={() => handleCount(
                          b.productId,
                          b.storageLocationId,
                          Number(countedQuantities[b.id]),
                        )}
                        disabled={
                          !countedQuantities[b.id] ||
                          !Number.isInteger(Number(countedQuantities[b.id])) ||
                          Number(countedQuantities[b.id]) < 0
                        }
                      >
                        Count
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon="package_2"
                      title="No inventory"
                      description="Stock will appear once goods are received."
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
    </div>
  )
}

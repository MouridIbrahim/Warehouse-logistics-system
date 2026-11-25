import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { PageResponse } from '../../types'
import { formatDateTime } from '../../lib/format'
import { getErrorMessage } from '../../lib/api'
import { PageHeader } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { EmptyState } from '../../components/ui/EmptyState'
import { FilterToolbar } from '../../components/ui/filter'
import { ActiveFilterChips } from '../../components/ui/filter'
import { useAuth } from '../auth/auth-context'
import { ADMIN_MANAGER, hasAnyRole } from '../auth/permissions'
import { createProduct, getProduct, listProducts, updateProduct, exportProducts, exportLowStockProducts } from './api'
import type { ProductDto } from './api'

function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  return ((words[0]?.[0] ?? '') + (words[1]?.[0] ?? '')).toUpperCase() || 'PR'
}

export function ProductsPage() {
  const { user } = useAuth()
  const canManage = hasAnyRole(user, ADMIN_MANAGER)
  const [term, setTerm] = useState('')
  const [unitOfMeasure, setUnitOfMeasure] = useState('')
  const [active, setActive] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [data, setData] = useState<PageResponse<ProductDto> | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<ProductDto | null>(null)

  const UNIT_OPTIONS = [
    { value: 'pcs', label: 'Pieces' },
    { value: 'box', label: 'Box' },
    { value: 'kg', label: 'Kilogram' },
    { value: 'unit', label: 'Unit' },
    { value: 'pair', label: 'Pair' },
    { value: 'set', label: 'Set' },
  ]

  const ACTIVE_OPTIONS = [
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
  ]

  useEffect(() => {
    setLoading(true)
    listProducts(
      term || undefined,
      page,
      size,
      unitOfMeasure || undefined,
      active ? active === 'true' : undefined,
      from || undefined,
      to || undefined,
    )
      .then(setData)
      .finally(() => setLoading(false))
  }, [term, unitOfMeasure, active, from, to, page, size])

  function refresh() {
    setLoading(true)
    listProducts(
      term || undefined,
      page,
      size,
      unitOfMeasure || undefined,
      active ? active === 'true' : undefined,
      from || undefined,
      to || undefined,
    ).then(setData).finally(() => setLoading(false))
  }

  const activeChips = [
    ...(term ? [{ key: 'search', label: `Search: "${term}"`, value: term, onRemove: () => { setTerm(''); setPage(0) } }] : []),
    ...(unitOfMeasure ? [{ key: 'unitOfMeasure', label: `Unit: ${unitOfMeasure}`, value: unitOfMeasure, onRemove: () => { setUnitOfMeasure(''); setPage(0) } }] : []),
    ...(active ? [{ key: 'active', label: `Status: ${active === 'true' ? 'Active' : 'Inactive'}`, value: active, onRemove: () => { setActive(''); setPage(0) } }] : []),
    ...(from ? [{ key: 'from', label: `From: ${from}`, value: from, onRemove: () => { setFrom(''); setPage(0) } }] : []),
    ...(to ? [{ key: 'to', label: `To: ${to}`, value: to, onRemove: () => { setTo(''); setPage(0) } }] : []),
  ]

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage the product catalogue, SKU definitions, and stock availability."
        actions={
          canManage ? (
            <Button icon="add" onClick={() => setShowCreate(true)}>
              Add Product
            </Button>
          ) : undefined
        }
      />

      {activeChips.length > 0 && (
        <ActiveFilterChips chips={activeChips} onClearAll={() => { setTerm(''); setUnitOfMeasure(''); setActive(''); setFrom(''); setTo(''); setPage(0) }} />
      )}

      <div className="mt-6 bg-surface rounded-xl border border-border-default shadow-sm overflow-hidden">
        <div className="p-space-md border-b border-border-default">
          <FilterToolbar
            search={{
              value: term,
              onChange: (value) => { setTerm(value); setPage(0) },
              placeholder: 'Search product name or SKU...',
            }}
            selects={[
              {
                key: 'unitOfMeasure',
                value: unitOfMeasure,
                onChange: (value) => { setUnitOfMeasure(value); setPage(0) },
                options: UNIT_OPTIONS,
                placeholder: 'Unit of measure',
              },
              {
                key: 'active',
                value: active,
                onChange: (value) => { setActive(value); setPage(0) },
                options: ACTIVE_OPTIONS,
                placeholder: 'All statuses',
              },
            ]}
            dateRange={{
              startValue: from,
              endValue: to,
              onStartChange: (value) => { setFrom(value); setPage(0) },
              onEndChange: (value) => { setTo(value); setPage(0) },
            }}
            onReset={() => { setTerm(''); setUnitOfMeasure(''); setActive(''); setFrom(''); setTo(''); setPage(0) }}
          />
          <Button
            variant="secondary"
            className="ml-2"
            onClick={() =>
              exportProducts(
                term || undefined,
                unitOfMeasure || undefined,
                active ? active === 'true' : undefined,
                from || undefined,
                to || undefined,
              ).catch((err) => {
                alert('Export failed: ' + (err?.message ?? String(err)))
              })
            }
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export CSV
          </Button>
          <Button
            variant="secondary"
            className="ml-2"
            onClick={() =>
              exportLowStockProducts().catch((err) => {
                alert('Export failed: ' + (err?.message ?? String(err)))
              })
            }
          >
            <span className="material-symbols-outlined text-[16px]">warning</span>
            Export Low Stock
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-app-bg text-table-header uppercase text-text-secondary select-none">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Low Stock</th>
                <th className="px-4 py-3">Last Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/60 text-body-default text-text-primary">
              {loading && !data ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-text-secondary">
                    <span className="material-symbols-outlined animate-spin align-middle mr-2">sync</span>
                    Loading products...
                  </td>
                </tr>
              ) : data && data.content.length > 0 ? (
                data.content.map((p) => (
                  <tr key={p.id} className="hover:bg-app-bg/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center font-bold text-xs text-primary shrink-0">
                          {initials(p.name)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-body-semibold text-text-primary truncate">{p.name}</span>
                          {p.description && (
                            <span className="text-caption-meta text-text-secondary truncate">{p.description}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-body-semibold tabular-nums text-text-primary">{p.sku}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-table-data text-text-secondary">{p.unitOfMeasure ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-semibold tabular-nums ${
                        p.lowStockThreshold !== undefined && p.active
                          ? 'text-status-warning-text'
                          : 'text-text-secondary'
                      }`}>
                        {p.lowStockThreshold != null ? `⚠ ${p.lowStockThreshold}` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge tone={p.active ? 'success' : 'neutral'}>
                        {p.active ? 'Active' : 'Inactive'}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-table-data text-text-secondary tabular-nums">
                        {formatDateTime(p.updatedAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {canManage && <button
                          type="button"
                          className="p-1 rounded text-text-secondary hover:text-primary transition-colors"
                          title="Edit"
                          onClick={() => setEditTarget(p)}
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon="inventory_2"
                      title="No products found"
                      description="Try a different search term, or add your first product."
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

      <CreateProductModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={refresh} />
      <EditProductModal product={editTarget} onClose={() => setEditTarget(null)} onUpdated={refresh} />
    </div>
  )
}

function CreateProductModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: () => void
}) {
  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [unit, setUnit] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await createProduct({
        sku,
        name,
        description: description || undefined,
        unitOfMeasure: unit || undefined,
      })
      setSku('')
      setName('')
      setDescription('')
      setUnit('')
      onCreated()
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Product">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <label className="text-form-label text-text-primary">Product name *</label>
          <input
            className="h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-form-label text-text-primary">SKU *</label>
          <input
            className="h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-form-label text-text-primary">Unit of measure</label>
          <input
            className="h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="e.g. pcs, box, kg"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-form-label text-text-primary">Description</label>
          <textarea
            className="px-3 py-2 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
            {loading ? 'Creating...' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function EditProductModal({
  product,
  onClose,
  onUpdated,
}: {
  product: ProductDto | null
  onClose: () => void
  onUpdated: () => void
}) {
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [description, setDescription] = useState('')
  const [unit, setUnit] = useState('')
  const [active, setActive] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (product) {
      setError(null)
      getProduct(product.id)
        .then((p) => {
          setName(p.name)
          setSku(p.sku)
          setDescription(p.description ?? '')
          setUnit(p.unitOfMeasure ?? '')
          setActive(p.active)
        })
        .catch((err) => setError(getErrorMessage(err)))
    }
  }, [product])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!product) return
    setLoading(true)
    setError(null)
    try {
      await updateProduct(product.id, {
        name,
        sku,
        description: description || undefined,
        unitOfMeasure: unit || undefined,
        active,
      })
      onUpdated()
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={!!product} onClose={onClose} title="Edit Product">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <label className="text-form-label text-text-primary">Product name *</label>
          <input
            className="h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-form-label text-text-primary">SKU *</label>
          <input
            className="h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-form-label text-text-primary">Unit of measure</label>
          <input
            className="h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-form-label text-text-primary">Description</label>
          <textarea
            className="px-3 py-2 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            className="w-4 h-4 rounded accent-[#C45D16]"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          <span className="text-body-default text-text-primary">Active</span>
        </label>

        {error && (
          <div className="p-3 rounded-lg bg-status-danger-bg text-status-danger-text text-caption-meta">{error}</div>
        )}

        <div className="flex items-center justify-end gap-2 mt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

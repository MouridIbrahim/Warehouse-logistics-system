import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
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
import { createWarehouse, listWarehouses, updateWarehouse, exportWarehouses } from './api'
import type { WarehouseDto } from './api'

export function WarehousesPage() {
  const { user } = useAuth()
  const canManage = hasAnyRole(user, ADMIN_MANAGER)
  const [term, setTerm] = useState('')
  const [active, setActive] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [data, setData] = useState<PageResponse<WarehouseDto> | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<WarehouseDto | null>(null)

  const ACTIVE_OPTIONS = [
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
  ]

  useEffect(() => {
    setLoading(true)
    listWarehouses(
      term || undefined,
      page,
      size,
      active ? active === 'true' : undefined,
      from || undefined,
      to || undefined,
    )
      .then(setData)
      .finally(() => setLoading(false))
  }, [term, active, from, to, page, size])

  function refresh() {
    setLoading(true)
    listWarehouses(
      term || undefined,
      page,
      size,
      active ? active === 'true' : undefined,
      from || undefined,
      to || undefined,
    ).then(setData).finally(() => setLoading(false))
  }

  const activeChips = [
    ...(term ? [{ key: 'search', label: `Search: "${term}"`, value: term, onRemove: () => { setTerm(''); setPage(0) } }] : []),
    ...(active ? [{ key: 'active', label: `Status: ${active === 'true' ? 'Active' : 'Inactive'}`, value: active, onRemove: () => { setActive(''); setPage(0) } }] : []),
    ...(from ? [{ key: 'from', label: `From: ${from}`, value: from, onRemove: () => { setFrom(''); setPage(0) } }] : []),
    ...(to ? [{ key: 'to', label: `To: ${to}`, value: to, onRemove: () => { setTo(''); setPage(0) } }] : []),
  ]

  return (
    <div>
      <PageHeader
        title="Warehouses"
        description="View and manage warehouses and their storage locations."
        actions={
          canManage ? (
            <Button icon="add" onClick={() => setShowCreate(true)}>
              Add Warehouse
            </Button>
          ) : undefined
        }
      />

      {activeChips.length > 0 && (
        <ActiveFilterChips
          chips={activeChips}
          onClearAll={() => { setTerm(''); setActive(''); setFrom(''); setTo(''); setPage(0) }}
        />
      )}

      <div className="mt-6 bg-surface rounded-xl border border-border-default shadow-sm overflow-hidden">
        <div className="p-space-md border-b border-border-default">
          <FilterToolbar
            search={{
              value: term,
              onChange: (value) => { setTerm(value); setPage(0) },
              placeholder: 'Search warehouse name or code...',
            }}
            selects={[
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
            onReset={() => { setTerm(''); setActive(''); setFrom(''); setTo(''); setPage(0) }}
          />
          <Button
            variant="secondary"
            className="ml-2"
            onClick={() => exportWarehouses(term || undefined, active ? active === 'true' : undefined, from || undefined, to || undefined)}
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export CSV
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-app-bg text-table-header uppercase text-text-secondary select-none">
              <tr>
                <th className="px-4 py-3">Warehouse</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/60 text-body-default text-text-primary">
              {loading && !data ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">
                    <span className="material-symbols-outlined animate-spin align-middle mr-2">sync</span>
                    Loading warehouses...
                  </td>
                </tr>
              ) : data && data.content.length > 0 ? (
                data.content.map((w) => (
                  <tr key={w.id} className="hover:bg-app-bg/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-body-semibold text-text-primary">{w.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-body-semibold tabular-nums text-text-primary">{w.code}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-table-data text-text-secondary">{w.address ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge tone={w.active ? 'success' : 'neutral'}>
                        {w.active ? 'Active' : 'Inactive'}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-table-data text-text-secondary tabular-nums">
                        {formatDateTime(w.updatedAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/app/warehouses/${w.id}`}
                          className="p-1 rounded text-text-secondary hover:text-primary transition-colors"
                          title="View details"
                        >
                          <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                        </Link>
                        {canManage && <button
                          type="button"
                          className="p-1 rounded text-text-secondary hover:text-primary transition-colors"
                          title="Edit"
                          onClick={() => setEditTarget(w)}
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon="warehouse"
                      title="No warehouses found"
                      description="Try a different search term, or add your first warehouse."
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

      <CreateWarehouseModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={refresh} />
      <EditWarehouseModal warehouse={editTarget} onClose={() => setEditTarget(null)} onUpdated={refresh} />
    </div>
  )
}

function CreateWarehouseModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: () => void
}) {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await createWarehouse({
        code,
        name,
        address: address || undefined,
      })
      setCode('')
      setName('')
      setAddress('')
      onCreated()
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Warehouse">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <label className="text-form-label text-text-primary">Warehouse name *</label>
          <input
            className="h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-form-label text-text-primary">Code *</label>
          <input
            className="h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-form-label text-text-primary">Address</label>
          <input
            className="h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
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
            {loading ? 'Creating...' : 'Create Warehouse'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function EditWarehouseModal({
  warehouse,
  onClose,
  onUpdated,
}: {
  warehouse: WarehouseDto | null
  onClose: () => void
  onUpdated: () => void
}) {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [active, setActive] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (warehouse) {
      setCode(warehouse.code)
      setName(warehouse.name)
      setAddress(warehouse.address ?? '')
      setActive(warehouse.active)
      setError(null)
    }
  }, [warehouse])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!warehouse) return
    setLoading(true)
    setError(null)
    try {
      await updateWarehouse(warehouse.id, {
        code,
        name,
        address: address || undefined,
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
    <Modal open={!!warehouse} onClose={onClose} title="Edit Warehouse">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <label className="text-form-label text-text-primary">Warehouse name *</label>
          <input
            className="h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-form-label text-text-primary">Code *</label>
          <input
            className="h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-form-label text-text-primary">Address</label>
          <input
            className="h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
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

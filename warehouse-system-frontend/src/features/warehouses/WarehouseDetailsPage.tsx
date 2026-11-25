import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { PageResponse } from '../../types'
import { getErrorMessage } from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { SearchInput } from '../../components/ui/SearchInput'
import { Pagination } from '../../components/ui/Pagination'
import { Modal } from '../../components/ui/Modal'
import { useAuth } from '../auth/auth-context'
import { ADMIN_MANAGER, hasAnyRole } from '../auth/permissions'
import { EmptyState } from '../../components/ui/EmptyState'
import {
  createLocation,
  getLocation,
  getWarehouse,
  listLocations,
  updateLocation,
} from './api'
import type { StorageLocationDto, WarehouseDto } from './api'

export function WarehouseDetailsPage() {
  const { user } = useAuth()
  const canManage = hasAnyRole(user, ADMIN_MANAGER)
  const { id } = useParams()
  const warehouseId = Number(id)
  const [warehouse, setWarehouse] = useState<WarehouseDto | null>(null)
  const [locations, setLocations] = useState<PageResponse<StorageLocationDto> | null>(null)
  const [term, setTerm] = useState('')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<StorageLocationDto | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getWarehouse(warehouseId).then(setWarehouse).catch(() => setError('Warehouse not found'))
  }, [warehouseId])

  useEffect(() => {
    listLocations(warehouseId, term || undefined, page, size).then(setLocations)
  }, [warehouseId, term, page, size])

  function refresh() {
    listLocations(warehouseId, term || undefined, page, size).then(setLocations)
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-status-danger-bg text-status-danger-text">{error}</div>
    )
  }

  return (
    <div>
      <div className="text-caption-meta text-text-secondary mb-2 flex items-center gap-1.5">
        <Link to="/app/warehouses" className="hover:text-primary">
          Warehouses
        </Link>
        <span className="text-text-secondary/50">/</span>
        <span className="text-text-primary font-semibold">{warehouse?.name ?? '…'}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-headline-h1 font-bold text-text-primary">{warehouse?.name ?? '…'}</h1>
            {warehouse && (
              <StatusBadge tone={warehouse.active ? 'success' : 'neutral'}>
                {warehouse.active ? 'Active' : 'Inactive'}
              </StatusBadge>
            )}
          </div>
          <p className="text-body-default text-text-secondary mt-0.5">
            {warehouse?.code} {warehouse?.address ? `· ${warehouse.address}` : ''}
          </p>
        </div>
        {canManage && (
          <Button icon="add" onClick={() => setShowCreate(true)}>
            Add Location
          </Button>
        )}
      </div>

      <div className="mt-6 bg-surface rounded-xl border border-border-default shadow-sm overflow-hidden">
        <div className="p-space-md border-b border-border-default flex items-center justify-between gap-3">
          <h2 className="text-headline-h3 font-semibold text-text-primary">Storage Locations</h2>
          <SearchInput
            value={term}
            onChange={setTerm}
            placeholder="Search location code..."
            className="w-full sm:w-64"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-app-bg text-table-header uppercase text-text-secondary select-none">
              <tr>
                <th className="px-4 py-3">Location Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/60 text-body-default text-text-primary">
              {locations && locations.content.length > 0 ? (
                locations.content.map((l) => (
                  <tr key={l.id} className="hover:bg-app-bg/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-body-semibold tabular-nums text-text-primary">{l.code}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-text-primary">{l.name}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge tone={l.active ? 'success' : 'neutral'}>
                        {l.active ? 'Active' : 'Inactive'}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {canManage && <button
                          type="button"
                          className="p-1 rounded text-text-secondary hover:text-primary transition-colors"
                          title="Edit"
                          onClick={() => setEditTarget(l)}
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>
                    <EmptyState
                      icon="grid_view"
                      title="No storage locations"
                      description="Add a location to organize stock within this warehouse."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {locations && locations.totalElements > 0 && (
          <Pagination
            page={page}
            totalPages={locations.totalPages}
            totalElements={locations.totalElements}
            size={size}
            onPageChange={setPage}
            onSizeChange={(s) => {
              setSize(s)
              setPage(0)
            }}
          />
        )}
      </div>

      {canManage && (
        <>
          <CreateLocationModal
            warehouseId={warehouseId}
            open={showCreate}
            onClose={() => setShowCreate(false)}
            onCreated={refresh}
          />
          <EditLocationModal
            warehouseId={warehouseId}
            location={editTarget}
            onClose={() => setEditTarget(null)}
            onUpdated={refresh}
          />
        </>
      )}
    </div>
  )
}

function CreateLocationModal({
  warehouseId,
  open,
  onClose,
  onCreated,
}: {
  warehouseId: number
  open: boolean
  onClose: () => void
  onCreated: () => void
}) {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await createLocation(warehouseId, { code, name })
      setCode('')
      setName('')
      onCreated()
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Storage Location">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <label className="text-form-label text-text-primary">Location code *</label>
          <input
            className="h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="e.g. A-01"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-form-label text-text-primary">Location name *</label>
          <input
            className="h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="e.g. Aisle A - Bay 01"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
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
            {loading ? 'Creating...' : 'Create Location'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function EditLocationModal({
  warehouseId,
  location,
  onClose,
  onUpdated,
}: {
  warehouseId: number
  location: StorageLocationDto | null
  onClose: () => void
  onUpdated: () => void
}) {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [active, setActive] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (location) {
      setError(null)
      getLocation(warehouseId, location.id)
        .then((l) => {
          setCode(l.code)
          setName(l.name)
          setActive(l.active)
        })
        .catch((err) => setError(getErrorMessage(err)))
    }
  }, [warehouseId, location])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!location) return
    setLoading(true)
    setError(null)
    try {
      await updateLocation(warehouseId, location.id, { code, name, active })
      onUpdated()
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={!!location} onClose={onClose} title="Edit Storage Location">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <label className="text-form-label text-text-primary">Location code *</label>
          <input
            className="h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-form-label text-text-primary">Location name *</label>
          <input
            className="h-10 px-3 text-body-default text-text-primary bg-surface border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
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

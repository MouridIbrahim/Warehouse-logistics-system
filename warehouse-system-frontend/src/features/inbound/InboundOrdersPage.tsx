import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { PageResponse } from '../../types'
import { formatDateTime } from '../../lib/format'
import { PageHeader } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { EmptyState } from '../../components/ui/EmptyState'
import { FilterToolbar } from '../../components/ui/filter'
import { ActiveFilterChips } from '../../components/ui/filter'
import { listInboundOrders, exportInboundOrders, confirmInboundOrder } from './api'
import type { InboundOrderDto } from './api'
import { listWarehouses } from '../warehouses/api'
import type { WarehouseDto } from '../warehouses/api'

const INBOUND_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'CONFIRMED', label: 'Confirmed' },
]

export function InboundOrdersPage() {
  const [term, setTerm] = useState('')
  const [status, setStatus] = useState('')
  const [warehouseId, setWarehouseId] = useState<number | null>(null)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [data, setData] = useState<PageResponse<InboundOrderDto> | null>(null)
  const [loading, setLoading] = useState(true)
  const [warehouses, setWarehouses] = useState<WarehouseDto[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkLoading, setBulkLoading] = useState(false)

  function refresh() {
    setLoading(true)
    listInboundOrders(term || undefined, status || undefined, page, size, warehouseId ? Number(warehouseId) : undefined, from || undefined, to || undefined).then(setData).finally(() => setLoading(false))
  }

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(data?.content.map((o) => String(o.id)) || [])
    } else {
      setSelectedIds([])
    }
  }

  const toggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  async function confirmSelected() {
    setBulkLoading(true)
    const results = await Promise.allSettled(
      selectedIds.map((id) => confirmInboundOrder(Number(id)))
    )
    const failed = results.filter((r) => r.status === 'rejected').length
    if (failed === 0) {
      setSelectedIds([])
      refresh()
    }
    setBulkLoading(false)
  }

  useEffect(() => {
    listWarehouses('', 0, 100).then((d) => setWarehouses(d.content))
  }, [])

  useEffect(() => {
    setLoading(true)
    listInboundOrders(
      term || undefined,
      status || undefined,
      page,
      size,
      warehouseId ?? undefined,
      from || undefined,
      to || undefined,
    )
      .then(setData)
      .finally(() => setLoading(false))
  }, [term, status, warehouseId, from, to, page, size])

  const activeChips = [
    ...(term ? [{ key: 'search', label: `Search: "${term}"`, value: term, onRemove: () => setTerm('') }] : []),
    ...(status
      ? [{ key: 'status', label: `Status: ${INBOUND_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status}`, value: status, onRemove: () => setStatus('') }]
      : []),
    ...(warehouseId ? [{ key: 'warehouseId', label: `Warehouse: ${warehouses.find((w) => w.id === warehouseId)?.name ?? warehouseId}`, value: String(warehouseId), onRemove: () => setWarehouseId(null) }] : []),
    ...(from ? [{ key: 'from', label: `From: ${from}`, value: from, onRemove: () => setFrom('') }] : []),
    ...(to ? [{ key: 'to', label: `To: ${to}`, value: to, onRemove: () => setTo('') }] : []),
  ]

  return (
    <div>
      <PageHeader
        title="Inbound Operations"
        description="Track expected and received goods."
        actions={
          <Link to="/app/inbound/new">
            <Button icon="add">Create Inbound Order</Button>
          </Link>
        }
      />

      {activeChips.length > 0 && (
        <ActiveFilterChips chips={activeChips} onClearAll={() => { setTerm(''); setStatus(''); setWarehouseId(null); setFrom(''); setTo('') }} />
      )}

      <div className="mt-6 bg-surface rounded-xl border border-border-default shadow-sm overflow-hidden">
        <div className="p-space-md border-b border-border-default">
          <FilterToolbar
            search={{
              value: term,
              onChange: setTerm,
              placeholder: 'Search inbound reference...',
            }}
            selects={[
              {
                key: 'status',
                value: status,
                onChange: setStatus,
                options: INBOUND_STATUS_OPTIONS,
                placeholder: 'All statuses',
              },
              {
                key: 'warehouseId',
                value: warehouseId ? String(warehouseId) : '',
                onChange: (v) => setWarehouseId(v ? Number(v) : null),
                options: warehouses.map((w) => ({ value: String(w.id), label: `${w.code} - ${w.name}` })),
                placeholder: 'All warehouses',
              },
            ]}
            dateRange={{
              startValue: from,
              endValue: to,
              onStartChange: setFrom,
              onEndChange: setTo,
            }}
            onReset={() => { setTerm(''); setStatus(''); setWarehouseId(null); setFrom(''); setTo('') }}
          />
          <Button
            variant="secondary"
            className="ml-2"
            onClick={() => exportInboundOrders(term || undefined, status || undefined, warehouseId || undefined, from || undefined, to || undefined)}
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export CSV
          </Button>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-caption-meta text-text-secondary">
                {selectedIds.length} selected
              </span>
              <Button
                variant="primary"
                disabled={bulkLoading}
                onClick={() => confirmSelected()}
              >
                {bulkLoading ? 'Confirming...' : 'Confirm Selected'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setSelectedIds([])}
              >
                Clear selection
              </Button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-app-bg text-table-header uppercase text-text-secondary select-none">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded accent-[#C45D16]"
                    checked={selectedIds.length > 0 && selectedIds.length === (data?.content.length ?? 0)}
                    onChange={(e) => toggleAll(e.target.checked)}
                  />
                </th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Warehouse</th>
                <th className="px-4 py-3 text-center">Items</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3">Received</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/60 text-body-default text-text-primary">
              {loading && !data ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">
                    <span className="material-symbols-outlined animate-spin align-middle mr-2">sync</span>
                    Loading inbound orders...
                  </td>
                </tr>
              ) : data && data.content.length > 0 ? (
                data.content.map((o) => (
                  <tr key={o.id} className="hover:bg-app-bg/50 transition-colors">
'                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded accent-[#C45D16]"
                    checked={selectedIds.includes(o.id.toString())}
                    onChange={() => toggleItem(o.id.toString())}
                  />
                </td>
                <td className="px-4 py-3">
                  <Link
                    to={`/app/inbound/${o.id}`}
                    className="text-body-semibold tabular-nums text-text-primary hover:text-primary"
                  >
                    {o.referenceNumber}
                  </Link>
                </td>'
                    <td className="px-4 py-3">
                      <span className="text-table-data text-text-secondary">#{o.warehouseId}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="tabular-nums text-text-primary">{o.items?.length ?? 0}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge tone={o.status === 'CONFIRMED' ? 'success' : 'warning'}>
                        {o.status === 'CONFIRMED' ? 'Confirmed' : 'Draft'}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-table-data text-text-secondary tabular-nums">
                        {formatDateTime(o.receivedAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/app/inbound/${o.id}`}
                          className="p-1 rounded text-text-secondary hover:text-primary transition-colors"
                          title="View details"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon="south_west"
                      title="No inbound orders"
                      description="Create an inbound order to record received goods."
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


import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { PageResponse } from '../../types'
import { formatDateTime } from '../../lib/format'
import { PageHeader } from '../../components/ui/PageHeader'
import { SearchInput } from '../../components/ui/SearchInput'
import { Select } from '../../components/ui/Select'
import { Pagination } from '../../components/ui/Pagination'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { EmptyState } from '../../components/ui/EmptyState'
import { listInboundOrders } from './api'
import type { InboundOrderDto } from './api'

export function InboundOrdersPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [data, setData] = useState<PageResponse<InboundOrderDto> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    listInboundOrders(status || undefined, page, size)
      .then(setData)
      .finally(() => setLoading(false))
  }, [status, page, size])

  const filtered = data
    ? {
        ...data,
        content: data.content.filter(
          (o) =>
            !search ||
            o.referenceNumber.toLowerCase().includes(search.toLowerCase()),
        ),
      }
    : null

  return (
    <div>
      <PageHeader
        title="Inbound Operations"
        description="Track expected and received goods."
        actions={
          <Link to="/inbound/new">
            <Button icon="add">Create Inbound Order</Button>
          </Link>
        }
      />

      <div className="mt-6 bg-surface rounded-xl border border-border-default shadow-sm overflow-hidden">
        <div className="p-space-md flex flex-col lg:flex-row lg:items-center gap-3 border-b border-border-default">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search inbound reference..."
            className="w-full sm:w-80"
          />
          <Select
            value={status}
            onChange={setStatus}
            placeholder="All statuses"
            options={[
              { value: 'DRAFT', label: 'Draft' },
              { value: 'CONFIRMED', label: 'Confirmed' },
            ]}
            className="w-full sm:w-48"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-app-bg text-table-header uppercase text-text-secondary select-none">
              <tr>
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
              ) : filtered && filtered.content.length > 0 ? (
                filtered.content.map((o) => (
                  <tr key={o.id} className="hover:bg-app-bg/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        to={`/inbound/${o.id}`}
                        className="text-body-semibold tabular-nums text-text-primary hover:text-primary"
                      >
                        {o.referenceNumber}
                      </Link>
                    </td>
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
                          to={`/inbound/${o.id}`}
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

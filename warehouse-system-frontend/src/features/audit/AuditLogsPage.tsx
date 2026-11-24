import { useEffect, useState } from 'react'
import type { PageResponse } from '../../types'
import { formatDateTime, humanize } from '../../lib/format'
import { PageHeader } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { EmptyState } from '../../components/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import { FilterToolbar } from '../../components/ui/filter'
import { ActiveFilterChips } from '../../components/ui/filter'
import { listAuditLogs, exportAuditLogs } from './api'
import type { AuditDto } from './api'
import { listUsers } from '../users/api'
import type { UserDto } from '../../types'

const ENTITY_TYPES = [
  'USER',
  'PRODUCT',
  'WAREHOUSE',
  'STORAGE_LOCATION',
  'INBOUND_ORDER',
  'OUTBOUND_ORDER',
  'SHIPMENT',
  'INVENTORY_BALANCE',
]

const ACTIONS = [
  'USER_CREATED',
  'USER_UPDATED',
  'USER_REGISTERED',
  'PASSWORD_CHANGED',
  'PASSWORD_RESET',
  'PRODUCT_CREATED',
  'PRODUCT_UPDATED',
  'WAREHOUSE_CREATED',
  'WAREHOUSE_UPDATED',
  'LOCATION_CREATED',
  'LOCATION_UPDATED',
  'INBOUND_CREATED',
  'INBOUND_CONFIRMED',
  'OUTBOUND_CREATED',
  'OUTBOUND_DISPATCHED',
  'INVENTORY_ADJUSTED',
  'SHIPMENT_CREATED',
  'SHIPMENT_STATUS_CHANGED',
]

export function AuditLogsPage() {
  const [entityType, setEntityType] = useState('')
  const [action, setAction] = useState('')
  const [actorUserId, setActorUserId] = useState<number | null>(null)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [data, setData] = useState<PageResponse<AuditDto> | null>(null)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserDto[]>([])

  useEffect(() => {
    listUsers('', undefined, undefined, 0, 100).then((d) => setUsers(d.content))
  }, [])

  useEffect(() => {
    setLoading(true)
    listAuditLogs(
      entityType || undefined,
      action || undefined,
      actorUserId ? String(actorUserId) : undefined,
      from || undefined,
      to || undefined,
      page,
      size,
    )
      .then(setData)
      .finally(() => setLoading(false))
  }, [entityType, action, actorUserId, from, to, page, size])

  const activeChips = [
    ...(entityType ? [{ key: 'entityType', label: `Entity: ${humanize(entityType)}`, value: entityType, onRemove: () => setEntityType('') }] : []),
    ...(action ? [{ key: 'action', label: `Action: ${humanize(action)}`, value: action, onRemove: () => setAction('') }] : []),
    ...(actorUserId ? [{ key: 'actorUserId', label: `Actor: ${users.find((u) => u.id === actorUserId)?.displayName ?? actorUserId}`, value: String(actorUserId), onRemove: () => setActorUserId(null) }] : []),
    ...(from ? [{ key: 'from', label: `From: ${from}`, value: from, onRemove: () => setFrom('') }] : []),
    ...(to ? [{ key: 'to', label: `To: ${to}`, value: to, onRemove: () => setTo('') }] : []),
  ]

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        description="Review recorded system and operational activity."
      />

      {activeChips.length > 0 && (
        <ActiveFilterChips chips={activeChips} onClearAll={() => { setEntityType(''); setAction(''); setActorUserId(null); setFrom(''); setTo('') }} />
      )}

      <div className="mt-6 bg-surface rounded-xl border border-border-default shadow-sm overflow-hidden">
        <div className="p-space-md border-b border-border-default">
          <FilterToolbar
            selects={[
              {
                key: 'entityType',
                value: entityType,
                onChange: setEntityType,
                options: ENTITY_TYPES.map((e) => ({ value: e, label: humanize(e) })),
                placeholder: 'All entity types',
              },
              {
                key: 'action',
                value: action,
                onChange: setAction,
                options: ACTIONS.map((a) => ({ value: a, label: humanize(a) })),
                placeholder: 'All actions',
              },
              {
                key: 'actorUserId',
                value: actorUserId ? String(actorUserId) : '',
                onChange: (v) => setActorUserId(v ? Number(v) : null),
                options: users.map((u) => ({ value: String(u.id), label: `${u.displayName} (@${u.username})` })),
                placeholder: 'All actors',
              },
            ]}
            dateRange={{
              startValue: from,
              endValue: to,
              onStartChange: setFrom,
              onEndChange: setTo,
            }}
            onReset={() => { setEntityType(''); setAction(''); setActorUserId(null); setFrom(''); setTo('') }}
          />
          <Button
            variant="secondary"
            className="ml-2"
            onClick={() => exportAuditLogs(entityType || undefined, action || undefined, actorUserId ? String(actorUserId) : undefined, from || undefined, to || undefined)}
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export CSV
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-app-bg text-table-header uppercase text-text-secondary select-none">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3 text-right">Entity ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/60 text-body-default text-text-primary">
              {loading && !data ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">
                    <span className="material-symbols-outlined animate-spin align-middle mr-2">sync</span>
                    Loading audit logs...
                  </td>
                </tr>
              ) : data && data.content.length > 0 ? (
                data.content.map((log) => (
                  <tr key={log.id} className="hover:bg-app-bg/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-table-data text-text-secondary tabular-nums">
                        {formatDateTime(log.occurredAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-body-semibold text-text-primary">{log.actorName ?? 'System'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-table-data text-text-primary">{humanize(log.action)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-table-data text-text-secondary">{humanize(log.entityType)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="tabular-nums text-text-secondary">{log.entityId ?? '—'}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon="history"
                      title="No audit logs"
                      description="Recorded actions will appear here."
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

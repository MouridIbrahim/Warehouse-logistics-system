import { api } from '../../lib/api'
import type { PageResponse } from '../../types'

export interface AuditDto {
  id: number
  action: string
  entityType: string
  entityId?: number
  actorId?: number
  actorName?: string
  occurredAt?: string
  metadata?: string
}

export async function listAuditLogs(
  entityType?: string,
  action?: string,
  from?: string,
  to?: string,
  actorUserId?: string,
  page = 0,
  size = 20,
): Promise<PageResponse<AuditDto>> {
  const { data } = await api.get<PageResponse<AuditDto>>('/api/v1/audit-logs', {
    params: {
      entityType: entityType || undefined,
      action: action || undefined,
      actorUserId: actorUserId || undefined,
      from: from || undefined,
      to: to || undefined,
      page,
      size,
    },
  })
  return data
}

export async function exportAuditLogs(
  entityType?: string,
  action?: string,
  actorUserId?: string,
  from?: string,
  to?: string,
): Promise<void> {
  const { data } = await api.get<Blob>('/api/v1/audit-logs/export', {
    params: {
      entityType: entityType || undefined,
      action: action || undefined,
      actorUserId: actorUserId || undefined,
      from: from || undefined,
      to: to || undefined,
    },
    responseType: 'blob',
  })
  const url = window.URL.createObjectURL(new Blob([data]))
  const link = document.createElement('a')
  link.href = url
  link.download = 'audit-logs.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

import { api } from '../../lib/api'
import type { PageResponse } from '../../types'

export interface OutboundOrderItemDto {
  id: number
  productId: number
  productSku: string
  productName: string
  storageLocationId: number
  storageLocationCode: string
  requestedQuantity: number
}

export interface OutboundOrderDto {
  id: number
  referenceNumber: string
  warehouseId: number
  status: 'DRAFT' | 'DISPATCHED'
  requestedAt?: string
  createdById: number
  createdByName: string
  notes?: string
  createdAt?: string
  updatedAt?: string
  items: OutboundOrderItemDto[]
  itemCount: number
}

export async function listOutboundOrders(
  term?: string,
  status?: string,
  page = 0,
  size = 20,
  warehouseId?: number,
  from?: string,
  to?: string,
): Promise<PageResponse<OutboundOrderDto>> {
  const { data } = await api.get<PageResponse<OutboundOrderDto>>('/api/v1/outbound-orders', {
    params: {
      term: term || undefined,
      status: status || undefined,
      page,
      size,
      warehouseId: warehouseId || undefined,
      from: from || undefined,
      to: to || undefined,
    },
  })
  return data
}

export async function getOutboundOrder(id: number): Promise<OutboundOrderDto> {
  const { data } = await api.get<OutboundOrderDto>(`/api/v1/outbound-orders/${id}`)
  return data
}

export async function createOutboundOrder(payload: {
  referenceNumber: string
  warehouseId: number
  notes?: string
  items: { productId: number; storageLocationId: number; requestedQuantity: number }[]
}): Promise<OutboundOrderDto> {
  const { data } = await api.post<OutboundOrderDto>('/api/v1/outbound-orders', payload)
  return data
}

export async function dispatchOutboundOrder(id: number): Promise<OutboundOrderDto> {
  const { data } = await api.post<OutboundOrderDto>(`/api/v1/outbound-orders/${id}/dispatch`)
  return data
}

export async function exportOutboundOrders(
  term?: string,
  status?: string,
  warehouseId?: number,
  from?: string,
  to?: string,
): Promise<void> {
  const { data } = await api.get<Blob>('/api/v1/outbound-orders/export', {
    params: {
      term: term || undefined,
      status: status || undefined,
      warehouseId: warehouseId || undefined,
      from: from || undefined,
      to: to || undefined,
    },
    responseType: 'blob',
  })
  const url = window.URL.createObjectURL(new Blob([data]))
  const link = document.createElement('a')
  link.href = url
  link.download = 'outbound-orders.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

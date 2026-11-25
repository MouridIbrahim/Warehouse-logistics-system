import { api } from '../../lib/api'
import type { PageResponse } from '../../types'

export interface InboundOrderItemDto {
  id: number
  productId: number
  productSku: string
  productName: string
  storageLocationId: number
  storageLocationCode: string
  receivedQuantity: number
}

export interface InboundOrderDto {
  id: number
  referenceNumber: string
  warehouseId: number
  status: 'DRAFT' | 'CONFIRMED'
  receivedAt?: string
  createdById: number
  createdByName: string
  notes?: string
  createdAt?: string
  updatedAt?: string
  items: InboundOrderItemDto[]
  itemCount: number
}

export async function listInboundOrders(
  term?: string,
  status?: string,
  page = 0,
  size = 20,
  warehouseId?: number,
  from?: string,
  to?: string,
): Promise<PageResponse<InboundOrderDto>> {
  const { data } = await api.get<PageResponse<InboundOrderDto>>('/api/v1/inbound-orders', {
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

export async function getInboundOrder(id: number): Promise<InboundOrderDto> {
  const { data } = await api.get<InboundOrderDto>(`/api/v1/inbound-orders/${id}`)
  return data
}

export async function createInboundOrder(payload: {
  referenceNumber: string
  warehouseId: number
  notes?: string
  items: { productId: number; storageLocationId: number; receivedQuantity: number }[]
}): Promise<InboundOrderDto> {
  const { data } = await api.post<InboundOrderDto>('/api/v1/inbound-orders', payload)
  return data
}

export async function confirmInboundOrder(id: number): Promise<InboundOrderDto> {
  const { data } = await api.post<InboundOrderDto>(`/api/v1/inbound-orders/${id}/confirm`)
  return data
}

export async function exportInboundOrders(
  term?: string,
  status?: string,
  warehouseId?: number,
  from?: string,
  to?: string,
): Promise<void> {
  const { data } = await api.get<Blob>('/api/v1/inbound-orders/export', {
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
  link.download = 'inbound-orders.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

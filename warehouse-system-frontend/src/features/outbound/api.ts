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
}

export async function listOutboundOrders(
  status?: string,
  page = 0,
  size = 20,
): Promise<PageResponse<OutboundOrderDto>> {
  const { data } = await api.get<PageResponse<OutboundOrderDto>>('/api/v1/outbound-orders', {
    params: { status: status || undefined, page, size },
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

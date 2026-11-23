import { api } from '../../lib/api'
import type { PageResponse } from '../../types'

export interface ShipmentDto {
  id: number
  trackingNumber: string
  outboundOrderId: number
  outboundReferenceNumber: string
  carrierName?: string
  status: string
  shippedAt?: string
  deliveredAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface ShipmentStatusHistoryDto {
  id: number
  previousStatus?: string
  newStatus: string
  changedById: number
  changedByName: string
  changedAt?: string
  note?: string
}

export const SHIPMENT_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['PREPARED', 'CANCELLED'],
  PREPARED: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['DELIVERED', 'DELAYED'],
  DELAYED: ['IN_TRANSIT', 'DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
}

export async function listShipments(
  status?: string,
  page = 0,
  size = 20,
): Promise<PageResponse<ShipmentDto>> {
  const { data } = await api.get<PageResponse<ShipmentDto>>('/api/v1/shipments', {
    params: { status: status || undefined, page, size },
  })
  return data
}

export async function getShipment(id: number): Promise<ShipmentDto> {
  const { data } = await api.get<ShipmentDto>(`/api/v1/shipments/${id}`)
  return data
}

export async function getShipmentHistory(id: number): Promise<ShipmentStatusHistoryDto[]> {
  const { data } = await api.get<ShipmentStatusHistoryDto[]>(`/api/v1/shipments/${id}/history`)
  return data
}

export async function createShipment(payload: {
  trackingNumber: string
  outboundOrderId: number
  carrierName?: string
}): Promise<ShipmentDto> {
  const { data } = await api.post<ShipmentDto>('/api/v1/shipments', payload)
  return data
}

export async function updateShipmentStatus(
  id: number,
  status: string,
  note?: string,
): Promise<ShipmentDto> {
  const { data } = await api.patch<ShipmentDto>(`/api/v1/shipments/${id}/status`, {
    status,
    note,
  })
  return data
}

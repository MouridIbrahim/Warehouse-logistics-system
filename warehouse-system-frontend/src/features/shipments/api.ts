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
  podFileName?: string
  podUploadedAt?: string
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
  term?: string,
  status?: string,
  page = 0,
  size = 20,
  from?: string,
  to?: string,
): Promise<PageResponse<ShipmentDto>> {
  const { data } = await api.get<PageResponse<ShipmentDto>>('/api/v1/shipments', {
    params: {
      term: term || undefined,
      status: status || undefined,
      page,
      size,
      from: from || undefined,
      to: to || undefined,
    },
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

export async function exportShipments(
  term?: string,
  status?: string,
  from?: string,
  to?: string,
): Promise<void> {
  const { data } = await api.get<Blob>('/api/v1/shipments/export', {
    params: {
      term: term || undefined,
      status: status || undefined,
      from: from || undefined,
      to: to || undefined,
    },
    responseType: 'blob',
  })
  const url = window.URL.createObjectURL(new Blob([data]))
  const link = document.createElement('a')
  link.href = url
  link.download = 'shipments.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export async function splitShipment(
  shipmentId: number,
  trackingNumber: string,
  carrierName?: string,
): Promise<ShipmentDto> {
  const { data } = await api.post<ShipmentDto>(`/api/v1/shipments/${shipmentId}/split`, {
    trackingNumber,
    carrierName,
  })
  return data
}

export async function uploadPod(shipmentId: number, file: File): Promise<ShipmentDto> {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post<ShipmentDto>(`/api/v1/shipments/${shipmentId}/pod`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function downloadPod(shipmentId: number): Promise<Blob> {
  const { data } = await api.get<Blob>(`/api/v1/shipments/${shipmentId}/pod`, {
    responseType: 'blob',
  })
  return data
}

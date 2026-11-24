import { api } from '../../lib/api'
import type { PageResponse } from '../../types'

export interface ShipmentStatusCount {
  status: string
  count: number
}

export interface DashboardDto {
  inboundVolume: number
  outboundVolume: number
  totalInventoryOnHand: number
  pendingInboundOrders: number
  pendingOutboundOrders: number
  shipmentStatusCounts: ShipmentStatusCount[]
}

export async function fetchDashboard(
  warehouseId?: number,
  from?: string,
  to?: string,
): Promise<DashboardDto> {
  const { data } = await api.get<DashboardDto>('/api/v1/reports/dashboard', {
    params: {
      warehouseId: warehouseId || undefined,
      from: from || undefined,
      to: to || undefined,
    },
  })
  return data
}

export async function fetchProductCount(): Promise<number> {
  const { data } = await api.get<PageResponse<unknown>>('/api/v1/products', {
    params: { page: 0, size: 1 },
  })
  return data.totalElements
}

export async function fetchWarehouseCount(): Promise<number> {
  const { data } = await api.get<PageResponse<unknown>>('/api/v1/warehouses', {
    params: { page: 0, size: 1 },
  })
  return data.totalElements
}

export async function downloadCustomReport(
  type: 'inventory-movements' | 'inbound-summary' | 'outbound-summary' | 'shipment-summary',
  warehouseId?: number,
  from?: string,
  to?: string,
): Promise<Blob> {
  const { data } = await api.get<Blob>(`/api/v1/reports/${type}`, {
    params: {
      warehouseId: warehouseId || undefined,
      from: from || undefined,
      to: to || undefined,
    },
    responseType: 'blob',
  })
  return data
}

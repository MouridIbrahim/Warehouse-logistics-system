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

export async function fetchDashboard(): Promise<DashboardDto> {
  const { data } = await api.get<DashboardDto>('/api/v1/reports/dashboard')
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

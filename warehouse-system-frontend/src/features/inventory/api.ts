import { api } from '../../lib/api'
import type { PageResponse } from '../../types'

export interface InventoryBalanceDto {
  id: number
  productId: number
  productSku: string
  productName: string
  storageLocationId: number
  storageLocationCode: string
  quantityOnHand: number
  updatedAt?: string
}

export interface InventoryMovementDto {
  id: number
  productId: number
  productSku: string
  productName: string
  storageLocationId: number
  storageLocationCode: string
  movementType: 'INBOUND' | 'OUTBOUND' | 'ADJUSTMENT'
  quantityDelta: number
  referenceType: string
  referenceId?: number
  performedById: number
  performedByName: string
  occurredAt?: string
  notes?: string
}

export async function listBalances(
  page = 0,
  size = 20,
  productId?: number,
  locationId?: number,
  quantityCondition?: string,
): Promise<PageResponse<InventoryBalanceDto>> {
  const { data } = await api.get<PageResponse<InventoryBalanceDto>>('/api/v1/inventory', {
    params: {
      page,
      size,
      productId: productId || undefined,
      locationId: locationId || undefined,
      quantityCondition: quantityCondition || undefined,
    },
  })
  return data
}

export async function listMovements(
  page = 0,
  size = 20,
  productId?: number,
  locationId?: number,
): Promise<PageResponse<InventoryMovementDto>> {
  const { data } = await api.get<PageResponse<InventoryMovementDto>>('/api/v1/inventory/movements', {
    params: { page, size, productId: productId || undefined, locationId: locationId || undefined },
  })
  return data
}

export async function adjustStock(payload: {
  productId: number
  storageLocationId: number
  quantityDelta: number
  notes?: string
}): Promise<InventoryBalanceDto> {
  const { data } = await api.post<InventoryBalanceDto>('/api/v1/inventory/adjustments', payload)
  return data
}

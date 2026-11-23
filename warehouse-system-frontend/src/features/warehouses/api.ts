import { api } from '../../lib/api'
import type { PageResponse } from '../../types'

export interface WarehouseDto {
  id: number
  code: string
  name: string
  address?: string
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export interface StorageLocationDto {
  id: number
  warehouseId: number
  code: string
  name: string
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export async function listWarehouses(
  term?: string,
  page = 0,
  size = 20,
): Promise<PageResponse<WarehouseDto>> {
  const { data } = await api.get<PageResponse<WarehouseDto>>('/api/v1/warehouses', {
    params: { term: term || undefined, page, size },
  })
  return data
}

export async function getWarehouse(id: number): Promise<WarehouseDto> {
  const { data } = await api.get<WarehouseDto>(`/api/v1/warehouses/${id}`)
  return data
}

export async function createWarehouse(payload: {
  code: string
  name: string
  address?: string
}): Promise<WarehouseDto> {
  const { data } = await api.post<WarehouseDto>('/api/v1/warehouses', payload)
  return data
}

export async function listLocations(
  warehouseId: number,
  term?: string,
  page = 0,
  size = 50,
): Promise<PageResponse<StorageLocationDto>> {
  const { data } = await api.get<PageResponse<StorageLocationDto>>(
    `/api/v1/warehouses/${warehouseId}/locations`,
    { params: { term: term || undefined, page, size } },
  )
  return data
}

export async function createLocation(
  warehouseId: number,
  payload: { code: string; name: string },
): Promise<StorageLocationDto> {
  const { data } = await api.post<StorageLocationDto>(
    `/api/v1/warehouses/${warehouseId}/locations`,
    payload,
  )
  return data
}

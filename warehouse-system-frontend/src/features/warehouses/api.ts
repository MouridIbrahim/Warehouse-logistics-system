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
  active?: boolean,
  from?: string,
  to?: string,
): Promise<PageResponse<WarehouseDto>> {
  const { data } = await api.get<PageResponse<WarehouseDto>>('/api/v1/warehouses', {
    params: {
      term: term || undefined,
      page,
      size,
      active: active !== undefined ? active : undefined,
      from: from || undefined,
      to: to || undefined,
    },
  })
  return data
}

export async function exportWarehouses(
  term?: string,
  active?: boolean,
  from?: string,
  to?: string,
): Promise<void> {
  const { data } = await api.get<Blob>('/api/v1/warehouses/export', {
    params: {
      term: term || undefined,
      active: active !== undefined ? active : undefined,
      from: from || undefined,
      to: to || undefined,
    },
    responseType: 'blob',
  })
  const url = window.URL.createObjectURL(new Blob([data]))
  const link = document.createElement('a')
  link.href = url
  link.download = 'warehouses.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
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

export async function updateWarehouse(
  id: number,
  payload: { code?: string; name?: string; address?: string; active?: boolean },
): Promise<WarehouseDto> {
  const { data } = await api.patch<WarehouseDto>(`/api/v1/warehouses/${id}`, payload)
  return data
}

export async function getLocation(
  warehouseId: number,
  locationId: number,
): Promise<StorageLocationDto> {
  const { data } = await api.get<StorageLocationDto>(
    `/api/v1/warehouses/${warehouseId}/locations/${locationId}`,
  )
  return data
}

export async function updateLocation(
  warehouseId: number,
  locationId: number,
  payload: { code?: string; name?: string; active?: boolean },
): Promise<StorageLocationDto> {
  const { data } = await api.patch<StorageLocationDto>(
    `/api/v1/warehouses/${warehouseId}/locations/${locationId}`,
    payload,
  )
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

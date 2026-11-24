import { api } from '../../lib/api'
import type { PageResponse } from '../../types'

export interface ProductDto {
  id: number
  sku: string
  name: string
  description?: string
  unitOfMeasure?: string
  lowStockThreshold?: number
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export async function listProducts(
  term?: string,
  page = 0,
  size = 20,
  unitOfMeasure?: string,
  active?: boolean,
  from?: string,
  to?: string,
): Promise<PageResponse<ProductDto>> {
  const { data } = await api.get<PageResponse<ProductDto>>('/api/v1/products', {
    params: {
      term: term || undefined,
      page,
      size,
      unitOfMeasure: unitOfMeasure || undefined,
      active: active !== undefined ? active : undefined,
      from: from || undefined,
      to: to || undefined,
    },
  })
  return data
}

export async function createProduct(payload: {
  sku: string
  name: string
  description?: string
  unitOfMeasure?: string
}): Promise<ProductDto> {
  const { data } = await api.post<ProductDto>('/api/v1/products', payload)
  return data
}

export async function getProduct(id: number): Promise<ProductDto> {
  const { data } = await api.get<ProductDto>(`/api/v1/products/${id}`)
  return data
}

export async function updateProduct(
  id: number,
  payload: {
    sku?: string
    name?: string
    description?: string
    unitOfMeasure?: string
    active?: boolean
  },
): Promise<ProductDto> {
  const { data } = await api.patch<ProductDto>(`/api/v1/products/${id}`, payload)
  return data
}

export async function exportProducts(
  term?: string,
  unitOfMeasure?: string,
  active?: boolean,
  from?: string,
  to?: string,
): Promise<void> {
  const { data } = await api.get<Blob>('/api/v1/products/export', {
    params: {
      term: term || undefined,
      unitOfMeasure: unitOfMeasure || undefined,
      active: active !== undefined ? active : undefined,
      from: from || undefined,
      to: to || undefined,
    },
    responseType: 'blob',
  })
  const url = window.URL.createObjectURL(new Blob([data]))
  const link = document.createElement('a')
  link.href = url
  link.download = 'products.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export async function exportLowStockProducts(): Promise<void> {
  const { data } = await api.get<Blob>('/api/v1/products/export/low-stock', {
    responseType: 'blob',
  })
  const url = window.URL.createObjectURL(new Blob([data]))
  const link = document.createElement('a')
  link.href = url
  link.download = 'low-stock-products.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

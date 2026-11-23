import { api } from '../../lib/api'
import type { PageResponse } from '../../types'

export interface ProductDto {
  id: number
  sku: string
  name: string
  description?: string
  unitOfMeasure?: string
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

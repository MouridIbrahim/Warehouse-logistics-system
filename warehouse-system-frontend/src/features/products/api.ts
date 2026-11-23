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
): Promise<PageResponse<ProductDto>> {
  const { data } = await api.get<PageResponse<ProductDto>>('/api/v1/products', {
    params: { term: term || undefined, page, size },
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

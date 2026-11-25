import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { CreateInboundOrderPage } from './CreateInboundOrderPage'
import { CreateOutboundOrderPage } from '../outbound/CreateOutboundOrderPage'
import { createInboundOrder } from './api'
import { createOutboundOrder } from '../outbound/api'
import { listProducts } from '../products/api'
import { listLocations, listWarehouses } from '../warehouses/api'

vi.mock('./api', () => ({ createInboundOrder: vi.fn() }))
vi.mock('../outbound/api', () => ({ createOutboundOrder: vi.fn() }))
vi.mock('../products/api', () => ({ listProducts: vi.fn() }))
vi.mock('../warehouses/api', () => ({
  listLocations: vi.fn(),
  listWarehouses: vi.fn(),
}))

afterEach(() => {
  cleanup()
  localStorage.clear()
})

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(listProducts).mockResolvedValue({
    content: [{ id: 12, name: 'Packing tape', sku: 'TAPE-12' }],
  } as Awaited<ReturnType<typeof listProducts>>)
  vi.mocked(listWarehouses).mockResolvedValue({
    content: [{ id: 3, name: 'North warehouse' }],
  } as Awaited<ReturnType<typeof listWarehouses>>)
  vi.mocked(listLocations).mockResolvedValue({
    content: [{ id: 7, code: 'A-01' }],
  } as Awaited<ReturnType<typeof listLocations>>)
  vi.mocked(createInboundOrder).mockResolvedValue({} as Awaited<ReturnType<typeof createInboundOrder>>)
  vi.mocked(createOutboundOrder).mockResolvedValue({} as Awaited<ReturnType<typeof createOutboundOrder>>)
})

describe('guided order creation', () => {
  it('validates, reviews, and submits an inbound order with the existing API payload', async () => {
    render(<MemoryRouter><CreateInboundOrderPage /></MemoryRouter>)

    fireEvent.click(screen.getByRole('button', { name: 'Continue to items' }))
    expect(screen.getByRole('alert')).toHaveTextContent('reference number')

    await screen.findByRole('option', { name: 'North warehouse' })
    fireEvent.change(screen.getByLabelText('Reference number *'), { target: { value: 'PO-100' } })
    fireEvent.change(screen.getByLabelText('Destination warehouse *'), { target: { value: '3' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continue to items' }))

    fireEvent.change(await screen.findByLabelText('Product *'), { target: { value: '12' } })
    await screen.findByRole('option', { name: 'A-01' })
    fireEvent.change(screen.getByLabelText('Location *'), { target: { value: '7' } })
    fireEvent.click(screen.getByRole('button', { name: 'Review order' }))

    expect(screen.getByRole('heading', { name: 'Review inbound order' })).toBeInTheDocument()
    expect(screen.getByText('North warehouse')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Create inbound order' }))

    await waitFor(() => expect(createInboundOrder).toHaveBeenCalledWith({
      referenceNumber: 'PO-100',
      warehouseId: 3,
      notes: undefined,
      items: [{ productId: 12, storageLocationId: 7, receivedQuantity: 1 }],
    }))
  })

  it('reviews outbound goods before submitting the unchanged outbound payload', async () => {
    render(<MemoryRouter><CreateOutboundOrderPage /></MemoryRouter>)

    await screen.findByRole('option', { name: 'North warehouse' })
    fireEvent.change(screen.getByLabelText('Reference number *'), { target: { value: 'SO-200' } })
    fireEvent.change(screen.getByLabelText('Source warehouse *'), { target: { value: '3' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continue to items' }))

    fireEvent.change(await screen.findByLabelText('Product *'), { target: { value: '12' } })
    await screen.findByRole('option', { name: 'A-01' })
    fireEvent.change(screen.getByLabelText('Location *'), { target: { value: '7' } })
    fireEvent.click(screen.getByRole('button', { name: 'Review order' }))

    expect(screen.getByRole('heading', { name: 'Review outbound order' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Create outbound order' }))

    await waitFor(() => expect(createOutboundOrder).toHaveBeenCalledWith({
      referenceNumber: 'SO-200',
      warehouseId: 3,
      notes: undefined,
      items: [{ productId: 12, storageLocationId: 7, requestedQuantity: 1 }],
    }))
  })
})

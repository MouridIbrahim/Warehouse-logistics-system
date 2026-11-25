import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../auth/auth-context'
import { ToastProvider } from '../../components/ui/toast'
import type { UserDto } from '../../types'
import { InventoryPage } from './InventoryPage'
import { adjustStock, listBalances } from './api'
import { listLocations, listWarehouses } from '../warehouses/api'
import { listProducts } from '../products/api'

vi.mock('./api', () => ({
  adjustStock: vi.fn(),
  listBalances: vi.fn(),
  listMovements: vi.fn(),
  reverseAdjustment: vi.fn(),
}))
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
  vi.mocked(listBalances).mockResolvedValue({
    content: [],
    totalElements: 0,
    totalPages: 0,
    page: 0,
    size: 20,
  } as Awaited<ReturnType<typeof listBalances>>)
  vi.mocked(listProducts).mockResolvedValue({
    content: [{ id: 12, name: 'Packing tape', sku: 'TAPE-12' }],
  } as Awaited<ReturnType<typeof listProducts>>)
  vi.mocked(listWarehouses).mockResolvedValue({
    content: [{ id: 3, name: 'North warehouse' }],
  } as Awaited<ReturnType<typeof listWarehouses>>)
  vi.mocked(listLocations).mockResolvedValue({
    content: [{ id: 7, code: 'A-01' }],
  } as Awaited<ReturnType<typeof listLocations>>)
  vi.mocked(adjustStock).mockResolvedValue({} as Awaited<ReturnType<typeof adjustStock>>)
})

function renderAs(role: string) {
  const user: UserDto = {
    id: 11,
    username: 'inventory-user',
    displayName: 'Inventory User',
    active: true,
    roles: [role],
  }
  localStorage.setItem('user', JSON.stringify(user))

  return render(
    <MemoryRouter>
      <ToastProvider>
        <AuthProvider>
          <InventoryPage />
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>,
  )
}

describe('inventory adjustment', () => {
  it('lets a manager review and submit an adjustment through the existing API', async () => {
    renderAs('WAREHOUSE_MANAGER')
    fireEvent.click(screen.getByRole('button', { name: 'Adjust stock' }))

    await screen.findByRole('option', { name: 'Packing tape (TAPE-12)' })
    fireEvent.change(screen.getByLabelText('Product *'), { target: { value: '12' } })
    await screen.findByRole('option', { name: 'North warehouse' })
    fireEvent.change(screen.getByLabelText('Warehouse *'), { target: { value: '3' } })
    await screen.findByRole('option', { name: 'A-01' })
    fireEvent.change(screen.getByLabelText('Storage location *'), { target: { value: '7' } })
    fireEvent.change(screen.getByLabelText('Quantity change *'), { target: { value: '-4' } })

    fireEvent.click(screen.getByRole('button', { name: 'Review adjustment' }))
    expect(screen.getByText('-4 units')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Confirm adjustment' }))

    await waitFor(() => expect(adjustStock).toHaveBeenCalledWith({
      productId: 12,
      storageLocationId: 7,
      quantityDelta: -4,
      notes: undefined,
    }))
  })

  it('does not expose the adjustment action to an employee', () => {
    renderAs('WAREHOUSE_EMPLOYEE')
    expect(screen.queryByRole('button', { name: 'Adjust stock' })).not.toBeInTheDocument()
  })
})

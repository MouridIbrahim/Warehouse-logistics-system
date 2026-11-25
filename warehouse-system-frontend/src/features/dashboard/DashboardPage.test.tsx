import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import type { UserDto } from '../../types'
import { DashboardPage } from './DashboardPage'

const authState = vi.hoisted(() => ({ user: null as UserDto | null }))

vi.mock('../auth/auth-context', () => ({
  useAuth: () => ({ user: authState.user }),
}))

vi.mock('./api', () => ({
  fetchDashboard: vi.fn(),
}))

import { fetchDashboard } from './api'

afterEach(cleanup)

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(fetchDashboard).mockResolvedValue({
    totalInventoryOnHand: 480,
    pendingInboundOrders: 4,
    pendingOutboundOrders: 2,
    shipmentStatusCounts: [
      { status: 'IN_TRANSIT', count: 3 },
      { status: 'DELIVERED', count: 5 },
      { status: 'CANCELLED', count: 1 },
    ],
  } as Awaited<ReturnType<typeof fetchDashboard>>)
})

function userWithRole(role: string): UserDto {
  return {
    id: 9,
    username: 'warehouse-user',
    displayName: 'Warehouse User',
    active: true,
    roles: [role],
  }
}

describe('role-aware dashboard', () => {
  it('shows warehouse work and operational creation shortcuts', async () => {
    authState.user = userWithRole('WAREHOUSE_EMPLOYEE')
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)

    expect(await screen.findByText('Pending inbound')).toBeInTheDocument()
    expect(screen.getByText('480')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Receive goods' })).toHaveAttribute('href', '/app/inbound/new')
    expect(screen.getByRole('link', { name: 'Cycle count' })).toHaveAttribute('href', '/app/cycle-count')
    expect(screen.queryByRole('link', { name: 'Review audit logs' })).not.toBeInTheDocument()
  })

  it('shows audit shortcuts rather than operational mutation links to auditors', async () => {
    authState.user = userWithRole('VIEWER_AUDITOR')
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)

    await waitFor(() => expect(fetchDashboard).toHaveBeenCalledOnce())
    expect(screen.getByRole('link', { name: 'View reports' })).toHaveAttribute('href', '/app/reports')
    expect(screen.getByRole('link', { name: 'Review audit logs' })).toHaveAttribute('href', '/app/audit-logs')
    expect(screen.queryByRole('link', { name: 'Receive goods' })).not.toBeInTheDocument()
  })
})

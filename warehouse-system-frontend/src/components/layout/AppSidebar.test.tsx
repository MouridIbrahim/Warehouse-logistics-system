import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import type { UserDto } from '../../types'
import { AuthProvider } from '../../features/auth/auth-context'
import { AppSidebar } from './AppSidebar'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

function renderSidebar(roles: string[]) {
  const user: UserDto = {
    id: 10,
    username: 'role-user',
    displayName: 'Role User',
    active: true,
    roles,
  }
  localStorage.setItem('user', JSON.stringify(user))

  return render(
    <MemoryRouter initialEntries={['/app']}>
      <AuthProvider>
        <AppSidebar mobileOpen onClose={() => undefined} />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('role-based sidebar', () => {
  it('shows operational routes to warehouse employees', () => {
    renderSidebar(['WAREHOUSE_EMPLOYEE'])

    expect(screen.getByRole('link', { name: 'Receiving' })).toHaveAttribute('href', '/app/inbound')
    fireEvent.click(screen.getByRole('button', { name: /Stock & catalog/ }))
    expect(screen.getByRole('link', { name: 'Cycle counting' })).toHaveAttribute('href', '/app/cycle-count')
    expect(screen.queryByRole('link', { name: 'User Management' })).not.toBeInTheDocument()
  })

  it('keeps audit navigation while omitting operations-only links for auditors', () => {
    renderSidebar(['VIEWER_AUDITOR'])

    fireEvent.click(screen.getByRole('button', { name: /Reports & administration/ }))
    expect(screen.getByRole('link', { name: 'Audit Logs' })).toHaveAttribute('href', '/app/audit-logs')
    expect(screen.queryByRole('link', { name: 'Cycle counting' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'System Settings' })).not.toBeInTheDocument()
  })
})

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../features/auth/auth-context'
import type { UserDto } from '../../types'
import { OnboardingProvider, useOnboarding } from './OnboardingContext'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

function renderGuide(roles: string[]) {
  const user: UserDto = {
    id: 8,
    username: 'test-user',
    displayName: 'Test User',
    active: true,
    roles,
  }
  localStorage.setItem('user', JSON.stringify(user))

  return render(
    <MemoryRouter>
      <AuthProvider>
        <OnboardingProvider>
          <RestartTour />
        </OnboardingProvider>
      </AuthProvider>
    </MemoryRouter>,
  )
}

function RestartTour() {
  const { restartTour } = useOnboarding()
  return <button type="button" onClick={restartTour}>Restart tour</button>
}

describe('role-aware onboarding', () => {
  it('shows operational guidance, remembers skip, and can restart the tour', () => {
    const { unmount } = renderGuide(['WAREHOUSE_EMPLOYEE'])

    expect(screen.getByRole('dialog', { name: 'Welcome to LogiTrack' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Skip tour' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    unmount()
    renderGuide(['WAREHOUSE_EMPLOYEE'])
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Restart tour' }))
    expect(screen.getByRole('dialog', { name: 'Welcome to LogiTrack' })).toBeInTheDocument()
  })

  it('offers audit-specific navigation to an auditor', () => {
    renderGuide(['VIEWER_AUDITOR'])

    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByRole('link', { name: 'Review audit logs' })).toHaveAttribute('href', '/app/audit-logs')
    expect(screen.queryByRole('link', { name: 'Receive goods' })).not.toBeInTheDocument()
  })
})

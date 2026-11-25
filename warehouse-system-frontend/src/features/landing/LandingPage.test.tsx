import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { LandingPage } from './LandingPage'

beforeEach(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function renderLandingPage() {
  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )
}

describe('landing page', () => {
  it('directs visitors to the real sign in and initial account routes', () => {
    renderLandingPage()

    expect(screen.getAllByRole('link', { name: /Create first account/ })).toHaveLength(3)
    expect(screen.getAllByRole('link', { name: 'Sign in' }).length).toBeGreaterThanOrEqual(3)
    expect(screen.getAllByRole('link', { name: /Create first account/ })[0]).toHaveAttribute(
      'href',
      '/register',
    )
    expect(screen.getAllByRole('link', { name: 'Sign in' })[0]).toHaveAttribute('href', '/login')
  })

  it('explains the initial administrator setup and existing role access', () => {
    renderLandingPage()

    expect(screen.getByText(/The first registered account becomes the Administrator/)).toBeInTheDocument()
    fireEvent.click(screen.getByText('Can anyone create an account?'))
    expect(
      screen.getByText(/After that, ask an existing administrator to create an account for you/),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Warehouse Employee' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Viewer or Auditor' })).toBeInTheDocument()
    expect(document.querySelectorAll('#how-it-works ol > li')).toHaveLength(3)
    expect(document.querySelectorAll('#roles ul > li')).toHaveLength(5)
  })

  it('opens and closes the mobile navigation and uses real section anchors', () => {
    renderLandingPage()

    fireEvent.click(screen.getByRole('button', { name: 'Open navigation menu' }))
    const mobileNavigation = screen.getByRole('navigation', { name: 'Mobile navigation' })
    expect(within(mobileNavigation).getByRole('link', { name: 'Features' })).toHaveAttribute(
      'href',
      '#product',
    )

    fireEvent.click(within(mobileNavigation).getByRole('link', { name: 'FAQ' }))
    expect(screen.queryByRole('navigation', { name: 'Mobile navigation' })).not.toBeInTheDocument()

    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
      expect(document.getElementById(anchor.hash.slice(1))).not.toBeNull()
    })
  })

  it('does not present unsupported performance claims or placeholder links', () => {
    renderLandingPage()

    expect(document.body.textContent).not.toMatch(/99\.99%|EDI 214|1,248,600|100% On-Time/)
    expect(document.querySelector('a[href="#"]')).toBeNull()
  })
})

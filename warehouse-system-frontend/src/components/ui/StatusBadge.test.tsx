import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from './StatusBadge'

describe('StatusBadge', () => {
  it('renders its label', () => {
    render(<StatusBadge tone="success">Active</StatusBadge>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('applies the tone classes', () => {
    const { container } = render(<StatusBadge tone="danger">Failed</StatusBadge>)
    expect(container.firstChild).toHaveClass('bg-status-danger-bg')
  })
})

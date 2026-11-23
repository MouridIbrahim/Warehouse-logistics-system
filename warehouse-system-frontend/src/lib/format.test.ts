import { describe, expect, it } from 'vitest'
import { formatDateTime, humanize } from './format'

describe('humanize', () => {
  it('converts snake_case to Title Case', () => {
    expect(humanize('INBOUND_CONFIRMED')).toBe('Inbound Confirmed')
  })

  it('handles single words', () => {
    expect(humanize('PRODUCT')).toBe('Product')
  })
})

describe('formatDateTime', () => {
  it('returns a dash for undefined', () => {
    expect(formatDateTime(undefined)).toBe('—')
  })

  it('formats a valid ISO timestamp', () => {
    expect(formatDateTime('2026-01-15T10:30:00Z')).toContain('2026')
  })
})

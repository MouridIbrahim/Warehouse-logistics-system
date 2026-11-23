import { describe, expect, it } from 'vitest'
import { ADMIN, ADMIN_MANAGER, hasAnyRole } from './permissions'
import type { UserDto } from '../../types'

const user: UserDto = {
  id: 1,
  username: 'manager',
  displayName: 'Warehouse Manager',
  active: true,
  roles: ['WAREHOUSE_MANAGER'],
}

describe('hasAnyRole', () => {
  it('returns true when the user has one of the roles', () => {
    expect(hasAnyRole(user, ADMIN_MANAGER)).toBe(true)
  })

  it('returns false when the user lacks all roles', () => {
    expect(hasAnyRole(user, ADMIN)).toBe(false)
  })

  it('returns false for a null user', () => {
    expect(hasAnyRole(null, ADMIN)).toBe(false)
  })
})

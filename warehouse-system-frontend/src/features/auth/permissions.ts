import type { UserDto } from '../../types'

export const ALL_ROLES = [
  'ADMINISTRATOR',
  'WAREHOUSE_MANAGER',
  'WAREHOUSE_EMPLOYEE',
  'SHIPMENT_MANAGER',
  'VIEWER_AUDITOR',
]
export const ADMIN = ['ADMINISTRATOR']
export const ADMIN_MANAGER = ['ADMINISTRATOR', 'WAREHOUSE_MANAGER']
export const OPERATIONS = ['ADMINISTRATOR', 'WAREHOUSE_MANAGER', 'WAREHOUSE_EMPLOYEE']
export const SHIPMENT_MANAGE = ['ADMINISTRATOR', 'WAREHOUSE_MANAGER', 'SHIPMENT_MANAGER']
export const SHIPMENT_VIEW = ['ADMINISTRATOR', 'WAREHOUSE_MANAGER', 'SHIPMENT_MANAGER', 'VIEWER_AUDITOR']
export const AUDIT_VIEW = ['ADMINISTRATOR', 'WAREHOUSE_MANAGER', 'VIEWER_AUDITOR']

export function hasAnyRole(user: UserDto | null, roles: string[]): boolean {
  return !!user?.roles.some((r) => roles.includes(r))
}

import { api } from '../../lib/api'
import type { PageResponse, UserDto } from '../../types'

export interface RoleDto {
  id: number
  name: string
  description?: string
}

export async function listUsers(
  term?: string,
  role?: string,
  active?: boolean,
  page = 0,
  size = 20,
): Promise<PageResponse<UserDto>> {
  const { data } = await api.get<PageResponse<UserDto>>('/api/v1/users', {
    params: { term: term || undefined, role: role || undefined, active: active !== undefined ? active : undefined, page, size },
  })
  return data
}

export async function listRoles(): Promise<RoleDto[]> {
  const { data } = await api.get<RoleDto[]>('/api/v1/roles')
  return data
}

export async function getUser(id: number): Promise<UserDto> {
  const { data } = await api.get<UserDto>(`/api/v1/users/${id}`)
  return data
}

export async function createUser(payload: {
  username: string
  password: string
  displayName: string
  roles: string[]
}): Promise<UserDto> {
  const { data } = await api.post<UserDto>('/api/v1/users', payload)
  return data
}

export async function updateUser(
  id: number,
  payload: { displayName?: string; active?: boolean; roles?: string[] },
): Promise<UserDto> {
  const { data } = await api.patch<UserDto>(`/api/v1/users/${id}`, payload)
  return data
}

export async function resetUserPassword(id: number, newPassword: string): Promise<void> {
  await api.patch(`/api/v1/users/${id}/password`, { newPassword })
}

import { api } from '../../lib/api'
import type { LoginResponse, UserDto } from '../../types'

export async function login(username: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/api/v1/auth/login', { username, password })
  return data
}

export async function register(payload: {
  username: string
  password: string
  displayName: string
}): Promise<UserDto> {
  const { data } = await api.post<UserDto>('/api/v1/auth/register', payload)
  return data
}

export async function me(): Promise<UserDto> {
  const { data } = await api.get<UserDto>('/api/v1/auth/me')
  return data
}

export async function changePassword(payload: {
  currentPassword: string
  newPassword: string
}): Promise<void> {
  await api.post('/api/v1/auth/change-password', payload)
}

export async function logout(): Promise<void> {
  await api.post('/api/v1/auth/logout')
}

export async function refreshToken(): Promise<{ accessToken: string }> {
  const { data } = await api.post<{ accessToken: string }>('/api/v1/auth/refresh')
  return data
}

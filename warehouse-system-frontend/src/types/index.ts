export interface UserDto {
  id: number
  username: string
  displayName: string
  active: boolean
  roles: string[]
  createdAt?: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: UserDto
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface ApiError {
  status: number
  code: string
  message: string
  fieldErrors?: Record<string, string>
  timestamp?: string
}

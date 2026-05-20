import { get, post } from './client'

export interface CurrentUser {
  isAuthenticated: boolean
  id: string
  firstName: string
  lastName: string
  email: string
  nickname: string
  phoneNumber?: string
  isAdmin: boolean
}

export const getMe = () => get<CurrentUser>('/auth/me')

export const login = (nickname: string, password: string) =>
  post<CurrentUser>('/auth/login', { nickname, password })

export const register = (data: {
  firstName: string
  lastName: string
  email: string
  nickname: string
  password: string
  phoneNumber?: string
}) => post<CurrentUser>('/auth/register', data)

export const logout = () => post<void>('/auth/logout')

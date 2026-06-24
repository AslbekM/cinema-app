import { get, put, del, patch } from './client'

export interface UserInfo {
  id: string
  firstName: string
  lastName: string
  email: string
  nickname: string
  phoneNumber?: string
  passwordHash?: string
  rowVersion?: string
}

export const getUsers = () => get<UserInfo[]>('/users')

export const getUser = (id: string) => get<UserInfo>(`/users/${id}`)

export const updateUser = (id: string, data: Omit<UserInfo, 'id'>) =>
  put<UserInfo>(`/users/${id}`, data)

export const changeUserPassword = (id: string, newPassword: string) =>
  patch<{ message: string }>(`/users/${id}/password`, { newPassword })

export const deleteUser = (id: string, rowVersion?: string) =>
  del<{ message: string }>(`/users/${id}`, { rowVersion })

import { get, put } from './client'

export interface ProfileData {
  id: string
  firstName: string
  lastName: string
  email: string
  nickname: string
  phoneNumber?: string
  rowVersion?: string
}

export const getProfile = () => get<ProfileData>('/profile')

export const updateProfile = (data: {
  firstName: string
  lastName: string
  email: string
  nickname: string
  phoneNumber?: string
  rowVersion?: string
  currentPassword?: string
  newPassword?: string
}) => put<ProfileData>('/profile', data)

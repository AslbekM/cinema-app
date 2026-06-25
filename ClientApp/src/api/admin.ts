import { get, del } from './client'

export interface AdminStats {
  totalUsers: number
  totalScreenings: number
  upcomingScreenings: number
  totalBookings: number
  revenue: number
  occupancy: number
  topFilms: { film: string; bookings: number }[]
}

export interface ScreeningReservation {
  rowNumber: number
  seatNumber: number
  userNickname: string
  userEmail: string
}

export interface AuditEntry {
  timestamp: string
  userName: string | null
  action: string
  details: string | null
}

export const getAdminStats = () => get<AdminStats>('/admin/stats')

export const getScreeningReservations = (id: number) =>
  get<ScreeningReservation[]>(`/admin/screenings/${id}/reservations`)

export const getAuditLog = () => get<AuditEntry[]>('/admin/audit')

export interface UserReservation {
  id: number
  screeningId: number
  filmTitle: string
  startTime: string
  cinemaName: string
  rowNumber: number
  seatNumber: number
  isPast: boolean
}

export const getUserReservations = (userId: string) =>
  get<UserReservation[]>(`/admin/users/${userId}/reservations`)

export const adminDeleteReservation = (reservationId: number) =>
  del<{ message: string }>(`/admin/reservations/${reservationId}`)

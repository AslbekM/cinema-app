import { get, post, del } from './client'

export interface MyReservation {
  id: number
  screeningId: number
  filmTitle: string
  startTime: string
  cinemaName: string
  seatId: number
  rowNumber: number
  seatNumber: number
  isPast: boolean
}

export const reserveSeat = (screeningId: number, seatId: number) =>
  post<{ message: string }>('/reservations', { screeningId, seatId })

export const cancelReservation = (screeningId: number, seatId: number) =>
  del<{ message: string }>('/reservations', { screeningId, seatId })

export const getMyReservations = () => get<MyReservation[]>('/reservations/mine')

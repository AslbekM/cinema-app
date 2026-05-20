import { post, del } from './client'

export const reserveSeat = (screeningId: number, seatId: number) =>
  post<{ message: string }>('/reservations', { screeningId, seatId })

export const cancelReservation = (screeningId: number, seatId: number) =>
  del<{ message: string }>('/reservations', { screeningId, seatId })

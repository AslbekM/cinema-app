import { post, del } from './client'

export const holdSeats = (screeningId: number, seatIds: number[]) =>
  post<{ expiresAt: string }>('/holds', { screeningId, seatIds })

export const releaseHolds = (screeningId: number) =>
  del<{ message: string }>(`/holds/${screeningId}`)

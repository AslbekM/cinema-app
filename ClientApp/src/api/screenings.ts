import { get, post, del } from './client'

export interface Screening {
  id: number
  filmTitle: string
  startTime: string
  cinemaId: number
  cinemaName: string
}

export interface Seat {
  id: number
  rowNumber: number
  seatNumber: number
}

export interface ScreeningDetails extends Screening {
  rows: number
  seatsPerRow: number
  seats: Seat[]
  reservedSeatIds: number[]
  mySeatIds: number[]
  isLoggedIn: boolean
}

export const getScreenings = () => get<Screening[]>('/screenings')

export const getScreening = (id: number) => get<ScreeningDetails>(`/screenings/${id}`)

export const createScreening = (data: { filmTitle: string; startTime: string; cinemaId: number }) =>
  post<Screening>('/screenings', data)

export const deleteScreening = (id: number) =>
  del<{ message: string }>(`/screenings/${id}`)

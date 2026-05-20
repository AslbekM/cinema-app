import { get } from './client'

export interface Cinema {
  id: number
  name: string
  rows: number
  seatsPerRow: number
}

export const getCinemas = () => get<Cinema[]>('/cinemas')

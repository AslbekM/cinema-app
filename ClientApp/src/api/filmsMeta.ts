import { get } from './client'

export interface TmdbMeta {
  available: boolean
  posterUrl?: string
  overview?: string
  trailerKey?: string
}

export const getFilmMetaTmdb = (title: string) =>
  get<TmdbMeta>(`/films/meta?title=${encodeURIComponent(title)}`)

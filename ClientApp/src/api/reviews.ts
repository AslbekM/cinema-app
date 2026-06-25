import { get, post } from './client'

export interface ReviewItem {
  userName: string | null
  rating: number
  comment: string | null
  createdAt: string
}

export interface FilmReviews {
  average: number
  count: number
  canReview: boolean
  myRating?: number | null
  myComment?: string | null
  reviews: ReviewItem[]
}

export const getReviews = (filmTitle: string) =>
  get<FilmReviews>(`/reviews/${encodeURIComponent(filmTitle)}`)

export const postReview = (filmTitle: string, rating: number, comment?: string) =>
  post<{ message: string }>('/reviews', { filmTitle, rating, comment })

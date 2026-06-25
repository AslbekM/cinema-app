import { useState, useEffect, useCallback } from 'react'
import { getReviews, postReview, type FilmReviews as Data } from '../api/reviews'
import { useAuth } from '../contexts/AuthContext'

const stars = (n: number) => '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n)

export default function FilmReviews({ filmTitle }: { filmTitle: string }) {
  const { user } = useAuth()
  const [data, setData] = useState<Data | null>(null)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    getReviews(filmTitle).then((d) => {
      setData(d)
      if (d.myRating) setRating(d.myRating)
      if (d.myComment) setComment(d.myComment)
    })
  }, [filmTitle])

  useEffect(load, [load])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (rating < 1) {
      setError('Please pick a rating.')
      return
    }
    setBusy(true)
    try {
      await postReview(filmTitle, rating, comment || undefined)
      load()
    } catch (err) {
      setError(Array.isArray(err) ? err.join(' ') : 'Failed to submit review.')
    } finally {
      setBusy(false)
    }
  }

  if (!data) return null

  return (
    <div className="mt-4">
      <h4 className="mb-3" style={{ fontWeight: 600 }}>
        Reviews{' '}
        {data.count > 0 && (
          <span className="text-muted" style={{ fontSize: '1rem' }}>
            · ⭐ {data.average} ({data.count})
          </span>
        )}
      </h4>

      {/* Write / edit a review */}
      {user && data.canReview && (
        <div className="card mb-3">
          <div className="card-body">
            <form onSubmit={submit}>
              <div style={{ fontSize: '1.8rem', cursor: 'pointer' }} className="mb-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    style={{ filter: (hover || rating) >= n ? 'none' : 'grayscale(1) opacity(0.4)' }}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <textarea
                className="form-control mb-2"
                rows={3}
                placeholder="Share your thoughts (optional)…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
              />
              {error && <div className="alert alert-danger py-2">{error}</div>}
              <button className="btn btn-success btn-sm" disabled={busy}>
                {busy ? 'Saving…' : data.myRating ? 'Update review' : 'Submit review'}
              </button>
            </form>
          </div>
        </div>
      )}
      {user && !data.canReview && (
        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
          Book this film to leave a review.
        </p>
      )}

      {/* Existing reviews */}
      {data.reviews.length === 0 ? (
        <p className="text-muted">No reviews yet.</p>
      ) : (
        <div className="d-flex flex-column gap-2">
          {data.reviews.map((r, i) => (
            <div key={i} className="card">
              <div className="card-body py-2">
                <div className="d-flex justify-content-between align-items-center">
                  <strong>{r.userName ?? 'User'}</strong>
                  <span style={{ color: '#f5c451' }}>{stars(r.rating)}</span>
                </div>
                {r.comment && (
                  <div className="text-muted mt-1" style={{ fontSize: '0.92rem' }}>
                    {r.comment}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

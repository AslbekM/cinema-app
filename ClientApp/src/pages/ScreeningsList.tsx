import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getScreenings, deleteScreening, type Screening } from '../api/screenings'
import { useAuth } from '../contexts/AuthContext'

const POSTERS = ['🎬', '🍿', '🎞️', '🎥', '⭐', '🎭', '🚀', '👑']

export default function ScreeningsList() {
  const [screenings, setScreenings] = useState<Screening[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)
  const { user } = useAuth()

  const load = () => {
    setLoading(true)
    getScreenings()
      .then(setScreenings)
      .catch(() => setError('Failed to load screenings.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete screening "${title}" and all its reservations?`)) return
    setDeleting(id)
    try {
      await deleteScreening(id)
      setScreenings((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      alert(Array.isArray(err) ? err.join('\n') : 'Failed to delete screening.')
    } finally {
      setDeleting(null)
    }
  }

  if (loading)
    return (
      <div className="loader">
        <div className="loader-ring" />
        <span>Loading screenings…</span>
      </div>
    )

  if (error) return <div className="alert alert-danger">{error}</div>

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Screenings</h2>
          <div className="section-sub">
            {screenings.length} screening{screenings.length === 1 ? '' : 's'} available
          </div>
        </div>
        {user?.isAdmin && (
          <Link className="btn btn-success" to="/admin/screenings/create">
            + Create Screening
          </Link>
        )}
      </div>

      {screenings.length === 0 ? (
        <div className="empty-state">
          <span className="emoji">🎟️</span>
          No screenings available.
        </div>
      ) : (
        <div className="screen-grid">
          {screenings.map((s, i) => (
            <div key={s.id} className="movie-card" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="movie-poster">
                <span>{POSTERS[s.id % POSTERS.length]}</span>
              </div>
              <div className="movie-body">
                <div className="movie-title">{s.filmTitle}</div>
                <div className="movie-meta">🕑 {new Date(s.startTime).toLocaleString()}</div>
                <div className="movie-meta">📍 {s.cinemaName}</div>
                <div className="movie-actions">
                  <Link className="btn btn-success btn-sm flex-grow-1" to={`/screenings/${s.id}`}>
                    View Seats
                  </Link>
                  {user?.isAdmin && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(s.id, s.filmTitle)}
                      disabled={deleting === s.id}
                    >
                      {deleting === s.id ? '…' : 'Delete'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

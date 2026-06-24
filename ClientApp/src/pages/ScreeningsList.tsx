import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getScreenings, deleteScreening, type Screening } from '../api/screenings'
import { useAuth } from '../contexts/AuthContext'
import Reveal from '../components/Reveal'
import { posterFor } from '../posters'

const POSTERS = ['🎬', '🍿', '🎞️', '🎥', '⭐', '🎭', '🚀', '👑']
const GRADIENTS = [
  'linear-gradient(135deg, #ff9a85, #ff6f4d)',
  'linear-gradient(135deg, #7c5cff, #4d3bff)',
  'linear-gradient(135deg, #34d399, #0ea5a4)',
  'linear-gradient(135deg, #f472b6, #db2777)',
  'linear-gradient(135deg, #fbbf24, #f97316)',
  'linear-gradient(135deg, #60a5fa, #2563eb)',
]
const grad = (id: number) => GRADIENTS[id % GRADIENTS.length]
const poster = (id: number) => POSTERS[id % POSTERS.length]

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
            <Reveal key={s.id} delay={i * 45}>
              <div className="movie-card h-100">
                <div className="movie-poster" style={{ background: grad(s.id) }}>
                  {posterFor(s.filmTitle) ? (
                    <img className="poster-img" src={posterFor(s.filmTitle)} alt={s.filmTitle} loading="lazy" />
                  ) : (
                    <span className="emoji">{poster(s.id)}</span>
                  )}
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
                      <>
                        <Link className="btn btn-warning btn-sm" to={`/admin/screenings/${s.id}/edit`}>
                          Edit
                        </Link>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(s.id, s.filmTitle)}
                          disabled={deleting === s.id}
                        >
                          {deleting === s.id ? '…' : '✕'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  )
}

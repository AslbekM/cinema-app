import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getScreenings, type Screening } from '../api/screenings'

const POSTERS = ['🎬', '🍿', '🎞️', '🎥', '⭐', '🎭', '🚀', '👑']

export default function Home() {
  const [screenings, setScreenings] = useState<Screening[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getScreenings()
      .then(setScreenings)
      .catch(() => setError('Failed to load screenings.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <section className="hero">
        <span className="hero-eyebrow">✦ Now playing in 4K</span>
        <h1>
          Book the best seats <span className="grad">before the lights dim</span>
        </h1>
        <p>
          Pick your screening, choose your perfect spot on an interactive seat map, and reserve in
          seconds. Your night at the movies, reimagined.
        </p>
        <div className="d-flex gap-2 mt-4 flex-wrap">
          <Link to="/screenings" className="btn btn-success">
            Browse screenings →
          </Link>
          <Link to="/register" className="btn btn-outline-secondary">
            Create account
          </Link>
        </div>
      </section>

      <div className="section-head">
        <div>
          <h2>Now Showing</h2>
          <div className="section-sub">Fresh screenings, hand-picked for tonight</div>
        </div>
        <Link to="/screenings" className="btn btn-outline-secondary btn-sm">
          View all
        </Link>
      </div>

      {loading ? (
        <div className="loader">
          <div className="loader-ring" />
          <span>Loading screenings…</span>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : screenings.length === 0 ? (
        <div className="empty-state">
          <span className="emoji">🎟️</span>
          No screenings available right now. Check back soon!
        </div>
      ) : (
        <div className="screen-grid">
          {screenings.slice(0, 8).map((s, i) => (
            <Link
              to={`/screenings/${s.id}`}
              key={s.id}
              className="movie-card text-decoration-none"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="movie-poster">
                <span>{POSTERS[s.id % POSTERS.length]}</span>
              </div>
              <div className="movie-body">
                <div className="movie-title">{s.filmTitle}</div>
                <div className="movie-meta">🕑 {new Date(s.startTime).toLocaleString()}</div>
                <div className="movie-meta">📍 {s.cinemaName}</div>
                <div className="movie-actions">
                  <span className="btn btn-success btn-sm w-100">Select seats</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getScreenings, type Screening } from '../api/screenings'
import Reveal from '../components/Reveal'

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

  const featured = screenings.slice(0, 5)

  return (
    <div>
      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="hero-glow" />
        <span className="eyebrow">
          <span className="dot" /> Now playing in 4K
        </span>
        <h1>
          Your night at the movies, <span className="text-gradient">reimagined</span>
        </h1>
        <p>
          Browse screenings, pick the perfect seat on an interactive map, and reserve in seconds —
          all in one beautifully simple experience.
        </p>
        <div className="hero-actions">
          <Link to="/screenings" className="btn btn-success btn-lg">
            Browse screenings
          </Link>
          <Link to="/register" className="btn btn-outline-secondary btn-lg">
            Create account
          </Link>
        </div>

        {featured.length > 0 && (
          <div className="poster-stage poster-float">
            {featured.map((s, i) => {
              const pos = ['far-left', 'left', 'center', 'right', 'far-right'][i]
              return (
                <div
                  key={s.id}
                  className={`poster-card ${pos}`}
                  style={{ background: grad(s.id) }}
                  title={s.filmTitle}
                >
                  {poster(s.id)}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ---------- Now showing ---------- */}
      <Reveal>
        <div className="section-head">
          <div>
            <h2>Now Showing</h2>
            <div className="section-sub">Fresh screenings, hand-picked for tonight</div>
          </div>
          <Link to="/screenings" className="btn btn-outline-secondary btn-sm">
            View all
          </Link>
        </div>
      </Reveal>

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
            <Reveal key={s.id} delay={i * 60}>
              <Link to={`/screenings/${s.id}`} className="movie-card h-100">
                <div className="movie-poster" style={{ background: grad(s.id) }}>
                  <span className="emoji">{poster(s.id)}</span>
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
            </Reveal>
          ))}
        </div>
      )}
    </div>
  )
}

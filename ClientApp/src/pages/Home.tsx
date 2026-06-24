import { useState, useEffect, useMemo, useRef } from 'react'
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

const pad = (n: number) => String(n).padStart(2, '0')
const dateKey = (iso: string) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
const dateLabel = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })

export default function Home() {
  const [screenings, setScreenings] = useState<Screening[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [fCinema, setFCinema] = useState('')
  const [fFilm, setFFilm] = useState('')
  const [fDate, setFDate] = useState('')
  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getScreenings()
      .then(setScreenings)
      .catch(() => setError('Failed to load screenings.'))
      .finally(() => setLoading(false))
  }, [])

  const cinemas = useMemo(
    () => [...new Set(screenings.map((s) => s.cinemaName))].sort(),
    [screenings]
  )
  const films = useMemo(
    () => [...new Set(screenings.map((s) => s.filmTitle))].sort(),
    [screenings]
  )
  const dates = useMemo(() => {
    const seen = new Map<string, string>()
    for (const s of screenings) if (!seen.has(dateKey(s.startTime))) seen.set(dateKey(s.startTime), s.startTime)
    return [...seen.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [screenings])

  const hasFilter = !!(fCinema || fFilm || fDate)
  const filtered = screenings.filter(
    (s) =>
      (!fCinema || s.cinemaName === fCinema) &&
      (!fFilm || s.filmTitle === fFilm) &&
      (!fDate || dateKey(s.startTime) === fDate)
  )
  const visible = hasFilter ? filtered : filtered.slice(0, 8)

  const reset = () => {
    setFCinema('')
    setFFilm('')
    setFDate('')
  }
  const scrollToResults = () => resultsRef.current?.scrollIntoView({ behavior: 'smooth' })

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

      {/* ---------- Quick Purchase filter bar ---------- */}
      <div className="quick-bar">
        <div className="quick-bar-label">
          QUICK
          <br />
          PURCHASE
        </div>
        <div className="quick-field">
          <label>Cinema</label>
          <select value={fCinema} onChange={(e) => setFCinema(e.target.value)}>
            <option value="">Choose a cinema</option>
            {cinemas.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="quick-field">
          <label>Film / Event</label>
          <select value={fFilm} onChange={(e) => setFFilm(e.target.value)}>
            <option value="">Select a title</option>
            {films.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <div className="quick-field">
          <label>Date</label>
          <select value={fDate} onChange={(e) => setFDate(e.target.value)}>
            <option value="">Select a date</option>
            {dates.map(([key, iso]) => (
              <option key={key} value={key}>
                {dateLabel(iso)}
              </option>
            ))}
          </select>
        </div>
        <div className="quick-search-wrap">
          <button className="btn btn-success" onClick={scrollToResults}>
            Search
          </button>
        </div>
      </div>

      {/* ---------- Now showing ---------- */}
      <Reveal>
        <div className="section-head" ref={resultsRef}>
          <div>
            <h2>{hasFilter ? 'Search Results' : 'Now Showing'}</h2>
            <div className="section-sub">
              {hasFilter
                ? `${filtered.length} screening${filtered.length === 1 ? '' : 's'} found`
                : 'Fresh screenings, hand-picked for tonight'}
            </div>
          </div>
          {hasFilter ? (
            <button className="btn btn-outline-secondary btn-sm" onClick={reset}>
              ✕ Clear filters
            </button>
          ) : (
            <Link to="/screenings" className="btn btn-outline-secondary btn-sm">
              View all
            </Link>
          )}
        </div>
      </Reveal>

      {loading ? (
        <div className="loader">
          <div className="loader-ring" />
          <span>Loading screenings…</span>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : visible.length === 0 ? (
        <div className="empty-state">
          <span className="emoji">🔍</span>
          {hasFilter ? 'No screenings match your search.' : 'No screenings available right now.'}
          {hasFilter && (
            <div className="mt-3">
              <button className="btn btn-success btn-sm" onClick={reset}>
                Clear filters
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="screen-grid">
          {visible.map((s, i) => (
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

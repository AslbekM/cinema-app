import { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getScreenings, type Screening } from '../api/screenings'
import Reveal from '../components/Reveal'
import PosterCarousel from '../components/PosterCarousel'
import { posterFor } from '../posters'
import { useI18n } from '../i18n'

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

  const { t } = useI18n()
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

  const carouselItems = screenings.slice(0, 10).map((s) => ({
    id: s.id,
    title: s.filmTitle,
    img: posterFor(s.filmTitle),
    emoji: poster(s.id),
    gradient: grad(s.id),
  }))

  return (
    <div>
      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="hero-glow" />
        <span className="eyebrow">
          <span className="dot" /> {t('hero.eyebrow')}
        </span>
        <h1>
          {t('hero.titlePre')} <span className="text-gradient">{t('hero.titleHi')}</span>
        </h1>
        <p>{t('hero.subtitle')}</p>
        <div className="hero-actions">
          <Link to="/screenings" className="btn btn-success btn-lg">
            {t('hero.browse')}
          </Link>
          <Link to="/register" className="btn btn-outline-secondary btn-lg">
            {t('hero.createAccount')}
          </Link>
        </div>

        {carouselItems.length > 0 && <PosterCarousel items={carouselItems} />}
      </section>

      {/* ---------- Quick Purchase filter bar ---------- */}
      <div className="quick-bar">
        <div className="quick-bar-label">{t('quick.label')}</div>
        <div className="quick-field">
          <label>{t('quick.cinema')}</label>
          <select value={fCinema} onChange={(e) => setFCinema(e.target.value)}>
            <option value="">{t('quick.cinemaPh')}</option>
            {cinemas.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="quick-field">
          <label>{t('quick.film')}</label>
          <select value={fFilm} onChange={(e) => setFFilm(e.target.value)}>
            <option value="">{t('quick.filmPh')}</option>
            {films.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <div className="quick-field">
          <label>{t('quick.date')}</label>
          <select value={fDate} onChange={(e) => setFDate(e.target.value)}>
            <option value="">{t('quick.datePh')}</option>
            {dates.map(([key, iso]) => (
              <option key={key} value={key}>
                {dateLabel(iso)}
              </option>
            ))}
          </select>
        </div>
        <div className="quick-search-wrap">
          <button className="btn btn-success" onClick={scrollToResults}>
            {t('quick.search')}
          </button>
        </div>
      </div>

      {/* ---------- Now showing ---------- */}
      <Reveal>
        <div className="section-head" ref={resultsRef}>
          <div>
            <h2>{hasFilter ? t('home.searchResults') : t('home.nowShowing')}</h2>
            <div className="section-sub">
              {hasFilter ? `${filtered.length} 🎬` : t('home.nowShowingSub')}
            </div>
          </div>
          {hasFilter ? (
            <button className="btn btn-outline-secondary btn-sm" onClick={reset}>
              ✕ {t('home.clear')}
            </button>
          ) : (
            <Link to="/screenings" className="btn btn-outline-secondary btn-sm">
              {t('home.viewAll')}
            </Link>
          )}
        </div>
      </Reveal>

      {loading ? (
        <div className="screen-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton skeleton-card" />
          ))}
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : visible.length === 0 ? (
        <div className="empty-state">
          <span className="emoji">🔍</span>
          {hasFilter ? t('home.noResults') : t('home.none')}
          {hasFilter && (
            <div className="mt-3">
              <button className="btn btn-success btn-sm" onClick={reset}>
                {t('home.clear')}
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

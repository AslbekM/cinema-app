import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getScreenings, type Screening } from '../api/screenings'
import { posterFor } from '../posters'
import { filmMeta, trailerId } from '../films'
import { getFilmMetaTmdb, type TmdbMeta } from '../api/filmsMeta'
import { useI18n } from '../i18n'
import FilmReviews from '../components/FilmReviews'

export default function FilmDetails() {
  const { title: raw } = useParams<{ title: string }>()
  const title = decodeURIComponent(raw ?? '')
  const { t } = useI18n()
  const [screenings, setScreenings] = useState<Screening[]>([])
  const [loading, setLoading] = useState(true)
  const [tmdb, setTmdb] = useState<TmdbMeta | null>(null)

  useEffect(() => {
    getScreenings()
      .then(setScreenings)
      .finally(() => setLoading(false))
  }, [])

  // Pull poster/overview/trailer from TMDB as a fallback (no-op if no API key).
  useEffect(() => {
    if (title) getFilmMetaTmdb(title).then((m) => m.available && setTmdb(m)).catch(() => {})
  }, [title])

  const showtimes = useMemo(
    () =>
      screenings
        .filter((s) => s.filmTitle === title)
        .sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime)),
    [screenings, title]
  )

  // Group showtimes by date.
  const byDate = useMemo(() => {
    const map = new Map<string, Screening[]>()
    for (const s of showtimes) {
      const key = new Date(s.startTime).toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      })
      ;(map.get(key) ?? map.set(key, []).get(key)!).push(s)
    }
    return [...map.entries()]
  }, [showtimes])

  if (loading)
    return (
      <div className="loader">
        <div className="loader-ring" />
        <span>{t('home.loading')}</span>
      </div>
    )

  const meta = filmMeta(title)
  const poster = posterFor(title) ?? tmdb?.posterUrl
  const trailer = trailerId(title) ?? tmdb?.trailerKey
  const synopsis = meta?.synopsis ?? tmdb?.overview

  return (
    <div>
      <Link to="/screenings" className="btn btn-outline-secondary btn-sm mb-3">
        ← {t('sd.back')}
      </Link>

      <div className="card mb-4">
        <div className="card-body d-flex gap-4 flex-wrap">
          {poster && (
            <img
              src={poster}
              alt={title}
              style={{ width: 170, borderRadius: 12, objectFit: 'cover', boxShadow: 'var(--shadow-card)' }}
            />
          )}
          <div className="flex-grow-1" style={{ minWidth: 260 }}>
            <h2 className="mb-2">{title}</h2>
            {meta && (
              <div className="d-flex flex-wrap gap-2 mb-3">
                <span className="chip">🎭 {meta.genre}</span>
                <span className="chip">⏱️ {meta.duration}</span>
                <span className="chip">🔞 {meta.rating}</span>
              </div>
            )}
            {synopsis && <p className="text-muted">{synopsis}</p>}
          </div>
        </div>
      </div>

      {trailer && (
        <div className="mb-4">
          <h4 className="mb-3" style={{ fontWeight: 600 }}>
            Trailer
          </h4>
          <div className="trailer-wrap">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailer}`}
              title={`${title} trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      <h4 className="mb-3" style={{ fontWeight: 600 }}>
        Showtimes
      </h4>
      {showtimes.length === 0 ? (
        <p className="text-muted">No upcoming showtimes for this film.</p>
      ) : (
        <div className="d-flex flex-column gap-3">
          {byDate.map(([date, list]) => (
            <div key={date}>
              <div className="text-muted mb-2" style={{ fontWeight: 600 }}>
                {date}
              </div>
              <div className="d-flex flex-wrap gap-2">
                {list.map((s) => (
                  <Link key={s.id} to={`/screenings/${s.id}`} className="btn btn-success btn-sm">
                    {new Date(s.startTime).toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    <span style={{ opacity: 0.7, marginLeft: 6 }}>· {s.cinemaName}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <FilmReviews filmTitle={title} />
    </div>
  )
}

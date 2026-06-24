import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { getMyReservations, cancelReservation, type MyReservation } from '../api/reservations'
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

interface TicketGroup {
  screeningId: number
  filmTitle: string
  startTime: string
  cinemaName: string
  isPast: boolean
  seats: MyReservation[]
}

function groupByScreening(items: MyReservation[]): TicketGroup[] {
  const map = new Map<number, TicketGroup>()
  for (const r of items) {
    let g = map.get(r.screeningId)
    if (!g) {
      g = {
        screeningId: r.screeningId,
        filmTitle: r.filmTitle,
        startTime: r.startTime,
        cinemaName: r.cinemaName,
        isPast: r.isPast,
        seats: [],
      }
      map.set(r.screeningId, g)
    }
    g.seats.push(r)
  }
  return [...map.values()]
}

export default function MyTickets() {
  const [reservations, setReservations] = useState<MyReservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<number | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    getMyReservations()
      .then(setReservations)
      .catch(() => setError('Failed to load your reservations.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const handleCancel = async (r: MyReservation) => {
    if (!confirm(`Cancel seat ${r.rowNumber}-${r.seatNumber} for "${r.filmTitle}"?`)) return
    setBusy(r.seatId)
    try {
      await cancelReservation(r.screeningId, r.seatId)
      setReservations((prev) => prev.filter((x) => x.id !== r.id))
    } catch (err) {
      alert(Array.isArray(err) ? err.join('\n') : 'Failed to cancel.')
    } finally {
      setBusy(null)
    }
  }

  if (loading)
    return (
      <div className="loader">
        <div className="loader-ring" />
        <span>Loading your tickets…</span>
      </div>
    )

  if (error) return <div className="alert alert-danger">{error}</div>

  const upcoming = groupByScreening(reservations.filter((r) => !r.isPast))
  const past = groupByScreening(reservations.filter((r) => r.isPast))

  const TicketCard = ({ g, i }: { g: TicketGroup; i: number }) => (
    <Reveal delay={i * 50}>
      <div className="card mb-3">
        <div className="card-body d-flex gap-3 align-items-center flex-wrap">
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              display: 'grid',
              placeItems: 'center',
              fontSize: '1.8rem',
              background: GRADIENTS[g.screeningId % GRADIENTS.length],
              flexShrink: 0,
            }}
          >
            {POSTERS[g.screeningId % POSTERS.length]}
          </div>
          <div className="flex-grow-1" style={{ minWidth: 180 }}>
            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{g.filmTitle}</div>
            <div className="text-muted" style={{ fontSize: '0.88rem' }}>
              🕑 {new Date(g.startTime).toLocaleString()} · 📍 {g.cinemaName}
            </div>
          </div>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            {g.seats
              .sort((a, b) => a.rowNumber - b.rowNumber || a.seatNumber - b.seatNumber)
              .map((s) => (
                <span key={s.id} className="chip">
                  🎟️ Row {s.rowNumber}, Seat {s.seatNumber}
                  {!g.isPast && (
                    <button
                      className="btn btn-danger btn-sm py-0 px-2 ms-1"
                      style={{ fontSize: '0.72rem' }}
                      onClick={() => handleCancel(s)}
                      disabled={busy === s.seatId}
                      title="Cancel this seat"
                    >
                      {busy === s.seatId ? '…' : '✕'}
                    </button>
                  )}
                </span>
              ))}
          </div>
          {!g.isPast && (
            <div
              style={{ background: '#fff', padding: 8, borderRadius: 10, lineHeight: 0 }}
              title="Your e-ticket — scan at the entrance"
            >
              <QRCodeSVG
                value={`adafcinema|S${g.screeningId}|${g.filmTitle}|${new Date(g.startTime).toISOString()}|seats:${g.seats
                  .map((s) => `${s.rowNumber}-${s.seatNumber}`)
                  .join(',')}`}
                size={72}
                level="M"
              />
            </div>
          )}
        </div>
      </div>
    </Reveal>
  )

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>My Tickets</h2>
          <div className="section-sub">Your booked seats and reservation history</div>
        </div>
        <Link to="/screenings" className="btn btn-success btn-sm">
          Book more
        </Link>
      </div>

      {reservations.length === 0 ? (
        <div className="empty-state">
          <span className="emoji">🎟️</span>
          You haven't booked any seats yet.
          <div className="mt-3">
            <Link to="/screenings" className="btn btn-success btn-sm">
              Browse screenings
            </Link>
          </div>
        </div>
      ) : (
        <>
          <h4 className="mb-3" style={{ fontWeight: 600 }}>
            Upcoming <span className="text-muted">({upcoming.length})</span>
          </h4>
          {upcoming.length === 0 ? (
            <p className="text-muted mb-4">No upcoming reservations.</p>
          ) : (
            <div className="mb-4">
              {upcoming.map((g, i) => (
                <TicketCard key={g.screeningId} g={g} i={i} />
              ))}
            </div>
          )}

          {past.length > 0 && (
            <>
              <h4 className="mb-3" style={{ fontWeight: 600, opacity: 0.7 }}>
                Past <span className="text-muted">({past.length})</span>
              </h4>
              <div style={{ opacity: 0.65 }}>
                {past.map((g, i) => (
                  <TicketCard key={g.screeningId} g={g} i={i} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

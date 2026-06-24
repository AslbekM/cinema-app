import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getScreening, type ScreeningDetails as ScreeningDetailsType } from '../api/screenings'
import { reserveSeat, cancelReservation } from '../api/reservations'
import { useAuth } from '../contexts/AuthContext'
import SeatGrid from '../components/SeatGrid'
import CheckoutModal from '../components/CheckoutModal'
import { posterFor } from '../posters'
import { filmMeta } from '../films'

const PRICE_STANDARD = 25
const PRICE_VIP = 40
const CURRENCY = 'zł'
const MAX_SEATS = 8

export default function ScreeningDetails() {
  const { id } = useParams<{ id: string }>()
  const [screening, setScreening] = useState<ScreeningDetailsType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [selected, setSelected] = useState<number[]>([])
  const [showCheckout, setShowCheckout] = useState(false)
  const [checkoutLabels, setCheckoutLabels] = useState<string[]>([])
  const [checkoutTotal, setCheckoutTotal] = useState(0)
  const { user } = useAuth()

  const load = useCallback(() => {
    if (!id) return
    setLoading(true)
    getScreening(Number(id))
      .then(setScreening)
      .catch(() => setError('Screening not found.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(load, [load])

  const showMsg = (type: 'success' | 'danger', text: string) => {
    setActionMsg({ type, text })
    setTimeout(() => setActionMsg(null), 3000)
  }

  const seatLabel = (seatId: number) => {
    const s = screening?.seats.find((x) => x.id === seatId)
    return s ? `Row ${s.rowNumber}, Seat ${s.seatNumber}` : `Seat ${seatId}`
  }

  // Back two rows are VIP (priced higher).
  const isVip = (rowNumber: number) => !!screening && rowNumber > screening.rows - 2
  const seatPrice = (seatId: number) => {
    const s = screening?.seats.find((x) => x.id === seatId)
    return s && isVip(s.rowNumber) ? PRICE_VIP : PRICE_STANDARD
  }
  const selectedTotal = selected.reduce((sum, id) => sum + seatPrice(id), 0)

  const toggleSelect = (seatId: number) => {
    setSelected((prev) => {
      if (prev.includes(seatId)) return prev.filter((x) => x !== seatId)
      if (prev.length >= MAX_SEATS) {
        showMsg('danger', `You can book at most ${MAX_SEATS} seats per order.`)
        return prev
      }
      return [...prev, seatId]
    })
  }

  const handleCancel = async (seatId: number) => {
    if (!screening) return
    if (!confirm('Cancel this booked seat?')) return
    setBusy(true)
    try {
      await cancelReservation(screening.id, seatId)
      showMsg('success', 'Booking cancelled.')
      setScreening(await getScreening(screening.id))
    } catch (err) {
      showMsg('danger', Array.isArray(err) ? err.join(' ') : 'Failed to cancel.')
    } finally {
      setBusy(false)
    }
  }

  // Called by the checkout modal after "payment" — books all selected seats.
  const confirmBooking = async (): Promise<string | null> => {
    if (!screening) return 'Screening not available.'
    const ids = [...selected]
    const succeeded: number[] = []
    const failed: string[] = []
    for (const seatId of ids) {
      try {
        await reserveSeat(screening.id, seatId)
        succeeded.push(seatId)
      } catch {
        failed.push(seatLabel(seatId))
      }
    }
    setScreening(await getScreening(screening.id))
    setSelected((prev) => prev.filter((sid) => !succeeded.includes(sid)))
    if (failed.length) return `These seats were just taken: ${failed.join(', ')}. Please pick others.`
    return null
  }

  const openCheckout = () => {
    setCheckoutLabels(selected.map(seatLabel))
    setCheckoutTotal(selectedTotal)
    setShowCheckout(true)
  }

  if (loading)
    return (
      <div className="loader">
        <div className="loader-ring" />
        <span>Loading seat map…</span>
      </div>
    )

  if (error || !screening)
    return (
      <div className="alert alert-danger">
        {error ?? 'Screening not found.'} <Link to="/screenings">Back to screenings</Link>
      </div>
    )

  return (
    <div>
      <Link to="/screenings" className="btn btn-outline-secondary btn-sm mb-3">
        ← Back
      </Link>

      <div className="card mb-4">
        <div className="card-body d-flex gap-4 flex-wrap">
          {posterFor(screening.filmTitle) && (
            <img
              src={posterFor(screening.filmTitle)}
              alt={screening.filmTitle}
              style={{ width: 150, borderRadius: 12, objectFit: 'cover', boxShadow: 'var(--shadow-card)' }}
            />
          )}
          <div className="flex-grow-1" style={{ minWidth: 240 }}>
            <h2 className="mb-2">{screening.filmTitle}</h2>
            {(() => {
              const m = filmMeta(screening.filmTitle)
              return m ? (
                <div className="d-flex flex-wrap gap-2 mb-2">
                  <span className="chip">🎭 {m.genre}</span>
                  <span className="chip">⏱️ {m.duration}</span>
                  <span className="chip">🔞 {m.rating}</span>
                </div>
              ) : null
            })()}
            <div className="d-flex flex-wrap gap-2 mb-2">
              <span className="chip">🕑 {new Date(screening.startTime).toLocaleString()}</span>
              <span className="chip">📍 {screening.cinemaName}</span>
              <span className="chip">💵 Standard {PRICE_STANDARD} · VIP {PRICE_VIP} {CURRENCY}</span>
            </div>
            {filmMeta(screening.filmTitle)?.synopsis && (
              <p className="text-muted mb-0" style={{ fontSize: '0.92rem' }}>
                {filmMeta(screening.filmTitle)!.synopsis}
              </p>
            )}
          </div>
        </div>
      </div>

      {actionMsg && (
        <div className={`alert alert-${actionMsg.type} py-2`} role="alert">
          {actionMsg.text}
        </div>
      )}

      {!user && (
        <div className="alert alert-info py-2">
          <Link to="/login">Log in</Link> to select and book seats.
        </div>
      )}

      <SeatGrid
        seats={screening.seats}
        reservedSeatIds={screening.reservedSeatIds}
        mySeatIds={screening.mySeatIds}
        selectedSeatIds={selected}
        isLoggedIn={screening.isLoggedIn}
        onToggleSelect={toggleSelect}
        onCancel={handleCancel}
        disabled={busy}
      />

      {selected.length > 0 && (
        <div className="summary-bar">
          <div>
            <div className="total">
              {selectedTotal} {CURRENCY}{' '}
              <small>· {selected.length} seat{selected.length === 1 ? '' : 's'}</small>
            </div>
            <div className="text-muted" style={{ fontSize: '0.82rem' }}>
              {selected.map(seatLabel).join(' · ')}
            </div>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setSelected([])}>
              Clear
            </button>
            <button className="btn btn-success" onClick={openCheckout}>
              Checkout →
            </button>
          </div>
        </div>
      )}

      {showCheckout && (
        <CheckoutModal
          seatLabels={checkoutLabels}
          seatTotal={checkoutTotal}
          currency={CURRENCY}
          filmTitle={screening.filmTitle}
          onConfirm={confirmBooking}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </div>
  )
}

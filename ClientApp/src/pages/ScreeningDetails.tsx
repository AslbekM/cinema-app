import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getScreening, type ScreeningDetails as ScreeningDetailsType } from '../api/screenings'
import { reserveSeat, cancelReservation } from '../api/reservations'
import { useAuth } from '../contexts/AuthContext'
import SeatGrid from '../components/SeatGrid'

export default function ScreeningDetails() {
  const { id } = useParams<{ id: string }>()
  const [screening, setScreening] = useState<ScreeningDetailsType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
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

  const handleReserve = async (seatId: number) => {
    if (!screening) return
    setBusy(true)
    try {
      await reserveSeat(screening.id, seatId)
      showMsg('success', 'Seat reserved successfully!')
      // Reload to get fresh reservation state
      const updated = await getScreening(screening.id)
      setScreening(updated)
    } catch (err) {
      showMsg('danger', Array.isArray(err) ? err.join(' ') : 'Failed to reserve seat.')
    } finally {
      setBusy(false)
    }
  }

  const handleCancel = async (seatId: number) => {
    if (!screening) return
    setBusy(true)
    try {
      await cancelReservation(screening.id, seatId)
      showMsg('success', 'Reservation cancelled.')
      const updated = await getScreening(screening.id)
      setScreening(updated)
    } catch (err) {
      showMsg('danger', Array.isArray(err) ? err.join(' ') : 'Failed to cancel reservation.')
    } finally {
      setBusy(false)
    }
  }

  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status" />
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

      <div className="mb-4">
        <h2>{screening.filmTitle}</h2>
        <p className="text-muted mb-1">
          <strong>Date &amp; Time:</strong> {new Date(screening.startTime).toLocaleString()}
        </p>
        <p className="text-muted mb-0">
          <strong>Cinema:</strong> {screening.cinemaName} ({screening.rows} rows × {screening.seatsPerRow} seats)
        </p>
      </div>

      {actionMsg && (
        <div className={`alert alert-${actionMsg.type} py-2`} role="alert">
          {actionMsg.text}
        </div>
      )}

      {!user && (
        <div className="alert alert-info py-2">
          <Link to="/login">Log in</Link> to reserve seats.
        </div>
      )}

      <SeatGrid
        seats={screening.seats}
        reservedSeatIds={screening.reservedSeatIds}
        mySeatIds={screening.mySeatIds}
        isLoggedIn={screening.isLoggedIn}
        screeningId={screening.id}
        onReserve={handleReserve}
        onCancel={handleCancel}
        disabled={busy}
      />
    </div>
  )
}

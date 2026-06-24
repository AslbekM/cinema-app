import { Link } from 'react-router-dom'

export interface Seat {
  id: number
  rowNumber: number
  seatNumber: number
}

interface Props {
  seats: Seat[]
  reservedSeatIds: number[]
  mySeatIds: number[]
  selectedSeatIds: number[]
  isLoggedIn: boolean
  onToggleSelect: (seatId: number) => void
  onCancel: (seatId: number) => void
  disabled?: boolean
}

export default function SeatGrid({
  seats,
  reservedSeatIds,
  mySeatIds,
  selectedSeatIds,
  isLoggedIn,
  onToggleSelect,
  onCancel,
  disabled,
}: Props) {
  const reservedSet = new Set(reservedSeatIds)
  const mySet = new Set(mySeatIds)
  const selectedSet = new Set(selectedSeatIds)

  const rows = seats.reduce<Record<number, Seat[]>>((acc, seat) => {
    ;(acc[seat.rowNumber] ??= []).push(seat)
    return acc
  }, {})

  return (
    <div className="seatmap">
      <div className="screen-bar" />
      <div className="screen-label">Screen</div>

      {Object.entries(rows)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([row, rowSeats]) => (
          <div key={row} className="seat-row">
            <span className="row-label">{row}</span>
            {rowSeats
              .sort((a, b) => a.seatNumber - b.seatNumber)
              .map((seat) => {
                const title = `Row ${seat.rowNumber}, Seat ${seat.seatNumber}`

                if (mySet.has(seat.id)) {
                  return (
                    <button
                      key={seat.id}
                      className="seat seat-mine"
                      onClick={() => onCancel(seat.id)}
                      disabled={disabled}
                      title={`${title} — booked by you. Click to cancel.`}
                    >
                      {seat.seatNumber}
                    </button>
                  )
                }
                if (reservedSet.has(seat.id)) {
                  return (
                    <button key={seat.id} className="seat seat-reserved" disabled title={`${title} — reserved`}>
                      {seat.seatNumber}
                    </button>
                  )
                }
                if (!isLoggedIn) {
                  return (
                    <Link key={seat.id} to="/login" className="seat seat-locked" title={`${title} — log in to book`}>
                      {seat.seatNumber}
                    </Link>
                  )
                }
                const selected = selectedSet.has(seat.id)
                return (
                  <button
                    key={seat.id}
                    className={`seat ${selected ? 'seat-selected' : 'seat-available'}`}
                    onClick={() => onToggleSelect(seat.id)}
                    disabled={disabled}
                    title={`${title} — ${selected ? 'selected (click to remove)' : 'available'}`}
                  >
                    {seat.seatNumber}
                  </button>
                )
              })}
          </div>
        ))}

      <div className="legend">
        <span className="legend-item">
          <span className="legend-swatch" style={{ background: 'linear-gradient(to top,rgba(255,255,255,0.8),#fff)' }} />
          Available
        </span>
        <span className="legend-item">
          <span className="legend-swatch" style={{ background: 'var(--gradient-primary)' }} />
          Selected
        </span>
        <span className="legend-item">
          <span className="legend-swatch" style={{ background: 'linear-gradient(135deg,#34d399,#10b981)' }} />
          Your booking
        </span>
        <span className="legend-item">
          <span className="legend-swatch" style={{ background: 'var(--elevated)' }} />
          Reserved
        </span>
      </div>
    </div>
  )
}

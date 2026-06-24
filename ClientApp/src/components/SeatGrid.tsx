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
  isLoggedIn: boolean
  screeningId: number
  onReserve: (seatId: number) => void
  onCancel: (seatId: number) => void
  disabled?: boolean
}

export default function SeatGrid({
  seats,
  reservedSeatIds,
  mySeatIds,
  isLoggedIn,
  onReserve,
  onCancel,
  disabled,
}: Props) {
  const reservedSet = new Set(reservedSeatIds)
  const mySet = new Set(mySeatIds)

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
                const ismine = mySet.has(seat.id)
                const isReserved = reservedSet.has(seat.id)
                const title = `Row ${seat.rowNumber}, Seat ${seat.seatNumber}`

                if (ismine) {
                  return (
                    <button
                      key={seat.id}
                      className="seat seat-mine"
                      onClick={() => onCancel(seat.id)}
                      disabled={disabled}
                      title={`${title} — your reservation. Click to cancel.`}
                    >
                      {seat.seatNumber}
                    </button>
                  )
                }
                if (isReserved) {
                  return (
                    <button
                      key={seat.id}
                      className="seat seat-reserved"
                      disabled
                      title={`${title} — reserved`}
                    >
                      {seat.seatNumber}
                    </button>
                  )
                }
                return isLoggedIn ? (
                  <button
                    key={seat.id}
                    className="seat seat-available"
                    onClick={() => onReserve(seat.id)}
                    disabled={disabled}
                    title={`${title} — available`}
                  >
                    {seat.seatNumber}
                  </button>
                ) : (
                  <Link
                    key={seat.id}
                    to="/login"
                    className="seat seat-locked"
                    title={`${title} — log in to reserve`}
                  >
                    {seat.seatNumber}
                  </Link>
                )
              })}
          </div>
        ))}

      <div className="legend">
        <span className="legend-item">
          <span className="legend-swatch" style={{ background: 'var(--emerald-grad)' }} />
          Available
        </span>
        <span className="legend-item">
          <span className="legend-swatch" style={{ background: 'var(--gold-grad)' }} />
          My reservation
        </span>
        <span className="legend-item">
          <span className="legend-swatch" style={{ background: 'rgba(255,255,255,0.1)' }} />
          Reserved
        </span>
      </div>
    </div>
  )
}

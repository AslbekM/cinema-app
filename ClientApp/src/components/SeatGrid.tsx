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
    <div>
      <div className="text-center mb-3">
        <div
          className="p-2 text-white fw-semibold rounded"
          style={{ backgroundColor: '#333', maxWidth: '300px', margin: '0 auto' }}
        >
          SCREEN
        </div>
      </div>

      {Object.entries(rows)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([row, rowSeats]) => (
          <div key={row} className="d-flex justify-content-center align-items-center gap-1 mb-1">
            <span className="text-muted me-2" style={{ minWidth: '20px', textAlign: 'right' }}>
              {row}
            </span>
            {rowSeats.map((seat) => {
              const ismine = mySet.has(seat.id)
              const isReserved = reservedSet.has(seat.id)

              if (ismine) {
                return (
                  <button
                    key={seat.id}
                    className="btn btn-warning btn-sm p-0"
                    style={{ width: '34px', height: '34px', fontSize: '11px' }}
                    onClick={() => onCancel(seat.id)}
                    disabled={disabled}
                    title={`Row ${seat.rowNumber}, Seat ${seat.seatNumber} — your reservation. Click to cancel.`}
                  >
                    {seat.seatNumber}
                  </button>
                )
              }
              if (isReserved) {
                return (
                  <button
                    key={seat.id}
                    className="btn btn-danger btn-sm p-0"
                    style={{ width: '34px', height: '34px', fontSize: '11px' }}
                    disabled
                    title={`Row ${seat.rowNumber}, Seat ${seat.seatNumber} — reserved`}
                  >
                    {seat.seatNumber}
                  </button>
                )
              }
              return isLoggedIn ? (
                <button
                  key={seat.id}
                  className="btn btn-success btn-sm p-0"
                  style={{ width: '34px', height: '34px', fontSize: '11px' }}
                  onClick={() => onReserve(seat.id)}
                  disabled={disabled}
                  title={`Row ${seat.rowNumber}, Seat ${seat.seatNumber} — available`}
                >
                  {seat.seatNumber}
                </button>
              ) : (
                <Link
                  key={seat.id}
                  to="/login"
                  className="btn btn-outline-success btn-sm p-0"
                  style={{ width: '34px', height: '34px', fontSize: '11px', lineHeight: '32px' }}
                  title={`Row ${seat.rowNumber}, Seat ${seat.seatNumber} — log in to reserve`}
                >
                  {seat.seatNumber}
                </Link>
              )
            })}
          </div>
        ))}

      <div className="d-flex flex-wrap gap-3 mt-4 justify-content-center">
        <span className="d-flex align-items-center gap-1">
          <span
            className="btn btn-success btn-sm p-0"
            style={{ width: '20px', height: '20px', pointerEvents: 'none' }}
          />
          Available
        </span>
        <span className="d-flex align-items-center gap-1">
          <span
            className="btn btn-warning btn-sm p-0"
            style={{ width: '20px', height: '20px', pointerEvents: 'none' }}
          />
          My reservation
        </span>
        <span className="d-flex align-items-center gap-1">
          <span
            className="btn btn-danger btn-sm p-0"
            style={{ width: '20px', height: '20px', pointerEvents: 'none' }}
          />
          Reserved
        </span>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getScreenings, type Screening } from '../api/screenings'

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

  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status" />
      </div>
    )

  if (error) return <div className="alert alert-danger">{error}</div>

  return (
    <div>
      <h2 className="mb-4">Now Showing</h2>
      {screenings.length === 0 ? (
        <p className="text-muted">No screenings available.</p>
      ) : (
        <table className="table table-hover">
          <thead className="table-dark">
            <tr>
              <th>Film</th>
              <th>Date &amp; Time</th>
              <th>Cinema</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {screenings.map((s) => (
              <tr key={s.id}>
                <td className="fw-semibold">{s.filmTitle}</td>
                <td>{new Date(s.startTime).toLocaleString()}</td>
                <td>{s.cinemaName}</td>
                <td>
                  <Link className="btn btn-success btn-sm" to={`/screenings/${s.id}`}>
                    Seats
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

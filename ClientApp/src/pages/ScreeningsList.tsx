import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getScreenings, deleteScreening, type Screening } from '../api/screenings'
import { useAuth } from '../contexts/AuthContext'

export default function ScreeningsList() {
  const [screenings, setScreenings] = useState<Screening[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)
  const { user } = useAuth()

  const load = () => {
    setLoading(true)
    getScreenings()
      .then(setScreenings)
      .catch(() => setError('Failed to load screenings.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete screening "${title}" and all its reservations?`)) return
    setDeleting(id)
    try {
      await deleteScreening(id)
      setScreenings((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      alert(Array.isArray(err) ? err.join('\n') : 'Failed to delete screening.')
    } finally {
      setDeleting(null)
    }
  }

  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status" />
      </div>
    )

  if (error) return <div className="alert alert-danger">{error}</div>

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Screenings</h2>
        {user?.isAdmin && (
          <Link className="btn btn-success" to="/admin/screenings/create">
            + Create Screening
          </Link>
        )}
      </div>

      {screenings.length === 0 ? (
        <p className="text-muted">No screenings available.</p>
      ) : (
        <table className="table table-hover">
          <thead className="table-dark">
            <tr>
              <th>Film</th>
              <th>Date &amp; Time</th>
              <th>Cinema</th>
              <th>Seats</th>
              {user?.isAdmin && <th>Actions</th>}
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
                    View Seats
                  </Link>
                </td>
                {user?.isAdmin && (
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(s.id, s.filmTitle)}
                      disabled={deleting === s.id}
                    >
                      {deleting === s.id ? '…' : 'Delete'}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

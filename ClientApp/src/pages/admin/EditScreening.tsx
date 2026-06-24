import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getScreening, updateScreening } from '../../api/screenings'
import { getCinemas, type Cinema } from '../../api/cinemas'

// Convert an ISO string to the value a datetime-local input expects (YYYY-MM-DDTHH:mm).
const toLocalInput = (iso: string) => {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function EditScreening() {
  const { id } = useParams<{ id: string }>()
  const [form, setForm] = useState({ filmTitle: '', startTime: '', cinemaId: '' })
  const [cinemas, setCinemas] = useState<Cinema[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([getCinemas(), getScreening(Number(id))])
      .then(([cs, s]) => {
        setCinemas(cs)
        setForm({
          filmTitle: s.filmTitle,
          startTime: toLocalInput(s.startTime),
          cinemaId: String(s.cinemaId),
        })
      })
      .catch(() => setErrors(['Failed to load screening.']))
      .finally(() => setReady(true))
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])
    if (!form.cinemaId) {
      setErrors(['Please select a cinema.'])
      return
    }
    setLoading(true)
    try {
      await updateScreening(Number(id), {
        filmTitle: form.filmTitle,
        startTime: form.startTime,
        cinemaId: Number(form.cinemaId),
      })
      navigate('/screenings')
    } catch (err) {
      setErrors(Array.isArray(err) ? err : ['Failed to update screening.'])
    } finally {
      setLoading(false)
    }
  }

  if (!ready)
    return (
      <div className="loader">
        <div className="loader-ring" />
        <span>Loading…</span>
      </div>
    )

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <h2 className="mb-4">Edit Screening</h2>

        {errors.map((e, i) => (
          <div key={i} className="alert alert-danger py-2">
            {e}
          </div>
        ))}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Film Title</label>
            <input
              className="form-control"
              value={form.filmTitle}
              onChange={(e) => setForm((f) => ({ ...f, filmTitle: e.target.value }))}
              required
              maxLength={150}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Date &amp; Time</label>
            <input
              type="datetime-local"
              className="form-control"
              value={form.startTime}
              onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Cinema</label>
            <select
              className="form-select"
              value={form.cinemaId}
              onChange={(e) => setForm((f) => ({ ...f, cinemaId: e.target.value }))}
              required
            >
              <option value="">— Select cinema —</option>
              {cinemas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.rows} rows × {c.seatsPerRow} seats)
                </option>
              ))}
            </select>
          </div>

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate('/screenings')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

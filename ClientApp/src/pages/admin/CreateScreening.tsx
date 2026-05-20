import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createScreening } from '../../api/screenings'
import { getCinemas, type Cinema } from '../../api/cinemas'

export default function CreateScreening() {
  const [form, setForm] = useState({
    filmTitle: '',
    startTime: '',
    cinemaId: '',
  })
  const [cinemas, setCinemas] = useState<Cinema[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    getCinemas().then(setCinemas).catch(() => setErrors(['Failed to load cinemas.']))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])

    if (!form.cinemaId) {
      setErrors(['Please select a cinema.'])
      return
    }

    setLoading(true)
    try {
      await createScreening({
        filmTitle: form.filmTitle,
        startTime: form.startTime,
        cinemaId: Number(form.cinemaId),
      })
      navigate('/screenings')
    } catch (err) {
      setErrors(Array.isArray(err) ? err : ['Failed to create screening.'])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <h2 className="mb-4">Create Screening</h2>

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
              {loading ? 'Creating…' : 'Create Screening'}
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

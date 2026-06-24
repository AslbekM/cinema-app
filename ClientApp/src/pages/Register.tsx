import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api/auth'
import { useAuth } from '../contexts/AuthContext'
import PasswordInput from '../components/PasswordInput'

export default function Register() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    nickname: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  })
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const { refreshUser } = useAuth()
  const navigate = useNavigate()

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])

    if (form.password !== form.confirmPassword) {
      setErrors(['Passwords do not match.'])
      return
    }

    setLoading(true)
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        nickname: form.nickname,
        password: form.password,
        phoneNumber: form.phoneNumber || undefined,
      })
      await refreshUser()
      navigate('/')
    } catch (err) {
      setErrors(Array.isArray(err) ? err : ['Registration failed. Please try again.'])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card wide">
        <div className="auth-icon">🍿</div>
        <h2>Create your account</h2>
        <p className="auth-sub">Join adafcinema and start booking in seconds</p>
        {errors.map((e, i) => (
          <div key={i} className="alert alert-danger py-2">
            {e}
          </div>
        ))}
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col mb-3">
              <label className="form-label">First Name</label>
              <input className="form-control" value={form.firstName} onChange={set('firstName')} required maxLength={50} />
            </div>
            <div className="col mb-3">
              <label className="form-label">Last Name</label>
              <input className="form-control" value={form.lastName} onChange={set('lastName')} required maxLength={50} />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" value={form.email} onChange={set('email')} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Nickname</label>
            <input className="form-control" value={form.nickname} onChange={set('nickname')} required maxLength={30} />
          </div>
          <div className="mb-3">
            <label className="form-label">Phone Number <span className="text-muted">(optional)</span></label>
            <input type="tel" className="form-control" value={form.phoneNumber} onChange={set('phoneNumber')} />
          </div>
          <PasswordInput
            label="Password"
            value={form.password}
            onChange={set('password')}
            required
            minLength={6}
            autoComplete="new-password"
          />
          <PasswordInput
            label="Confirm Password"
            value={form.confirmPassword}
            onChange={set('confirmPassword')}
            required
            autoComplete="new-password"
          />
          <button type="submit" className="btn btn-success w-100 mt-2" disabled={loading}>
            {loading ? 'Registering…' : 'Register'}
          </button>
          <p className="text-center text-muted mt-3 mb-0" style={{ fontSize: '0.9rem' }}>
            Already have an account?{' '}
            <Link to="/login" className="text-decoration-none">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

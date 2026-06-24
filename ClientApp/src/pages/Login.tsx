import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import PasswordInput from '../components/PasswordInput'

export default function Login() {
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])
    setLoading(true)
    try {
      await login(nickname, password)
      navigate('/')
    } catch (err) {
      setErrors(Array.isArray(err) ? err : ['Login failed. Please try again.'])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-icon">🎬</div>
        <h2>Welcome back</h2>
        <p className="auth-sub">Sign in to reserve your seats</p>
        {errors.map((e, i) => (
          <div key={i} className="alert alert-danger py-2">
            {e}
          </div>
        ))}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nickname</label>
            <input
              className="form-control"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              autoFocus
            />
          </div>
          <PasswordInput
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button type="submit" className="btn btn-success w-100 mt-2" disabled={loading}>
            {loading ? 'Logging in…' : 'Login'}
          </button>
          <p className="text-center text-muted mt-3 mb-0" style={{ fontSize: '0.9rem' }}>
            Don't have an account?{' '}
            <Link to="/register" className="text-decoration-none">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

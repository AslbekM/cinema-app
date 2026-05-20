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
    <div className="row justify-content-center">
      <div className="col-md-5">
        <h2 className="mb-4">Login</h2>
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
          <button type="submit" className="btn btn-success" disabled={loading}>
            {loading ? 'Logging in…' : 'Login'}
          </button>
          <Link to="/register" className="ms-3 text-decoration-none">
            Don't have an account? Register
          </Link>
        </form>
      </div>
    </div>
  )
}

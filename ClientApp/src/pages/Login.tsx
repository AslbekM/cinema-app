import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import PasswordInput from '../components/PasswordInput'
import { useI18n } from '../i18n'

export default function Login() {
  const { t } = useI18n()
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
        <h2>{t('auth.welcomeBack')}</h2>
        <p className="auth-sub">{t('auth.signInSub')}</p>
        {errors.map((e, i) => (
          <div key={i} className="alert alert-danger py-2">
            {e}
          </div>
        ))}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">{t('auth.nickname')}</label>
            <input
              className="form-control"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              autoFocus
            />
          </div>
          <PasswordInput
            label={t('auth.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button type="submit" className="btn btn-success w-100 mt-2" disabled={loading}>
            {loading ? t('auth.loggingIn') : t('auth.login')}
          </button>
          <p className="text-center text-muted mt-3 mb-0" style={{ fontSize: '0.9rem' }}>
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-decoration-none">
              {t('auth.register')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

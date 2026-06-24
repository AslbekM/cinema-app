import { useEffect, useState } from 'react'
import { Link, useNavigate, NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useI18n, LANGS } from '../i18n'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { t, lang, setLang } = useI18n()
  const navigate = useNavigate()

  const [theme, setTheme] = useState<'dark' | 'light'>(
    () => (localStorage.getItem('theme') as 'dark' | 'light') || 'dark'
  )
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      navigate('/login')
    }
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <span className="brand-mark">🎬</span>
          <span className="brand-text">adafcinema</span>
        </Link>
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navMenu"
          aria-controls="navMenu"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink className="nav-link" to="/screenings">
                {t('nav.screenings')}
              </NavLink>
            </li>
            {user && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/my-tickets">
                  {t('nav.myTickets')}
                </NavLink>
              </li>
            )}
            {user?.isAdmin && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/admin/dashboard">
                    {t('nav.dashboard')}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/admin/users">
                    {t('nav.users')}
                  </NavLink>
                </li>
              </>
            )}
          </ul>
          <ul className="navbar-nav align-items-lg-center">
            <li className="nav-item me-lg-2">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setTheme((th) => (th === 'dark' ? 'light' : 'dark'))}
                title="Toggle light / dark"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </li>
            <li className="nav-item me-lg-2">
              <select
                className="form-select form-select-sm lang-select"
                value={lang}
                onChange={(e) => setLang(e.target.value as typeof lang)}
                aria-label="Language"
              >
                {LANGS.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.code.toUpperCase()}
                  </option>
                ))}
              </select>
            </li>
            {user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">
                    <span className="chip">👤 {user.nickname}</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-secondary btn-sm ms-lg-2" onClick={handleLogout}>
                    {t('nav.logout')}
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/register">
                    {t('nav.register')}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-success btn-sm ms-lg-2" to="/login">
                    {t('nav.login')}
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

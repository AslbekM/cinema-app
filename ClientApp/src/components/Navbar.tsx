import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../i18n'
import SettingsMenu from './SettingsMenu'

export default function Navbar() {
  const { user } = useAuth()
  const { t } = useI18n()

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
            {!user && (
              <li className="nav-item">
                <Link className="btn btn-success btn-sm me-lg-2" to="/login">
                  {t('nav.login')}
                </Link>
              </li>
            )}
            <li className="nav-item">
              <SettingsMenu />
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

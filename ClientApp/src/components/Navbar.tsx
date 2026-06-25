import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../i18n'
import SettingsMenu from './SettingsMenu'

export default function Navbar() {
  const { user } = useAuth()
  const { t } = useI18n()

  return (
    <nav className="navbar navbar-expand navbar-dark">
      <div className="container flex-nowrap">
        <Link className="navbar-brand" to="/">
          <span className="brand-mark">🎬</span>
          <span className="brand-text d-none d-sm-inline">adafcinema</span>
        </Link>

        <ul className="navbar-nav flex-row me-auto">
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
        </ul>

        <div className="d-flex align-items-center gap-2">
          {!user && (
            <Link className="btn btn-success btn-sm" to="/login">
              {t('nav.login')}
            </Link>
          )}
          <SettingsMenu />
        </div>
      </div>
    </nav>
  )
}

import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useI18n, LANGS } from '../i18n'

export default function SettingsMenu() {
  const { user, logout } = useAuth()
  const { t, lang, setLang } = useI18n()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const [theme, setTheme] = useState<'dark' | 'light'>(
    () => (localStorage.getItem('theme') as 'dark' | 'light') || 'dark'
  )
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const close = () => setOpen(false)
  const handleLogout = async () => {
    close()
    try {
      await logout()
    } finally {
      navigate('/login')
    }
  }

  return (
    <div className="settings-menu" ref={ref}>
      <button
        className="btn btn-outline-secondary btn-sm"
        onClick={() => setOpen((o) => !o)}
        aria-label={t('settings.title')}
        title={t('settings.title')}
      >
        ⚙️
      </button>

      {open && (
        <div className="settings-panel">
          <div className="settings-head">
            <span className="settings-avatar">{user ? '👤' : '🎬'}</span>
            <div>
              <div style={{ fontWeight: 600 }}>{user ? user.nickname : t('settings.guest')}</div>
              {user?.email && <div className="text-muted" style={{ fontSize: '0.78rem' }}>{user.email}</div>}
            </div>
          </div>

          <div className="settings-section-label">{t('settings.appearance')}</div>
          <div className="settings-segment">
            <button className={theme === 'dark' ? 'active' : ''} onClick={() => setTheme('dark')}>
              🌙 {t('settings.dark')}
            </button>
            <button className={theme === 'light' ? 'active' : ''} onClick={() => setTheme('light')}>
              ☀️ {t('settings.light')}
            </button>
          </div>

          <div className="settings-section-label">{t('settings.language')}</div>
          <div className="settings-segment">
            {LANGS.map((l) => (
              <button key={l.code} className={lang === l.code ? 'active' : ''} onClick={() => setLang(l.code)}>
                {l.flag} {l.code.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="settings-divider" />

          {user && (
            <Link className="settings-item" to="/profile" onClick={close}>
              👤 {t('settings.profile')}
            </Link>
          )}
          <Link className="settings-item" to="/support" onClick={close}>
            💬 {t('settings.support')}
          </Link>
          <Link className="settings-item" to="/feedback" onClick={close}>
            ⭐ {t('settings.feedback')}
          </Link>

          {user ? (
            <button className="settings-item" onClick={handleLogout}>
              🚪 {t('settings.logout')}
            </button>
          ) : (
            <>
              <div className="settings-divider" />
              <Link className="settings-item" to="/login" onClick={close}>
                🔑 {t('nav.login')}
              </Link>
              <Link className="settings-item" to="/register" onClick={close}>
                ✍️ {t('nav.register')}
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}

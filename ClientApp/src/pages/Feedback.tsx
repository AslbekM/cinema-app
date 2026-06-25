import { useState } from 'react'
import { useI18n } from '../i18n'

export default function Feedback() {
  const { t } = useI18n()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    // Demo only — feedback is acknowledged locally, not sent anywhere.
    setSent(true)
  }

  if (sent)
    return (
      <div className="auth-shell">
        <div className="auth-card text-center">
          <div className="auth-icon">⭐</div>
          <h2>{t('feedback.thanks')}</h2>
          <p className="auth-sub mb-0">{t('feedback.thanksSub')}</p>
        </div>
      </div>
    )

  return (
    <div className="row justify-content-center">
      <div className="col-md-7">
        <div className="section-head">
          <div>
            <h2>{t('feedback.title')}</h2>
            <div className="section-sub">{t('feedback.sub')}</div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <form onSubmit={submit}>
              <label className="form-label">{t('feedback.rating')}</label>
              <div className="mb-3" style={{ fontSize: '2rem', cursor: 'pointer' }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    style={{ filter: (hover || rating) >= n ? 'none' : 'grayscale(1) opacity(0.4)' }}
                  >
                    ⭐
                  </span>
                ))}
              </div>

              <div className="mb-3">
                <label className="form-label">
                  {t('feedback.name')} <span className="text-muted">{t('feedback.optional')}</span>
                </label>
                <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="mb-3">
                <label className="form-label">{t('feedback.message')}</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder={t('feedback.placeholder')}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-success">
                {t('feedback.submit')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

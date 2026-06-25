import { useI18n } from '../i18n'
import Reveal from '../components/Reveal'

export default function Support() {
  const { t } = useI18n()

  const faqs = [
    { q: t('support.q1'), a: t('support.a1') },
    { q: t('support.q2'), a: t('support.a2') },
    { q: t('support.q3'), a: t('support.a3') },
  ]

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="section-head">
          <div>
            <h2>{t('support.title')}</h2>
            <div className="section-sub">{t('support.sub')}</div>
          </div>
        </div>

        <Reveal>
          <div className="card mb-4">
            <div className="card-body">
              <h4 className="mb-3" style={{ fontWeight: 600 }}>
                {t('support.contact')}
              </h4>
              <div className="d-flex flex-wrap gap-2">
                <span className="chip">📧 {t('support.email')}: support@adafcinema.app</span>
                <span className="chip">📞 {t('support.phone')}: +48 500 123 456</span>
                <span className="chip">🕑 {t('support.hours')}: {t('support.hoursVal')}</span>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <h4 className="mb-3" style={{ fontWeight: 600 }}>
            {t('support.faq')}
          </h4>
          <div className="d-flex flex-column gap-2">
            {faqs.map((f, i) => (
              <div key={i} className="card">
                <div className="card-body">
                  <div style={{ fontWeight: 600, marginBottom: '0.3rem' }}>{f.q}</div>
                  <div className="text-muted" style={{ fontSize: '0.92rem' }}>
                    {f.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  )
}

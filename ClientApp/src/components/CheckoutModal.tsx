import { useState, useEffect } from 'react'
import { useI18n } from '../i18n'

interface Props {
  seatLabels: string[]
  seatTotal: number
  currency: string
  filmTitle: string
  /** ISO time the seat hold expires; the modal closes itself when it elapses. */
  expiresAt?: string | null
  /** Performs the actual booking after "payment". Returns an error string on failure. */
  onConfirm: () => Promise<string | null>
  onClose: () => void
}

type Stage = 'form' | 'processing' | 'success' | 'error'

const onlyDigits = (s: string) => s.replace(/\D/g, '')

const CONCESSIONS = [
  { id: 'popcorn', labelKey: 'con.popcorn', emoji: '🍿', price: 18 },
  { id: 'drink', labelKey: 'con.drink', emoji: '🥤', price: 10 },
  { id: 'combo', labelKey: 'con.combo', emoji: '🍿🥤', price: 25 },
  { id: 'nachos', labelKey: 'con.nachos', emoji: '🧀', price: 15 },
]

export default function CheckoutModal({
  seatLabels,
  seatTotal,
  currency,
  filmTitle,
  expiresAt,
  onConfirm,
  onClose,
}: Props) {
  const { t } = useI18n()
  const [stage, setStage] = useState<Stage>('form')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [remaining, setRemaining] = useState<number>(() =>
    expiresAt ? Math.max(0, Math.floor((+new Date(expiresAt) - Date.now()) / 1000)) : 0
  )

  // Seat-hold countdown — auto-close when it runs out (unless already paid).
  useEffect(() => {
    if (!expiresAt) return
    const tick = () => {
      const left = Math.max(0, Math.floor((+new Date(expiresAt) - Date.now()) / 1000))
      setRemaining(left)
      if (left <= 0) {
        setStage((s) => {
          if (s === 'form' || s === 'error') onClose()
          return s
        })
      }
    }
    tick()
    const interval = window.setInterval(tick, 1000)
    return () => window.clearInterval(interval)
  }, [expiresAt, onClose])

  const mmss = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`

  const [number, setNumber] = useState('')
  const [name, setName] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [touched, setTouched] = useState(false)
  const [qty, setQty] = useState<Record<string, number>>({})

  const concessionsTotal = CONCESSIONS.reduce((sum, c) => sum + (qty[c.id] ?? 0) * c.price, 0)
  const total = seatTotal + concessionsTotal

  const numberClean = onlyDigits(number)
  const expiryValid = /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)
  const valid =
    numberClean.length === 16 && name.trim().length >= 2 && expiryValid && onlyDigits(cvc).length >= 3

  const formatNumber = (v: string) => onlyDigits(v).slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  const formatExpiry = (v: string) => {
    const d = onlyDigits(v).slice(0, 4)
    return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
  }
  const setItemQty = (id: string, delta: number) =>
    setQty((q) => ({ ...q, [id]: Math.max(0, (q[id] ?? 0) + delta) }))

  const handlePay = async () => {
    setTouched(true)
    if (!valid) return
    setStage('processing')
    await new Promise((r) => setTimeout(r, 1700))
    const err = await onConfirm()
    if (err) {
      setErrorMsg(err)
      setStage('error')
    } else {
      setStage('success')
    }
  }

  return (
    <div className="modal-overlay" onClick={stage === 'processing' ? undefined : onClose}>
      <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
        {stage === 'success' ? (
          <div className="pay-success">
            <div className="check">✓</div>
            <h3>{t('co.success')}</h3>
            <p className="text-muted">
              {t('co.successSub')} <strong>{filmTitle}</strong> {t('co.areBooked')}
            </p>
            <div className="d-flex flex-wrap gap-2 justify-content-center my-3">
              {seatLabels.map((s) => (
                <span key={s} className="chip">🎟️ {s}</span>
              ))}
            </div>
            <div className="mb-3" style={{ fontWeight: 600 }}>
              {t('co.paid')}: {total} {currency}
            </div>
            <button className="btn btn-success w-100" onClick={onClose}>
              {t('co.done')}
            </button>
          </div>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center">
              <h3 className="mb-0">{t('co.checkout')}</h3>
              {expiresAt && (
                <span
                  className="chip"
                  style={{ color: remaining <= 30 ? 'var(--destructive)' : undefined }}
                  title="Your seats are held until the timer runs out"
                >
                  ⏳ {mmss}
                </span>
              )}
            </div>
            <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
              {seatLabels.length} {seatLabels.length === 1 ? t('co.seatFor') : t('co.seatsFor')}{' '}
              <strong>{filmTitle}</strong>
            </p>

            {/* Concessions */}
            <div className="mb-3">
              <label className="form-label">{t('co.addSnacks')}</label>
              <div className="d-flex flex-column gap-2">
                {CONCESSIONS.map((c) => (
                  <div
                    key={c.id}
                    className="d-flex align-items-center gap-2"
                    style={{ fontSize: '0.92rem' }}
                  >
                    <span style={{ width: 30 }}>{c.emoji}</span>
                    <span className="flex-grow-1">{t(c.labelKey)}</span>
                    <span className="text-muted">{c.price} {currency}</span>
                    <button className="btn btn-outline-secondary btn-sm py-0 px-2" onClick={() => setItemQty(c.id, -1)}>
                      −
                    </button>
                    <span style={{ minWidth: 18, textAlign: 'center' }}>{qty[c.id] ?? 0}</span>
                    <button className="btn btn-outline-secondary btn-sm py-0 px-2" onClick={() => setItemQty(c.id, 1)}>
                      +
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Card preview */}
            <div className="credit-card">
              <span className="cc-brand">VISA</span>
              <div className="cc-chip" />
              <div className="cc-number">{number || '•••• •••• •••• ••••'}</div>
              <div className="cc-row">
                <div>
                  <span className="cc-label">Card holder</span>
                  {name || 'YOUR NAME'}
                </div>
                <div>
                  <span className="cc-label">Expires</span>
                  {expiry || 'MM/YY'}
                </div>
              </div>
            </div>

            <div className="mb-2">
              <label className="form-label">{t('co.cardNumber')}</label>
              <input
                className="form-control"
                inputMode="numeric"
                placeholder="4242 4242 4242 4242"
                value={number}
                onChange={(e) => setNumber(formatNumber(e.target.value))}
              />
            </div>
            <div className="mb-2">
              <label className="form-label">{t('co.cardHolder')}</label>
              <input
                className="form-control"
                placeholder="Jan Kowalski"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="row g-2 mb-3">
              <div className="col">
                <label className="form-label">{t('co.expiry')}</label>
                <input
                  className="form-control"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                />
              </div>
              <div className="col">
                <label className="form-label">{t('co.cvc')}</label>
                <input
                  className="form-control"
                  inputMode="numeric"
                  placeholder="123"
                  value={cvc}
                  onChange={(e) => setCvc(onlyDigits(e.target.value).slice(0, 4))}
                />
              </div>
            </div>

            {/* Totals breakdown */}
            <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.88rem' }}>
              <span>{t('co.seats')}</span>
              <span>{seatTotal} {currency}</span>
            </div>
            {concessionsTotal > 0 && (
              <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.88rem' }}>
                <span>{t('co.snacks')}</span>
                <span>{concessionsTotal} {currency}</span>
              </div>
            )}
            <div className="d-flex justify-content-between mb-3" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
              <span>{t('co.total')}</span>
              <span>{total} {currency}</span>
            </div>

            {touched && !valid && <div className="alert alert-danger py-2">{t('co.invalid')}</div>}
            {stage === 'error' && <div className="alert alert-danger py-2">{errorMsg}</div>}

            <button className="btn btn-success w-100" onClick={handlePay} disabled={stage === 'processing'}>
              {stage === 'processing' ? t('co.processing') : `${t('co.pay')} ${total} ${currency}`}
            </button>
            <button className="btn btn-link w-100 mt-1" onClick={onClose} disabled={stage === 'processing'}>
              {t('common.cancel')}
            </button>
            <p className="text-muted text-center mt-2 mb-0" style={{ fontSize: '0.74rem' }}>
              🔒 {t('co.demo')}
            </p>
          </>
        )}
      </div>
    </div>
  )
}

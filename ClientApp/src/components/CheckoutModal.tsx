import { useState } from 'react'

interface Props {
  seatLabels: string[]
  seatTotal: number
  currency: string
  filmTitle: string
  /** Performs the actual booking after "payment". Returns an error string on failure. */
  onConfirm: () => Promise<string | null>
  onClose: () => void
}

type Stage = 'form' | 'processing' | 'success' | 'error'

const onlyDigits = (s: string) => s.replace(/\D/g, '')

const CONCESSIONS = [
  { id: 'popcorn', label: 'Popcorn (Large)', emoji: '🍿', price: 18 },
  { id: 'drink', label: 'Soft Drink', emoji: '🥤', price: 10 },
  { id: 'combo', label: 'Popcorn + Drink Combo', emoji: '🍿🥤', price: 25 },
  { id: 'nachos', label: 'Nachos', emoji: '🧀', price: 15 },
]

export default function CheckoutModal({
  seatLabels,
  seatTotal,
  currency,
  filmTitle,
  onConfirm,
  onClose,
}: Props) {
  const [stage, setStage] = useState<Stage>('form')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

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
            <h3>Payment successful</h3>
            <p className="text-muted">
              Your seats for <strong>{filmTitle}</strong> are booked.
            </p>
            <div className="d-flex flex-wrap gap-2 justify-content-center my-3">
              {seatLabels.map((s) => (
                <span key={s} className="chip">🎟️ {s}</span>
              ))}
            </div>
            <div className="mb-3" style={{ fontWeight: 600 }}>
              Paid: {total} {currency}
            </div>
            <button className="btn btn-success w-100" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <>
            <h3>Checkout</h3>
            <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
              {seatLabels.length} seat{seatLabels.length === 1 ? '' : 's'} for <strong>{filmTitle}</strong>
            </p>

            {/* Concessions */}
            <div className="mb-3">
              <label className="form-label">Add snacks &amp; drinks</label>
              <div className="d-flex flex-column gap-2">
                {CONCESSIONS.map((c) => (
                  <div
                    key={c.id}
                    className="d-flex align-items-center gap-2"
                    style={{ fontSize: '0.92rem' }}
                  >
                    <span style={{ width: 30 }}>{c.emoji}</span>
                    <span className="flex-grow-1">{c.label}</span>
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
              <label className="form-label">Card number</label>
              <input
                className="form-control"
                inputMode="numeric"
                placeholder="4242 4242 4242 4242"
                value={number}
                onChange={(e) => setNumber(formatNumber(e.target.value))}
              />
            </div>
            <div className="mb-2">
              <label className="form-label">Card holder name</label>
              <input
                className="form-control"
                placeholder="Jan Kowalski"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="row g-2 mb-3">
              <div className="col">
                <label className="form-label">Expiry</label>
                <input
                  className="form-control"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                />
              </div>
              <div className="col">
                <label className="form-label">CVC</label>
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
              <span>Seats</span>
              <span>{seatTotal} {currency}</span>
            </div>
            {concessionsTotal > 0 && (
              <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.88rem' }}>
                <span>Snacks</span>
                <span>{concessionsTotal} {currency}</span>
              </div>
            )}
            <div className="d-flex justify-content-between mb-3" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
              <span>Total</span>
              <span>{total} {currency}</span>
            </div>

            {touched && !valid && (
              <div className="alert alert-danger py-2">Please fill in valid card details.</div>
            )}
            {stage === 'error' && <div className="alert alert-danger py-2">{errorMsg}</div>}

            <button className="btn btn-success w-100" onClick={handlePay} disabled={stage === 'processing'}>
              {stage === 'processing' ? 'Processing payment…' : `Pay ${total} ${currency}`}
            </button>
            <button className="btn btn-link w-100 mt-1" onClick={onClose} disabled={stage === 'processing'}>
              Cancel
            </button>
            <p className="text-muted text-center mt-2 mb-0" style={{ fontSize: '0.74rem' }}>
              🔒 Demo checkout — no real payment is processed. Use any test card number.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

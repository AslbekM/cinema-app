import { useState } from 'react'

interface Props {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  autoComplete?: string
  minLength?: number
}

export default function PasswordInput({ label, value, onChange, required, autoComplete, minLength }: Props) {
  const [show, setShow] = useState(false)

  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <div className="input-group">
        <input
          type={show ? 'text' : 'password'}
          className="form-control"
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          minLength={minLength}
        />
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => setShow((s) => !s)}
          tabIndex={-1}
        >
          {show ? '🙈' : '👁️'}
        </button>
      </div>
    </div>
  )
}

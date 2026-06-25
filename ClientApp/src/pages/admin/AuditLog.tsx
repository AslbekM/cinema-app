import { useState, useEffect } from 'react'
import { getAuditLog, type AuditEntry } from '../../api/admin'

export default function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAuditLog()
      .then(setEntries)
      .catch(() => setError('Failed to load audit log.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading)
    return (
      <div className="loader">
        <div className="loader-ring" />
        <span>Loading audit log…</span>
      </div>
    )
  if (error) return <div className="alert alert-danger">{error}</div>

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Audit Log</h2>
          <div className="section-sub">Recent security-relevant actions (newest first)</div>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table table-hover mb-0">
          <thead className="table-dark">
            <tr>
              <th>Time (UTC)</th>
              <th>User</th>
              <th>Action</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-muted py-4">
                  No audit entries yet.
                </td>
              </tr>
            )}
            {entries.map((e, i) => (
              <tr key={i}>
                <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                  {new Date(e.timestamp).toLocaleString()}
                </td>
                <td>{e.userName ?? '—'}</td>
                <td>
                  <span className="chip">{e.action}</span>
                </td>
                <td className="text-muted" style={{ fontSize: '0.88rem' }}>
                  {e.details ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { getAdminStats, type AdminStats } from '../../api/admin'
import Reveal from '../../components/Reveal'

const STAT_CARDS: { key: keyof AdminStats; label: string; icon: string; fmt?: (v: number) => string }[] = [
  { key: 'totalBookings', label: 'Total bookings', icon: '🎟️' },
  { key: 'revenue', label: 'Revenue', icon: '💰', fmt: (v) => `${v} zł` },
  { key: 'totalUsers', label: 'Registered users', icon: '👥' },
  { key: 'upcomingScreenings', label: 'Upcoming screenings', icon: '🎬' },
  { key: 'occupancy', label: 'Seat occupancy', icon: '📊', fmt: (v) => `${v}%` },
]

export default function Dashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch(() => setError('Failed to load dashboard.'))
  }, [])

  if (error) return <div className="alert alert-danger">{error}</div>
  if (!stats)
    return (
      <div className="loader">
        <div className="loader-ring" />
        <span>Loading dashboard…</span>
      </div>
    )

  const maxBookings = Math.max(1, ...stats.topFilms.map((f) => f.bookings))

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Dashboard</h2>
          <div className="section-sub">Overview of bookings, revenue, and activity</div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.2rem',
          marginBottom: '2.5rem',
        }}
      >
        {STAT_CARDS.map((c, i) => (
          <Reveal key={c.key} delay={i * 60}>
            <div className="card h-100">
              <div className="card-body">
                <div style={{ fontSize: '1.8rem' }}>{c.icon}</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.4rem' }}>
                  {c.fmt ? c.fmt(stats[c.key] as number) : (stats[c.key] as number)}
                </div>
                <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                  {c.label}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div className="card">
          <div className="card-body">
            <h4 className="mb-4" style={{ fontWeight: 600 }}>
              Most booked films
            </h4>
            {stats.topFilms.length === 0 ? (
              <p className="text-muted mb-0">No bookings yet.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {stats.topFilms.map((f) => (
                  <div key={f.film}>
                    <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.9rem' }}>
                      <span>{f.film}</span>
                      <span className="text-muted">{f.bookings}</span>
                    </div>
                    <div style={{ height: 10, borderRadius: 6, background: 'rgba(255,255,255,0.06)' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${(f.bookings / maxBookings) * 100}%`,
                          borderRadius: 6,
                          background: 'var(--gradient-primary)',
                          transition: 'width 0.6s ease',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Reveal>
    </div>
  )
}

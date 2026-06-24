import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'

export interface CarouselItem {
  id: number
  title: string
  img?: string
  emoji: string
  gradient: string
}

interface Props {
  items: CarouselItem[]
  /** Auto-advance interval in ms */
  interval?: number
}

/** A coverflow poster carousel that auto-advances and can be driven manually. */
export default function PosterCarousel({ items, interval = 3500 }: Props) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const timer = useRef<number>()
  const navigate = useNavigate()
  const n = items.length

  // Auto-advance (paused on hover).
  useEffect(() => {
    if (n <= 1 || paused) return
    timer.current = window.setInterval(() => setActive((a) => (a + 1) % n), interval)
    return () => window.clearInterval(timer.current)
  }, [n, paused, interval])

  if (n === 0) return null

  const go = (idx: number) => setActive(((idx % n) + n) % n)

  return (
    <div
      className="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <button className="carousel-arrow left" onClick={() => go(active - 1)} aria-label="Previous">
        ‹
      </button>

      <div className="carousel-stage">
        {items.map((it, i) => {
          let off = i - active
          if (off > n / 2) off -= n
          if (off < -n / 2) off += n
          const abs = Math.abs(off)
          const hidden = abs > 2
          const isActive = off === 0

          const style: CSSProperties = {
            transform: `translateX(${off * 160}px) scale(${isActive ? 1.06 : abs === 1 ? 0.9 : 0.78}) rotateY(${off * -9}deg)`,
            zIndex: 10 - abs,
            opacity: hidden ? 0 : isActive ? 1 : abs === 1 ? 0.92 : 0.5,
            pointerEvents: hidden ? 'none' : 'auto',
          }

          return (
            <div
              key={it.id}
              className={`carousel-card ${isActive ? 'is-active' : ''}`}
              style={style}
              onClick={() => (isActive ? navigate(`/screenings/${it.id}`) : go(i))}
              title={isActive ? `Open ${it.title}` : it.title}
            >
              {it.img ? (
                <img src={it.img} alt={it.title} loading="lazy" />
              ) : (
                <span className="poster-emoji" style={{ background: it.gradient }}>
                  {it.emoji}
                </span>
              )}
              {isActive && <div className="carousel-caption">{it.title}</div>}
            </div>
          )
        })}
      </div>

      <button className="carousel-arrow right" onClick={() => go(active + 1)} aria-label="Next">
        ›
      </button>

      <div className="carousel-dots">
        {items.map((_, i) => (
          <button
            key={i}
            className={`dot ${i === active ? 'active' : ''}`}
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

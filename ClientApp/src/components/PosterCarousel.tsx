import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
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

/** A coverflow poster carousel: auto-advances continuously and can be driven
 *  manually with arrows, dots, click, or by dragging/swiping with the mouse. */
export default function PosterCarousel({ items, interval = 3000 }: Props) {
  const [active, setActive] = useState(0)
  const navigate = useNavigate()
  const n = items.length

  const dragStartX = useRef<number | null>(null)
  const draggedRef = useRef(false)

  const go = (idx: number) => setActive(((idx % n) + n) % n)

  // Auto-advance: re-arms whenever `active` changes, so it keeps moving and
  // any manual interaction resets the countdown.
  useEffect(() => {
    if (n <= 1) return
    const t = window.setTimeout(() => setActive((a) => (a + 1) % n), interval)
    return () => window.clearTimeout(t)
  }, [active, n, interval])

  if (n === 0) return null

  const onPointerDown = (e: PointerEvent) => {
    dragStartX.current = e.clientX
    draggedRef.current = false
  }
  const onPointerMove = (e: PointerEvent) => {
    if (dragStartX.current !== null && Math.abs(e.clientX - dragStartX.current) > 6) {
      draggedRef.current = true
    }
  }
  const endDrag = (e: PointerEvent) => {
    if (dragStartX.current === null) return
    const dx = e.clientX - dragStartX.current
    dragStartX.current = null
    if (dx > 45) go(active - 1)
    else if (dx < -45) go(active + 1)
  }

  return (
    <div className="carousel">
      <button className="carousel-arrow left" onClick={() => go(active - 1)} aria-label="Previous">
        ‹
      </button>

      <div
        className="carousel-stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
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
              onClick={() => {
                if (draggedRef.current) return // ignore clicks that were really a drag
                if (isActive) navigate(`/films/${encodeURIComponent(it.title)}`)
                else go(i)
              }}
              title={isActive ? `Open ${it.title}` : it.title}
            >
              {it.img ? (
                <img src={it.img} alt={it.title} loading="lazy" draggable={false} />
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

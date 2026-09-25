import { useEffect, useRef } from 'react'

/**
 * Linha do tempo horizontal dos meses da agenda.
 *
 * Cada mes vira um marco na trilha: a bolinha cresce com o numero de eventos e
 * os meses vazios ficam apagados, para dar no olho onde a agenda respira.
 */
export default function MonthTimeline({ months, activeKey, selectable, onSelect }) {
  const trackRef = useRef(null)
  const activeRef = useRef(null)

  useEffect(() => {
    const node = activeRef.current
    const track = trackRef.current
    if (!node || !track) return
    // Centraliza o mes ativo sem arrastar a pagina inteira junto.
    track.scrollTo({
      left: node.offsetLeft - track.clientWidth / 2 + node.clientWidth / 2,
      behavior: 'smooth'
    })
  }, [activeKey])

  if (!months.length) return null

  return (
    <div className="timeline" role="group" aria-label="Linha do tempo dos meses">
      <div className="timeline-track" ref={trackRef}>
        <span className="timeline-rail" aria-hidden="true" />
        {months.map((month) => {
          const isActive = month.key === activeKey
          const canJump = selectable.has(month.key)
          return (
            <button
              key={month.key}
              ref={isActive ? activeRef : null}
              className="timeline-month"
              data-active={isActive}
              data-empty={month.count === 0}
              data-past={month.isPast}
              data-current={month.isCurrent}
              disabled={!canJump}
              aria-current={isActive ? 'true' : undefined}
              aria-label={
                month.count === 0
                  ? `${month.long} de ${month.year}, sem eventos`
                  : `${month.long} de ${month.year}, ${month.count} evento${month.count > 1 ? 's' : ''}` +
                    (month.isPast ? ', ja aconteceu' : '')
              }
              onClick={() => onSelect(month.key)}
            >
              <span className="timeline-count">{month.count || ''}</span>
              <span className="timeline-dot" aria-hidden="true" />
              <span className="timeline-label">{month.short}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

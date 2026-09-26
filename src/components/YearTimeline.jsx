import { useEffect, useRef, useState } from 'react'
import { styleFor } from '../lib/categories.js'
import EventCard from './EventCard.jsx'

const plural = (n) => `${n} evento${n > 1 ? 's' : ''}`

/** O ano so aparece quando nao e o corrente, senao vira ruido em toda linha. */
const monthTitle = (month, thisYear) =>
  month.year === thisYear ? month.long : `${month.long} ${month.year}`

/** Resumo do mes: o que ainda vem, o que ja passou ou o silencio. */
function summary(month, shown) {
  if (shown) return plural(shown)
  if (month.count) return `${plural(month.count)} - ja passou`
  return month.isPast ? 'sem eventos' : 'agenda livre'
}

/**
 * Linha do tempo vertical do ano: uma trilha na lateral esquerda com um marco
 * por mes e os cards pendurados nela.
 *
 * Os meses vazios aparecem como um respiro na trilha - ver onde o ano aperta e
 * onde ele abre e justamente o que ajuda a se programar. Os meses ja vencidos
 * viram um unico marco no topo, para nao gastar a primeira tela com passado.
 *
 * O mes que esta no centro da tela fica em evidencia e os outros encolhem. O
 * encolhimento e so transform e opacidade: nada de mudar altura durante a
 * rolagem, senao a pagina briga com o dedo do usuario.
 */
export default function YearTimeline({ months, eventsByMonth, savedIds, featuredId, onOpen }) {
  const [focused, setFocused] = useState(null)
  const thisYear = new Date().getFullYear()
  const sectionRefs = useRef({})

  useEffect(() => {
    let frame = 0

    // Fica em evidencia o mes que ocupa o centro da tela - nao o que comeca
    // ali. Senao um mes vazio rouba o foco do mes cujo card esta a vista.
    const pick = () => {
      frame = 0
      const middle = window.innerHeight / 2
      let winner = null
      for (const [key, node] of Object.entries(sectionRefs.current)) {
        if (!node) continue
        const { top, bottom } = node.getBoundingClientRect()
        if (top <= middle && bottom > 0) winner = key
        else if (top > middle && !winner) { winner = key; break }
      }
      if (winner) setFocused(winner)
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(pick)
    }

    pick()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [months, eventsByMonth])

  if (!months.length) return null

  const past = months.filter((month) => month.isPast)
  const ahead = months.filter((month) => !month.isPast)
  const pastCount = past.reduce((total, month) => total + month.count, 0)

  return (
    <div className="year">
      <span className="year-rail" aria-hidden="true" />

      {past.length ? (
        <section className="year-month" data-past="true" data-empty="true">
          <header className="year-head">
            <span className="year-marker" aria-hidden="true">
              {past.length > 1 ? `${past[0].short}-${past[past.length - 1].short}` : past[0].short}
            </span>
            <span className="year-head-text">
              <strong>
                {past.length > 1
                  ? `${past[0].long} a ${monthTitle(past[past.length - 1], thisYear)}`
                  : monthTitle(past[0], thisYear)}
              </strong>
              <small>{pastCount ? `${plural(pastCount)} ja aconteceram` : 'sem eventos'}</small>
            </span>
          </header>
          <div className="year-gap" />
        </section>
      ) : null}

      {ahead.map((month) => {
        const events = eventsByMonth[month.key] || []
        return (
          <section
            key={month.key}
            className="year-month"
            ref={(node) => { sectionRefs.current[month.key] = node }}
            data-month={month.key}
            data-focus={focused === month.key}
            data-current={month.isCurrent}
            data-empty={events.length === 0}
          >
            <header className="year-head">
              <span className="year-marker" aria-hidden="true">{month.short}</span>
              <span className="year-head-text">
                <strong>{monthTitle(month, thisYear)}</strong>
                <small>{summary(month, events.length)}</small>
              </span>
            </header>

            {events.length ? (
              events.map((event) => (
                <div className="year-item" key={event.id}>
                  <span
                    className="year-dot"
                    aria-hidden="true"
                    style={{ '--dot': styleFor(event).c2 }}
                  />
                  <EventCard
                    event={event}
                    saved={savedIds.has(event.id)}
                    featured={event.id === featuredId}
                    onOpen={onOpen}
                  />
                </div>
              ))
            ) : (
              <div className="year-gap" />
            )}
          </section>
        )
      })}

      <span className="year-end" aria-hidden="true" />
    </div>
  )
}

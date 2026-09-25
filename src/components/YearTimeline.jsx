import { CATEGORY_STYLE } from '../lib/categories.js'
import EventCard from './EventCard.jsx'

const plural = (n) => `${n} evento${n > 1 ? 's' : ''}`

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
 */
export default function YearTimeline({ months, eventsByMonth, savedIds, onOpen }) {
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
                  ? `${past[0].long} a ${past[past.length - 1].long}`
                  : past[0].long}
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
            data-month={month.key}
            data-current={month.isCurrent}
            data-empty={events.length === 0}
          >
            <header className="year-head">
              <span className="year-marker" aria-hidden="true">{month.short}</span>
              <span className="year-head-text">
                <strong>{month.long}</strong>
                <small>{summary(month, events.length)}</small>
              </span>
            </header>

            {events.length ? (
              events.map((event) => (
                <div className="year-item" key={event.id}>
                  <span
                    className="year-dot"
                    aria-hidden="true"
                    style={{ '--dot': (CATEGORY_STYLE[event.category] || CATEGORY_STYLE.default).c2 }}
                  />
                  <EventCard event={event} saved={savedIds.has(event.id)} onOpen={onOpen} />
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

import { dayOfMonth, monthShort } from '../lib/dates.js'
import { coverFor, styleFor } from '../lib/categories.js'

/**
 * Card do evento: a foto e o card inteiro.
 *
 * Duas alturas. O evento mais proximo da data vem como `featured` e ocupa o
 * dobro; todo o resto fica em 72 px, para caber muita coisa na tela. Dentro
 * do card so entram dia e titulo - o resto vive no detalhe do evento.
 */
export default function EventCard({ event, saved, featured = false, onOpen }) {
  const style = styleFor(event)
  return (
    <button
      className="event-card"
      data-featured={featured}
      style={{ '--c1': style.c1, '--c2': style.c2 }}
      onClick={() => onOpen(event)}
    >
      <img className="event-img" src={coverFor(event)} alt="" loading="lazy" decoding="async" />
      <span className="event-shade" aria-hidden="true" />

      {saved ? <span className="event-saved" aria-label="Na sua carteira" /> : null}

      <span className="event-foot">
        <span className="event-date">
          {dayOfMonth(event.start)} {monthShort(event.start).toUpperCase()}
        </span>
        <strong>{event.title}</strong>
      </span>
    </button>
  )
}

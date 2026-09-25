import { dayOfMonth, monthShort } from '../lib/dates.js'
import { CATEGORY_STYLE } from '../lib/categories.js'

/**
 * Card compacto e visual: a capa e o card inteiro.
 *
 * Fica so o essencial para bater o olho e decidir - dia, titulo e lugar. O
 * resto (ministerio, contagem regressiva, preco) vive no detalhe do evento.
 */
export default function EventCard({ event, saved, onOpen }) {
  const style = CATEGORY_STYLE[event.category] || CATEGORY_STYLE.default
  return (
    <button
      className="event-card"
      style={{ '--c1': style.c1, '--c2': style.c2 }}
      onClick={() => onOpen(event)}
    >
      <span className="event-shade" aria-hidden="true" />

      <span className="event-top">
        <span className="event-icon" aria-hidden="true">{style.icon}</span>
        <span className="event-date">
          <strong>{dayOfMonth(event.start)}</strong>
          <small>{monthShort(event.start)}</small>
        </span>
        {saved ? <span className="event-saved" aria-label="Na sua carteira" /> : null}
      </span>

      <span className="event-foot">
        <strong>{event.title}</strong>
        <small>{event.location}</small>
      </span>
    </button>
  )
}

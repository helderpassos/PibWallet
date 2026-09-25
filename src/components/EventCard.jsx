import { dayOfMonth, monthLong, timeLabel, countdownLabel } from '../lib/dates.js'
import { CATEGORY_STYLE } from '../lib/categories.js'

export default function EventCard({ event, saved, onOpen }) {
  const style = CATEGORY_STYLE[event.category] || CATEGORY_STYLE.default
  return (
    <button className="event-card" onClick={() => onOpen(event)}>
      <header>
        <span className="chip" aria-hidden="true">{style.icon}</span>
        <span className="who">
          <p>{event.ministry}</p>
          <small>{saved ? 'Na sua carteira' : countdownLabel(event.start)}</small>
        </span>
        <span className="pill ghost">{saved ? 'Salvo' : 'Ver'}</span>
      </header>
      <div className="event-body">
        <h3>{event.title}</h3>
        <span className="when">
          <strong>{dayOfMonth(event.start)}</strong>
          <small>{monthLong(event.start)}.</small>
          <small>{timeLabel(event.start)}</small>
        </span>
      </div>
      <div className="event-cover" style={{ '--c1': style.c1, '--c2': style.c2 }}>
        {event.location}
      </div>
    </button>
  )
}

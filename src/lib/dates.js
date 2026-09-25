const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const MONTHS_LONG = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]
const DAY = 24 * 60 * 60 * 1000

export const toDate = (value) => (value instanceof Date ? value : new Date(value))

export const monthShort = (value) => MONTHS[toDate(value).getMonth()]
export const monthLong = (value) => MONTHS_LONG[toDate(value).getMonth()]
export const dayOfMonth = (value) => toDate(value).getDate()

export function timeLabel(value) {
  const d = toDate(value)
  const h = d.getHours()
  const m = d.getMinutes()
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`
}

export function rangeLabel(start, end) {
  const s = toDate(start)
  const e = toDate(end)
  const sameDay = s.toDateString() === e.toDateString()
  if (sameDay) return `${dayOfMonth(s)} de ${monthLong(s)}, ${timeLabel(s)}`
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()
  if (sameMonth) return `${dayOfMonth(s)} a ${dayOfMonth(e)} de ${monthLong(s)}`
  return `${dayOfMonth(s)} de ${monthShort(s)} a ${dayOfMonth(e)} de ${monthShort(e)}`
}

/** Dias inteiros entre hoje e a data (negativo quando ja passou). */
export function daysUntil(value, now = new Date()) {
  const target = toDate(value)
  const a = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate())
  const b = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((a - b) / DAY)
}

export function countdownLabel(value, now = new Date()) {
  const days = daysUntil(value, now)
  if (days < 0) return 'Ja aconteceu'
  if (days === 0) return 'E hoje'
  if (days === 1) return 'E amanha'
  if (days < 30) return `Faltam ${days} dias`
  const months = Math.round(days / 30)
  return months === 1 ? 'Falta cerca de 1 mes' : `Faltam cerca de ${months} meses`
}

/** Agrupa eventos por mes preservando a ordem cronologica. */
export function groupByMonth(events) {
  const groups = new Map()
  for (const event of events) {
    const d = toDate(event.start)
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
    if (!groups.has(key)) {
      groups.set(key, { key, label: `${monthLong(d)} ${d.getFullYear()}`, events: [] })
    }
    groups.get(key).events.push(event)
  }
  return [...groups.values()]
}

export const byStart = (a, b) => toDate(a.start) - toDate(b.start)
export const isUpcoming = (event, now = new Date()) => toDate(event.end || event.start) >= now

export const monthKey = (value) => {
  const d = toDate(value)
  return `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
}

/**
 * Linha do tempo continua do primeiro ao ultimo evento.
 *
 * Inclui os meses vazios de proposito: o buraco entre um evento e outro e
 * informacao util para quem esta se programando.
 */
export function buildMonthTimeline(events, now = new Date()) {
  if (!events.length) return []

  const counts = new Map()
  for (const event of events) {
    const key = monthKey(event.start)
    counts.set(key, (counts.get(key) || 0) + 1)
  }

  const first = toDate(events[0].start)
  const last = toDate(events[events.length - 1].start)
  const cursor = new Date(first.getFullYear(), first.getMonth(), 1)
  const end = new Date(last.getFullYear(), last.getMonth(), 1)
  const currentKey = monthKey(now)

  const months = []
  while (cursor <= end) {
    const key = monthKey(cursor)
    months.push({
      key,
      short: monthShort(cursor),
      long: monthLong(cursor),
      year: cursor.getFullYear(),
      count: counts.get(key) || 0,
      isCurrent: key === currentKey,
      isPast: key < currentKey
    })
    cursor.setMonth(cursor.getMonth() + 1)
  }
  return months
}

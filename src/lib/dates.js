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

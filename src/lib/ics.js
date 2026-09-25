/** Geracao de arquivo .ics para adicionar o evento ao calendario do celular. */

const pad = (n) => String(n).padStart(2, '0')

function toICSDate(value) {
  const d = new Date(value)
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) + 'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) + 'Z'
  )
}

const escape = (text = '') =>
  String(text).replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')

/** Quebra as linhas em 75 octetos, como pede o RFC 5545. */
function fold(line) {
  if (line.length <= 75) return line
  const parts = []
  let rest = line
  parts.push(rest.slice(0, 75))
  rest = rest.slice(75)
  while (rest.length > 74) {
    parts.push(' ' + rest.slice(0, 74))
    rest = rest.slice(74)
  }
  if (rest) parts.push(' ' + rest)
  return parts.join('\r\n')
}

export function buildICS(event, { reminderDaysBefore = [7, 1] } = {}) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PIB Wallet//PT-BR//',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@pibwallet`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(event.start)}`,
    `DTEND:${toICSDate(event.end || event.start)}`,
    `SUMMARY:${escape(event.title)}`,
    `LOCATION:${escape(event.location)}`,
    `DESCRIPTION:${escape(event.description)}`
  ]
  for (const days of reminderDaysBefore) {
    lines.push(
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `TRIGGER:-P${days}D`,
      `DESCRIPTION:${escape(`${event.title} em ${days} dia(s)`)}`,
      'END:VALARM'
    )
  }
  lines.push('END:VEVENT', 'END:VCALENDAR')
  return lines.map(fold).join('\r\n')
}

export function downloadICS(event, options) {
  const blob = new Blob([buildICS(event, options)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${event.id}.ics`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

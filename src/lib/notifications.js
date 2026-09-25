/** Lembretes locais.
 *
 * Sem servidor de push, o navegador so dispara notificacao com o app aberto.
 * Por isso a estrategia e dupla:
 *  1. o .ics leva o lembrete para o calendario nativo (funciona com o app fechado);
 *  2. as notificacoes locais avisam quem abre o app no dia. */

export const supportsNotifications = () =>
  typeof window !== 'undefined' && 'Notification' in window

export async function requestPermission() {
  if (!supportsNotifications()) return 'unsupported'
  if (Notification.permission !== 'default') return Notification.permission
  try {
    return await Notification.requestPermission()
  } catch {
    return 'denied'
  }
}

export async function notify(title, body, { tag, url = '/' } = {}) {
  if (!supportsNotifications() || Notification.permission !== 'granted') return false
  const registration = await navigator.serviceWorker?.ready.catch(() => null)
  if (registration) {
    registration.active?.postMessage({ type: 'NOTIFY', title, body, tag, url })
    return true
  }
  new Notification(title, { body, tag, icon: '/icons/icon-192.png' })
  return true
}

/** Dispara, uma vez por dia, os avisos dos eventos salvos que estao proximos. */
export async function runDueReminders(events, reminders) {
  const today = new Date().toDateString()
  const seenKey = 'pibwallet.notified.v1'
  let seen = {}
  try { seen = JSON.parse(localStorage.getItem(seenKey) || '{}') } catch { seen = {} }

  for (const event of events) {
    const config = reminders[event.id]
    if (!config?.enabled) continue
    const days = Math.round(
      (new Date(event.start).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000
    )
    if (!config.daysBefore.includes(days)) continue
    const key = `${event.id}:${days}`
    if (seen[key] === today) continue
    const when = days === 0 ? 'e hoje' : days === 1 ? 'e amanha' : `em ${days} dias`
    await notify(`${event.title} ${when}`, `${event.location} - toque para ver os detalhes`, {
      tag: key,
      url: `/?evento=${event.id}`
    })
    seen[key] = today
  }
  try { localStorage.setItem(seenKey, JSON.stringify(seen)) } catch { /* ignora */ }
}

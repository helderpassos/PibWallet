const KEY = 'pibwallet.state.v1'

const EMPTY = { saved: {}, reminders: {}, profile: { name: '' } }

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...EMPTY }
    const parsed = JSON.parse(raw)
    return { ...EMPTY, ...parsed, saved: parsed.saved || {}, reminders: parsed.reminders || {} }
  } catch {
    return { ...EMPTY }
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* modo privado / cota cheia: o app segue funcionando so nesta sessao */
  }
}

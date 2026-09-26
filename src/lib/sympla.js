/** Cliente Sympla.
 *
 * A API publica da Sympla exige o header `s_token` e devolve apenas os eventos
 * do organizador dono do token. Duas consequencias praticas:
 *
 *  - o token NAO pode ir para o bundle do PWA (qualquer pessoa leria);
 *  - a chamada nao pode sair do navegador (o dominio da API nao libera CORS).
 *
 * Por isso o app fala com um proxy proprio (`/api/sympla/events`), que guarda o
 * token no servidor. Veja `netlify/functions/sympla.mjs` e `docs/SYMPLA.md`.
 *
 * Sem proxy configurado, o app degrada para o link direto do evento no Sympla,
 * que e o caminho garantido para a compra do ingresso. */

const BASE = import.meta.env.VITE_SYMPLA_PROXY || '/api/sympla'
const CACHE_KEY = 'pibwallet.sympla.cache.v1'
const CACHE_TTL = 30 * 60 * 1000

function readCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null')
    if (cached && Date.now() - cached.at < CACHE_TTL) return cached.data
  } catch { /* cache invalido, ignora */ }
  return null
}

function writeCache(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data })) } catch { /* ignora */ }
}

/** Lista os eventos do organizador. Retorna [] quando o proxy nao existe. */
export async function fetchSymplaEvents({ force = false } = {}) {
  if (!force) {
    const cached = readCache()
    if (cached) return cached
  }
  try {
    const response = await fetch(`${BASE}/events`, { headers: { accept: 'application/json' } })
    if (!response.ok) return readCache() || []
    const payload = await response.json()
    const list = Array.isArray(payload.data) ? payload.data : []
    writeCache(list)
    return list
  } catch {
    return readCache() || []
  }
}

/** Casa um evento local com o do Sympla: por id explicito e, na falta dele, por titulo. */
export function matchSymplaEvent(event, symplaEvents) {
  if (!symplaEvents?.length) return null
  const wantedId = event.sympla?.eventId
  if (wantedId) {
    const byId = symplaEvents.find((item) => String(item.id) === String(wantedId))
    if (byId) return byId
  }
  const normalize = (text = '') =>
    text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()
  const target = normalize(event.title)
  return symplaEvents.find((item) => normalize(item.name) === target) || null
}

/** Dados de ingresso exibidos no detalhe do evento. */
export function ticketInfo(event, symplaEvent) {
  const url = symplaEvent?.url || event.sympla?.url || null
  return {
    url,
    source: symplaEvent ? 'sympla-api' : url ? 'link-fixo' : 'indisponivel',
    name: symplaEvent?.name || event.title,
    isPublished: symplaEvent ? symplaEvent.published !== false : null
  }
}

/**
 * Aparencia por categoria de evento.
 *
 * `cover` e a capa padrao, usada quando o evento nao traz uma foto propria em
 * `image` no events.json. Sao imagens geradas, pensadas para serem trocadas
 * pelas fotos reais da igreja - o campo `image` do evento tem prioridade.
 *
 * As cores continuam servindo de fundo enquanto a imagem carrega e como
 * ultimo recurso se ela faltar.
 */
export const CATEGORY_STYLE = {
  Retiro: { c1: '#12261a', c2: '#4f8f5f', cover: '/img/cover-retiro.png' },
  Conferencia: { c1: '#101a30', c2: '#4a6fa5', cover: '/img/cover-conferencia.png' },
  Juventude: { c1: '#221030', c2: '#8154a5', cover: '/img/cover-juventude.png' },
  Familia: { c1: '#2e121c', c2: '#a5546b', cover: '/img/cover-familia.png' },
  Comunidade: { c1: '#2e220e', c2: '#a58c54', cover: '/img/cover-comunidade.png' },
  Infantil: { c1: '#0e2a2c', c2: '#54a5a0', cover: '/img/cover-infantil.png' },
  Ensino: { c1: '#18181c', c2: '#6b6b6b', cover: '/img/cover-ensino.png' },
  Louvor: { c1: '#0e1c30', c2: '#5481a5', cover: '/img/cover-louvor.png' },
  Culto: { c1: '#161622', c2: '#71718c', cover: '/img/cover-culto.png' },
  default: { c1: '#1c1c1c', c2: '#6b6b6b', cover: '/img/cover-culto.png' }
}

export const styleFor = (event) => CATEGORY_STYLE[event.category] || CATEGORY_STYLE.default
export const coverFor = (event) => event.image || styleFor(event).cover

/**
 * Proxy da API da Sympla - Netlify Function v2.
 *
 * Mantem o `s_token` fora do navegador e resolve o CORS. Configure a variavel
 * de ambiente SYMPLA_TOKEN no painel do Netlify (Site settings -> Environment
 * variables), nunca no codigo nem com prefixo VITE_, que iria para o bundle.
 *
 * Rotas:
 *   GET /api/sympla/events            -> eventos do organizador
 *   GET /api/sympla/events/:id        -> um evento
 */
const SYMPLA_API = 'https://api.sympla.com.br/public/v4'

const json = (body, status, extraHeaders = {}) =>
  new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...extraHeaders }
  })

export default async (req) => {
  const token = process.env.SYMPLA_TOKEN
  if (!token) {
    return json({ error: 'SYMPLA_TOKEN nao configurado', data: [] }, 501)
  }

  if (req.method !== 'GET') {
    return json({ error: 'metodo nao suportado', data: [] }, 405)
  }

  // A funcao responde tanto em /api/sympla/* (config.path) quanto na rota
  // interna /.netlify/functions/sympla, entao os dois prefixos saem fora.
  const { pathname, search } = new URL(req.url)
  const path =
    pathname.replace(/^\/api\/sympla/, '').replace(/^\/\.netlify\/functions\/sympla/, '') || '/events'

  try {
    const upstream = await fetch(`${SYMPLA_API}${path}${search}`, {
      headers: { s_token: token, accept: 'application/json' }
    })
    return json(await upstream.text(), upstream.status, {
      // Cache curto na borda: a agenda anual muda pouco e a API tem limite de uso.
      'cache-control': 'public, max-age=0, must-revalidate',
      'netlify-cdn-cache-control': 'public, s-maxage=900, stale-while-revalidate=3600'
    })
  } catch (error) {
    return json({ error: 'falha ao consultar a Sympla', detail: String(error), data: [] }, 502)
  }
}

export const config = { path: '/api/sympla/*' }

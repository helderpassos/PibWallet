/**
 * Proxy da API da Sympla - funcao serverless no formato Vercel.
 *
 * Mantem o `s_token` fora do navegador e resolve o CORS. Configure a variavel
 * de ambiente SYMPLA_TOKEN no painel do provedor.
 *
 * A assinatura `(req, res)` e a do Vercel. Para rodar no Netlify (Functions v2)
 * ou no Cloudflare Workers, a funcao precisa ser reescrita para receber
 * `(req, context)` e devolver um `Response`.
 *
 * Rotas:
 *   GET /api/sympla/events            -> eventos do organizador
 *   GET /api/sympla/events/:id        -> um evento
 */
const SYMPLA_API = 'https://api.sympla.com.br/public/v4'

export default async function handler(req, res) {
  const token = process.env.SYMPLA_TOKEN
  if (!token) {
    res.status(501).json({ error: 'SYMPLA_TOKEN nao configurado', data: [] })
    return
  }

  const path = (req.url || '').replace(/^\/api\/sympla/, '') || '/events'

  try {
    const upstream = await fetch(`${SYMPLA_API}${path}`, {
      headers: { s_token: token, accept: 'application/json' }
    })
    const body = await upstream.text()
    res.status(upstream.status)
    res.setHeader('content-type', 'application/json; charset=utf-8')
    // Cache curto na borda: a agenda anual muda pouco e a API tem limite de uso.
    res.setHeader('cache-control', 's-maxage=900, stale-while-revalidate=3600')
    res.send(body)
  } catch (error) {
    res.status(502).json({ error: 'falha ao consultar a Sympla', detail: String(error), data: [] })
  }
}

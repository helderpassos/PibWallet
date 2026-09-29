/**
 * Teste da funcao do proxy da Sympla, com o fetch para a Sympla mockado.
 * Rode com: npm test
 */
const mod = new URL('../netlify/functions/sympla.mjs', import.meta.url).href
const pass = [], fail = []
const check = (n, ok, extra='') => (ok?pass:fail).push(n + (extra?` -> ${extra}`:''))

// 1. sem token configurado
delete process.env.SYMPLA_TOKEN
let { default: handler, config } = await import(mod + '?v=1')
let res = await handler(new Request('https://pib.app/api/sympla/events'))
check('sem token responde 501', res.status === 501, res.status)
check('sem token devolve data vazio', (await res.clone().json()).data.length === 0)
check('rota declarada em config.path', config.path === '/api/sympla/*', config.path)

// 2. com token: confere o que e enviado para a Sympla
process.env.SYMPLA_TOKEN = 'token-secreto'
let capturado = null
globalThis.fetch = async (url, init) => {
  capturado = { url, init }
  return new Response(JSON.stringify({ data: [{ id: 42, name: 'Congresso' }] }), { status: 200 })
}
;({ default: handler } = await import(mod + '?v=2'))

res = await handler(new Request('https://pib.app/api/sympla/events?page=2'))
check('chama a v4 da Sympla', capturado.url === 'https://api.sympla.com.br/public/v4/events?page=2', capturado.url)
check('manda o header s_token', capturado.init.headers.s_token === 'token-secreto')
check('responde 200', res.status === 200, res.status)
check('repassa o corpo', (await res.clone().json()).data[0].id === 42)
check('marca cache na borda', (res.headers.get('netlify-cdn-cache-control')||'').includes('s-maxage=900'))
check('nao vaza o token na resposta', !(await res.clone().text()).includes('token-secreto'))

// 3. evento por id
await handler(new Request('https://pib.app/api/sympla/events/42'))
check('rota por id', capturado.url.endsWith('/v4/events/42'), capturado.url)

// 4. rota interna do Netlify
await handler(new Request('https://pib.app/.netlify/functions/sympla/events'))
check('aceita a rota interna', capturado.url.endsWith('/v4/events'), capturado.url)

// 5. raiz cai em /events
await handler(new Request('https://pib.app/api/sympla'))
check('raiz vira /events', capturado.url.endsWith('/v4/events'), capturado.url)

// 6. metodo nao suportado
res = await handler(new Request('https://pib.app/api/sympla/events', { method: 'POST' }))
check('POST responde 405', res.status === 405, res.status)

// 7. Sympla fora do ar
globalThis.fetch = async () => { throw new Error('ECONNRESET') }
;({ default: handler } = await import(mod + '?v=3'))
res = await handler(new Request('https://pib.app/api/sympla/events'))
check('upstream caido vira 502', res.status === 502, res.status)
check('502 ainda devolve data vazio', (await res.clone().json()).data.length === 0)

console.log('=== PASSOU (' + pass.length + ') ===')
pass.forEach(t => console.log('  ok  ' + t))
if (fail.length) { console.log('\n=== FALHOU (' + fail.length + ') ==='); fail.forEach(t => console.log('  XX  ' + t)) }
process.exit(fail.length ? 1 : 0)

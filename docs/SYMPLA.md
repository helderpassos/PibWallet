# Integracao com o Sympla - viabilidade

Resumo: **e viavel, com uma ressalva importante** — a API publica da Sympla so
enxerga os eventos do proprio organizador dono do token, e nao serve para
buscar eventos de terceiros.

## O que a API oferece

- Autenticacao por chave no header `s_token`, gerada no painel do produtor
  (Minha conta -> Integracoes -> Criar chave de acesso).
- Escopo restrito: retorna **apenas** os eventos vinculados ao usuario dono do
  token. Nao existe busca publica global de eventos.
- Endpoints principais: listar eventos, obter evento por id, listar
  participantes/pedidos do evento.
- Referencia: <https://developers.sympla.com.br/api-doc/>

## Consequencias para este PWA

1. **A igreja precisa ser a organizadora** dos eventos no Sympla para a
   integracao automatica valer. Se o ingresso for de um terceiro, resta o link.
2. **O token nao pode ir para o front-end.** Um PWA e codigo publico; qualquer
   pessoa leria a chave no bundle. Por isso o token vive no servidor.
3. **CORS.** A chamada nao sai do navegador para o dominio da API; precisa de um
   intermediario do mesmo dominio do app.

Por isso o app chama `/api/sympla/events`, um proxy proprio
(`netlify/functions/sympla.mjs`) que injeta o `s_token`. Ele e uma Netlify
Function v2: recebe um `Request` e devolve um `Response`, e declara a propria
rota em `export const config = { path: '/api/sympla/*' }`.

Para Vercel ou Cloudflare Workers a logica e a mesma, muda so a casca: o Vercel
espera `(req, res)` com `res.status().json()`, e o Workers exporta um objeto com
`fetch(request, env)`.

## Degradacao sem proxy

Sem `SYMPLA_TOKEN` configurado, `src/lib/sympla.js` devolve lista vazia e o
detalhe do evento cai para o campo `sympla.url` do `src/data/events.json` — o
link direto da pagina de compra. Nada quebra, e o caminho de compra continua
funcionando. Esse e, inclusive, o unico caminho suportado para o **checkout**:
a compra acontece no site da Sympla, nao dentro do PWA.

## O que a integracao acrescenta quando ligada

- Link de compra sempre atualizado, sem alguem editar o JSON a mao.
- Saber se o evento ja foi publicado / esta com vendas abertas.
- Base para, no futuro, cruzar a lista de participantes e mostrar
  "voce ja esta inscrito" na carteira.

## Como ligar

1. Gere a chave no painel do produtor Sympla.
2. Defina `SYMPLA_TOKEN` em Site settings -> Environment variables (nunca em
   `.env` commitado, nunca com prefixo `VITE_`, que iria para o bundle).
3. Faca o deploy no Netlify. A funcao ja declara a rota `/api/sympla/*`; o
   `netlify.toml` na raiz cuida do build e do fallback de SPA.
4. Opcional: preencha `sympla.eventId` em `src/data/events.json` para casar os
   eventos por id em vez de por titulo.

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

Por isso o app chama `/api/sympla/events`, um proxy proprio (`api/sympla.js`)
que injeta o `s_token`. Ele esta escrito no formato do Vercel - assinatura
`(req, res)`. Para Netlify Functions v2 ou Cloudflare Workers, a funcao precisa
ser reescrita para `(req, context)` devolvendo um `Response`; a logica e a
mesma, muda so a casca.

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
2. Defina `SYMPLA_TOKEN` nas variaveis de ambiente do deploy (nunca em `.env`
   commitado, nunca com prefixo `VITE_`).
3. Publique `api/sympla.js` como funcao serverless em `/api/sympla/*`.
4. Opcional: preencha `sympla.eventId` em `src/data/events.json` para casar os
   eventos por id em vez de por titulo.

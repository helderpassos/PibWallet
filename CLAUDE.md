# PibWallet

## Fluxo de trabalho

- **Commite e publique direto no `main`.** O dono do repositorio pediu isso
  explicitamente: nada de branch de feature nem pull request, a menos que ele
  peca na hora.
- Antes de publicar, rode `npm run build` e `npm test`. O `npm test` cobre so o
  proxy da Sympla; a interface e verificada abrindo `npm run preview`.
- **Nada alem das funcoes dentro de `netlify/functions/`.** O Netlify empacota
  cada arquivo daquela pasta como uma funcao, entao um teste ou um utilitario
  ali derruba o deploy inteiro. Testes ficam em `tests/`.

## Visual

Linguagem inspirada no Cash App: verde saturado (`--accent`), preto puro sobre
branco, numerais gigantes, pilulas e superficies cinza-claro bem arredondadas.
Os tokens vivem no `:root` de `src/styles.css`.

Texto sobre o verde usa `--accent-ink` (verde quase preto), nunca branco:
branco sobre esse verde da 1,98:1 de contraste, ilegivel; o verde-escuro da
7,26:1.

## Projeto

PWA (React + Vite, sem framework de rotas) que funciona como carteira dos
eventos anuais da igreja. Detalhes de arquitetura, estrutura de pastas e a
integracao com a Sympla estao no `README.md` e em `docs/SYMPLA.md`.

Pontos que nao sao obvios pelo codigo:

- O arquivo `.ics` e o mecanismo principal de lembrete, nao as notificacoes.
  Sem servidor de push o navegador nao avisa com o app fechado; o calendario
  nativo avisa.
- O token da Sympla nunca pode ir para o bundle. Ele vive na Netlify Function
  em `netlify/functions/sympla.mjs`, e o app degrada para o link direto quando
  o proxy nao responde.
- O deploy e no Netlify, configurado em `netlify.toml`.
- O service worker e carimbado no build (plugin em `vite.config.js`): o nome do
  cache leva o hash do conteudo publicado e a lista de arquivos entra no
  precache. Duas armadilhas ja pagas: sem o precache dos JS/CSS de nome com
  hash, quem visita pela primeira vez e fica sem rede abre o app em branco; e o
  `caches.match` precisa de `ignoreVary`, porque os assets vem com
  `Vary: Origin` e o script de modulo do Vite manda o header `Origin`.
- A agenda e editada a mao em `src/data/events.json`.
- As capas em `public/img/cover-*.png` sao geradas, nao sao fotos. Elas entram
  no cache offline, entao qualquer imagem nova precisa ser comprimida antes de
  entrar no repositorio.
- So o evento mais proximo da data recebe o card alto (`featured`); todos os
  outros usam a altura reduzida.

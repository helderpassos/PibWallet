# PibWallet

## Fluxo de trabalho

- **Commite e publique direto no `main`.** O dono do repositorio pediu isso
  explicitamente: nada de branch de feature nem pull request, a menos que ele
  peca na hora.
- Antes de publicar, rode `npm run build` e `npm test`. O `npm test` cobre so o
  proxy da Sympla; a interface e verificada abrindo `npm run preview`.

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
- A agenda e editada a mao em `src/data/events.json`.
- As capas em `public/img/cover-*.png` sao geradas, nao sao fotos. Elas entram
  no cache offline, entao qualquer imagem nova precisa ser comprimida antes de
  entrar no repositorio.
- So o evento mais proximo da data recebe o card alto (`featured`); todos os
  outros usam a altura reduzida.

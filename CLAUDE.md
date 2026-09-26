# PibWallet

## Fluxo de trabalho

- **Commite e publique direto no `main`.** O dono do repositorio pediu isso
  explicitamente: nada de branch de feature nem pull request, a menos que ele
  peca na hora.
- Antes de publicar, rode `npm run build`. O projeto nao tem suite de testes
  automatizada; a verificacao e o build passar e o app subir em `npm run preview`.

## Projeto

PWA (React + Vite, sem framework de rotas) que funciona como carteira dos
eventos anuais da igreja. Detalhes de arquitetura, estrutura de pastas e a
integracao com a Sympla estao no `README.md` e em `docs/SYMPLA.md`.

Pontos que nao sao obvios pelo codigo:

- O arquivo `.ics` e o mecanismo principal de lembrete, nao as notificacoes.
  Sem servidor de push o navegador nao avisa com o app fechado; o calendario
  nativo avisa.
- O token da Sympla nunca pode ir para o bundle. Ele vive no proxy serverless
  em `api/sympla.js`, e o app degrada para o link direto quando o proxy nao
  existe.
- A agenda e editada a mao em `src/data/events.json`.

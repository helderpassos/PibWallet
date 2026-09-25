# PIB Wallet

PWA que funciona como carteira dos eventos anuais da igreja. O problema que ele
ataca e simples: as pessoas so ficam sabendo em cima da hora e nao conseguem se
programar. Entao o app abre com a agenda inteira do ano a vista, deixa salvar os
eventos numa carteira e empurra o lembrete para o calendario do proprio celular.

## Como resolve o "so soube em cima da hora"

| Camada | O que faz | Funciona com o app fechado? |
| --- | --- | --- |
| Agenda do ano | Linha do tempo vertical do ano com os cards pendurados nela | - |
| Carteira | Eventos salvos ficam no topo, offline | - |
| Arquivo `.ics` | Joga o evento no calendario nativo com alarme de 7 e 1 dia antes | **Sim** |
| Notificacao local | Avisa quem abre o app quando falta 30/7/1/0 dia | Nao |

O `.ics` e o caminho confiavel: sem servidor de push, o navegador nao dispara
notificacao com o app fechado. O calendario do celular dispara.

A Agenda e uma linha do tempo vertical: uma trilha na lateral esquerda com um
marco por mes e os cards do evento pendurados nela. Os meses sem nada aparecem
como um respiro na trilha - ver onde o ano aperta e onde ele abre e o que faz
alguem perceber que precisa se organizar antes. O mes atual fica verde e os
meses ja vencidos viram um unico marco no topo, para nao gastar a primeira tela
com passado.

O mes que ocupa o centro da tela entra em evidencia - marco maior, titulo maior
e card em cor cheia - enquanto os outros encolhem e desbotam. O encolhimento usa
so `transform` e opacidade: mudar altura durante a rolagem faria a pagina pular
debaixo do dedo.

## Rodando

```bash
npm install
npm run dev      # http://localhost:5173
npm run build && npm run preview
```

O service worker so entra em cena no build (`npm run preview` ou deploy).

## Estrutura

```
src/data/events.json   agenda dos proximos 12 meses (editada pela secretaria)
src/lib/dates.js       datas, agrupamento por mes, linha do tempo, contagem regressiva
src/components/YearTimeline.jsx  trilha vertical do ano
src/lib/ics.js         geracao do arquivo de calendario (RFC 5545)
src/lib/notifications.js  permissao e disparo dos lembretes locais
src/lib/sympla.js      cliente da integracao de ingressos
src/lib/storage.js     carteira e lembretes em localStorage
api/sympla.js          proxy serverless que guarda o token da Sympla
public/sw.js           cache do shell + offline
```

## Sympla

Integracao viavel, com ressalvas: a API so devolve eventos do proprio
organizador e o token nao pode ficar no navegador. O detalhe esta em
[docs/SYMPLA.md](docs/SYMPLA.md). Sem o proxy configurado, o app usa o link
direto do evento e nada quebra.

## Atualizando a agenda

Edite `src/data/events.json` e publique. Campos por evento: `id`, `title`,
`subtitle`, `category`, `ministry`, `start`, `end`, `location`, `description`,
`price`, `requiresTicket`, `tags`, `capacity` e `sympla: { eventId, url }`.
As categorias controlam icone e cor da capa em `src/lib/categories.js`.

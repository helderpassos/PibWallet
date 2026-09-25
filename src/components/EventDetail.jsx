import { useEffect, useState } from 'react'
import { rangeLabel, timeLabel, countdownLabel } from '../lib/dates.js'
import { downloadICS } from '../lib/ics.js'
import { ticketInfo, matchSymplaEvent } from '../lib/sympla.js'
import { requestPermission } from '../lib/notifications.js'

const DAY_OPTIONS = [30, 7, 1, 0]
const DAY_LABEL = { 30: '1 mes antes', 7: '1 semana antes', 1: '1 dia antes', 0: 'No dia' }

export default function EventDetail({ event, state, symplaEvents, onBack, onToggleSave, onSetReminder }) {
  const saved = Boolean(state.saved[event.id])
  const reminder = state.reminders[event.id] || { enabled: false, daysBefore: [7, 1] }
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  )

  const sympla = matchSymplaEvent(event, symplaEvents)
  const ticket = ticketInfo(event, sympla)

  useEffect(() => { window.scrollTo(0, 0) }, [event.id])

  async function enableReminders() {
    const result = await requestPermission()
    setPermission(result)
    onSetReminder(event.id, { enabled: result === 'granted', daysBefore: reminder.daysBefore })
  }

  function toggleDay(day) {
    const next = reminder.daysBefore.includes(day)
      ? reminder.daysBefore.filter((d) => d !== day)
      : [...reminder.daysBefore, day].sort((a, b) => b - a)
    onSetReminder(event.id, { ...reminder, daysBefore: next })
  }

  return (
    <>
      <button className="back" onClick={onBack}>&larr; Voltar</button>

      <div className="sheet">
        <span className="tag">{countdownLabel(event.start)}</span>
        <h2>{event.title}</h2>
        <p className="lead">{event.description}</p>

        <div className="facts">
          <div className="fact"><span className="k">Quando</span><span className="v">{rangeLabel(event.start, event.end)}</span></div>
          <div className="fact"><span className="k">Horario</span><span className="v">{timeLabel(event.start)} as {timeLabel(event.end)}</span></div>
          <div className="fact"><span className="k">Onde</span><span className="v">{event.location}</span></div>
          <div className="fact"><span className="k">Organiza</span><span className="v">{event.ministry}</span></div>
          <div className="fact"><span className="k">Valor</span><span className="v">{event.price}</span></div>
          {event.capacity ? (
            <div className="fact"><span className="k">Vagas</span><span className="v">{event.capacity}</span></div>
          ) : null}
          {event.closeRegistrationAt ? (
            <div className="fact">
              <span className="k">Inscricoes</span>
              <span className="v">ate {rangeLabel(event.closeRegistrationAt, event.closeRegistrationAt)}</span>
            </div>
          ) : null}
        </div>

        {event.tags?.length ? (
          <div className="tags">{event.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
        ) : null}
      </div>

      <div className="sheet">
        <div className="toggle-row">
          <span><strong>Salvar na carteira</strong><br /><small>Fica na aba Carteira, mesmo offline.</small></span>
          <button
            className="switch"
            data-on={saved}
            aria-label="Salvar na carteira"
            aria-pressed={saved}
            onClick={() => onToggleSave(event.id)}
          />
        </div>

        <div className="toggle-row">
          <span><strong>Lembrete no app</strong><br /><small>Aviso quando a data se aproxima.</small></span>
          <button
            className="switch"
            data-on={reminder.enabled && permission === 'granted'}
            aria-label="Lembrete no app"
            aria-pressed={reminder.enabled && permission === 'granted'}
            onClick={() =>
              reminder.enabled
                ? onSetReminder(event.id, { ...reminder, enabled: false })
                : enableReminders()
            }
          />
        </div>

        {reminder.enabled ? (
          <div className="tags">
            {DAY_OPTIONS.map((day) => (
              <button
                key={day}
                className="tag"
                style={reminder.daysBefore.includes(day) ? { background: '#19f03c', color: '#06210c' } : undefined}
                onClick={() => toggleDay(day)}
              >
                {DAY_LABEL[day]}
              </button>
            ))}
          </div>
        ) : null}

        {permission === 'denied' ? (
          <p className="notice">
            As notificacoes estao bloqueadas para este site. Libere nas configuracoes do navegador ou use o
            botao de calendario abaixo, que funciona mesmo com o app fechado.
          </p>
        ) : null}

        <div className="actions">
          <button className="pill dark" onClick={() => downloadICS(event)}>
            Adicionar ao calendario do celular
          </button>
        </div>
        <p className="notice">
          O arquivo de calendario ja vai com alarme de 7 e de 1 dia antes. E o jeito mais confiavel de nao
          esquecer, porque o aviso passa a ser do proprio celular.
        </p>
      </div>

      <div className="sheet">
        <strong>Ingresso e inscricao</strong>
        {ticket.url ? (
          <>
            <a className="pill" href={ticket.url} target="_blank" rel="noopener noreferrer">
              Garantir ingresso no Sympla
            </a>
            <p className="notice">
              {ticket.source === 'sympla-api'
                ? 'Link vindo direto da API da Sympla, atualizado a cada 30 minutos.'
                : 'Link cadastrado pela secretaria da igreja. Com o proxy da Sympla configurado, ele passa a vir da API.'}
            </p>
          </>
        ) : (
          <p className="notice">
            Este evento nao tem ingresso: e so chegar. {event.price}
          </p>
        )}
      </div>
    </>
  )
}

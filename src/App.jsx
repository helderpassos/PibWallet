import { useEffect, useMemo, useState } from 'react'
import data from './data/events.json'
import { loadState, saveState } from './lib/storage.js'
import { fetchSymplaEvents } from './lib/sympla.js'
import { runDueReminders } from './lib/notifications.js'
import {
  byStart, isUpcoming, groupByMonth, countdownLabel, daysUntil,
  dayOfMonth, monthShort, rangeLabel
} from './lib/dates.js'
import EventCard from './components/EventCard.jsx'
import EventDetail from './components/EventDetail.jsx'

const TABS = [
  { id: 'hoje', label: 'Hoje' },
  { id: 'agenda', label: 'Agenda' },
  { id: 'carteira', label: 'Carteira' }
]

export default function App() {
  const params = new URLSearchParams(window.location.search)
  const [tab, setTab] = useState(params.get('tab') || 'hoje')
  const [openId, setOpenId] = useState(params.get('evento'))
  const [state, setState] = useState(loadState)
  const [symplaEvents, setSymplaEvents] = useState([])
  const [installPrompt, setInstallPrompt] = useState(null)

  const events = useMemo(() => [...data.events].sort(byStart), [])
  const upcoming = useMemo(() => events.filter((event) => isUpcoming(event)), [events])
  const savedEvents = useMemo(
    () => upcoming.filter((event) => state.saved[event.id]),
    [upcoming, state.saved]
  )
  const openEvent = openId ? events.find((event) => event.id === openId) : null

  useEffect(() => { saveState(state) }, [state])

  useEffect(() => {
    fetchSymplaEvents().then(setSymplaEvents)
  }, [])

  useEffect(() => {
    runDueReminders(events, state.reminders)
  }, [events, state.reminders])

  useEffect(() => {
    const onPrompt = (event) => { event.preventDefault(); setInstallPrompt(event) }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  const toggleSave = (id) =>
    setState((prev) => {
      const saved = { ...prev.saved }
      if (saved[id]) delete saved[id]
      else saved[id] = { at: Date.now() }
      return { ...prev, saved }
    })

  const setReminder = (id, config) =>
    setState((prev) => ({ ...prev, reminders: { ...prev.reminders, [id]: config } }))

  const open = (event) => { setOpenId(event.id); window.scrollTo(0, 0) }

  const next = upcoming[0]
  const nextSaved = savedEvents[0]
  const soon = upcoming.filter((event) => daysUntil(event.start) <= 45)

  async function install() {
    if (!installPrompt) return
    installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(null)
  }

  return (
    <div className="app">
      {openEvent ? (
        <EventDetail
          event={openEvent}
          state={state}
          symplaEvents={symplaEvents}
          onBack={() => setOpenId(null)}
          onToggleSave={toggleSave}
          onSetReminder={setReminder}
        />
      ) : (
        <>
          <header className="topbar">
            <h1><span>Bem-vindo,</span><span>{state.profile.name || 'igreja'}.</span></h1>
            <div className="topbar-actions">
              <span className="bell" aria-label={`${savedEvents.length} eventos salvos`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
                  <path d="M10 20a2 2 0 0 0 4 0" />
                </svg>
                {savedEvents.length ? <span className="badge">{savedEvents.length}</span> : null}
              </span>
              <span className="avatar">{data.church.shortName}</span>
            </div>
          </header>

          {nextSaved ? (
            <button className="strip" onClick={() => open(nextSaved)}>
              <span className="strip-date">
                <span>
                  <strong>{dayOfMonth(nextSaved.start)}</strong>
                  <br />
                  <small>{monthShort(nextSaved.start)}</small>
                </span>
              </span>
              <span className="strip-body">
                <p>Na sua carteira.</p>
                <small>{nextSaved.title}</small>
              </span>
              <span className="pill">{countdownLabel(nextSaved.start)}</span>
            </button>
          ) : null}

          {tab === 'hoje' ? (
            <>
              {next ? (
                <button className="hero" onClick={() => open(next)}>
                  <span className="hero-head">
                    <span className="hero-logo">{data.church.shortName}</span>
                    <span>
                      <p>{data.church.name}</p>
                      <small>Proximo da agenda</small>
                    </span>
                  </span>
                  <h2>{next.title}.</h2>
                  <span className="hero-meta">
                    <span>Quando: <b>{rangeLabel(next.start, next.end)}</b></span>
                    <span>Onde: <b>{next.location}</b></span>
                    <span>{countdownLabel(next.start)}</span>
                  </span>
                </button>
              ) : null}

              {installPrompt ? (
                <div className="install-bar">
                  <p>Instale a carteira na tela inicial.</p>
                  <button className="pill" onClick={install}>Instalar</button>
                </div>
              ) : null}

              <p className="section-title">Nos proximos 45 dias</p>
              {soon.length ? (
                soon.map((event) => (
                  <EventCard key={event.id} event={event} saved={Boolean(state.saved[event.id])} onOpen={open} />
                ))
              ) : (
                <div className="empty">
                  <p>Nada nas proximas semanas.</p>
                  <small>Abra a Agenda para ver o ano inteiro e se programar com antecedencia.</small>
                </div>
              )}
            </>
          ) : null}

          {tab === 'agenda' ? (
            <>
              <p className="section-title">Agenda {data.church.year}</p>
              {groupByMonth(upcoming).map((group) => (
                <div key={group.key}>
                  <p className="section-title">{group.label}</p>
                  {group.events.map((event) => (
                    <EventCard key={event.id} event={event} saved={Boolean(state.saved[event.id])} onOpen={open} />
                  ))}
                </div>
              ))}
            </>
          ) : null}

          {tab === 'carteira' ? (
            <>
              <p className="section-title">Minha carteira</p>
              {savedEvents.length ? (
                savedEvents.map((event) => (
                  <EventCard key={event.id} event={event} saved onOpen={open} />
                ))
              ) : (
                <div className="empty">
                  <p>Sua carteira esta vazia.</p>
                  <small>Abra um evento e ative "Salvar na carteira" para acompanhar a contagem regressiva.</small>
                </div>
              )}
            </>
          ) : null}
        </>
      )}

      <nav className="nav">
        {TABS.map((item) => (
          <button
            key={item.id}
            data-active={!openEvent && tab === item.id}
            onClick={() => { setOpenId(null); setTab(item.id) }}
          >
            {item.label}
          </button>
        ))}
        <span className="spacer" />
        <button
          className="add"
          aria-label="Ir para a agenda completa"
          onClick={() => { setOpenId(null); setTab('agenda') }}
        >
          +
        </button>
      </nav>
    </div>
  )
}

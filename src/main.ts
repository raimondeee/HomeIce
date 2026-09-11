import './styles/main.css'
import {
  EXERCISES,
  getExercise,
  estimatePrescriptionsMinutes,
  POOL_LABELS,
  visibleExercises,
  youtubeEmbedUrl,
  youtubeWatchUrl,
  type Equipment,
  type ExercisePool,
  type PhaseMode,
} from './data/exercises'
import { WORKOUTS, getWorkout } from './data/workouts'
import {
  loadOrCreateWeekPlan,
  swapSessionWorkout,
  dayLabel,
  restGapMessage,
  generateWeekPlan,
  saveWeekPlan,
  adaptPrescriptions,
  SOFT_WARN_CONSECUTIVE_HARD,
} from './lib/planner'
import {
  addCompletion,
  isSessionDone,
  loadSettings,
  saveSettings,
  weekSeedKey,
  type Settings,
  type WeekPlan,
  type SessionSlot,
  type Prescription,
} from './lib/storage'
import { tryLoadCurriculumJson } from './lib/curriculum'

type Screen = 'home' | 'library' | 'settings' | 'runner'

interface RunnerState {
  session: SessionSlot
  workoutId: string
  prescriptions: Prescription[]
  exIndex: number
  setIndex: number
  phase: 'work' | 'rest' | 'hold' | 'ready'
  remaining: number
  running: boolean
  timerId: number | null
}

const app = document.querySelector<HTMLDivElement>('#app')!

let screen: Screen = 'home'
let plan: WeekPlan = loadOrCreateWeekPlan()
let runner: RunnerState | null = null
let librarySwapTarget: string | null = null
let curriculumNote: string | null = null

void tryLoadCurriculumJson().then((data) => {
  if (data && Array.isArray(data.ids)) {
    const v = data.version ?? 1
    curriculumNote = `Carl curriculum v${v} loaded (${data.ids.length} exercises).`
    render()
  }
})

function refreshPlan(): void {
  plan = loadOrCreateWeekPlan()
}

function navigate(next: Screen): void {
  if (screen === 'runner' && next !== 'runner') {
    stopTimer()
    runner = null
  }
  screen = next
  render()
}

function stopTimer(): void {
  if (runner?.timerId != null) {
    window.clearInterval(runner.timerId)
    runner.timerId = null
  }
  if (runner) runner.running = false
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function startSession(session: SessionSlot): void {
  const prescriptions =
    session.prescriptions?.length > 0
      ? session.prescriptions.map((p) => ({ ...p }))
      : adaptPrescriptions(
          getWorkout(session.workoutId)?.prescriptions.map((p) => ({ ...p })) ?? [],
          loadSettings().equipment,
        )
  if (!prescriptions.length) return
  stopTimer()
  runner = {
    session,
    workoutId: session.workoutId,
    prescriptions,
    exIndex: 0,
    setIndex: 0,
    phase: 'ready',
    remaining: 0,
    running: false,
    timerId: null,
  }
  beginPhase('work')
  screen = 'runner'
  render()
}

function currentRx(): Prescription | undefined {
  if (!runner) return undefined
  return runner.prescriptions[runner.exIndex]
}

function currentExercise() {
  const rx = currentRx()
  if (!rx) return undefined
  return getExercise(rx.exerciseId)
}

function beginPhase(phase: RunnerState['phase']): void {
  if (!runner) return
  const rx = currentRx()
  const ex = currentExercise()
  if (!rx || !ex) return
  stopTimer()
  runner.phase = phase
  const mode: PhaseMode = rx.mode
  if (phase === 'work') {
    if (mode === 'timed' || mode === 'hold') {
      runner.remaining = rx.work
      runner.phase = mode === 'hold' ? 'hold' : 'work'
    } else {
      runner.remaining = Math.max(15, Math.round(rx.work * 2.5))
    }
  } else if (phase === 'rest') {
    runner.remaining = rx.restSec
  } else {
    runner.remaining = 0
  }
  runner.running = true
  runner.timerId = window.setInterval(tick, 1000)
}

function tick(): void {
  if (!runner || !runner.running) return
  runner.remaining -= 1
  if (runner.remaining <= 0) {
    runner.remaining = 0
    advanceAfterPhase()
    return
  }
  updateRunnerDom()
}

function advanceAfterPhase(): void {
  if (!runner) return
  const rx = currentRx()
  if (!rx) return

  if (runner.phase === 'work' || runner.phase === 'hold') {
    const lastSet = runner.setIndex >= rx.sets - 1
    const lastEx = runner.exIndex >= runner.prescriptions.length - 1
    if (lastSet && lastEx) {
      completeSession()
      return
    }
    if (lastSet) {
      runner.exIndex += 1
      runner.setIndex = 0
      beginPhase('work')
      render()
      return
    }
    beginPhase('rest')
    render()
    return
  }

  if (runner.phase === 'rest') {
    runner.setIndex += 1
    beginPhase('work')
    render()
  }
}

function skipPhase(): void {
  if (!runner) return
  advanceAfterPhase()
}

function nextExercise(): void {
  if (!runner) return
  const lastEx = runner.exIndex >= runner.prescriptions.length - 1
  if (lastEx) {
    completeSession()
    return
  }
  runner.exIndex += 1
  runner.setIndex = 0
  beginPhase('work')
  render()
}

function completeSession(): void {
  if (!runner) return
  stopTimer()
  addCompletion({
    sessionId: runner.session.id,
    workoutId: runner.workoutId,
    weekSeed: plan.weekSeed,
    completedAt: new Date().toISOString(),
  })
  runner = null
  screen = 'home'
  refreshPlan()
  render()
}

function updateRunnerDom(): void {
  const el = document.getElementById('timer-display')
  if (el && runner) el.textContent = formatTime(Math.max(0, runner.remaining))
}

function persistPlan(settings: Settings): void {
  saveSettings(settings)
  const next = generateWeekPlan(settings.sessionsPerWeek)
  saveWeekPlan(next)
  localStorage.removeItem('homeice.weekPlanOverride')
  plan = next
  render()
}

function setSessionsPerWeek(n: 2 | 3 | 4): void {
  persistPlan({ ...loadSettings(), sessionsPerWeek: n })
}

function setEquipment(equipment: Equipment): void {
  persistPlan({ ...loadSettings(), equipment })
}

/* ——— Renderers ——— */

function renderTop(titleSub?: string): string {
  return `
    <header class="topbar">
      <div class="brand">
        <div class="brand-mark">HI</div>
        <div>
          <h1>HomeIce</h1>
          <div class="sub">${titleSub ?? 'Youth dryland · ages 10–12'}</div>
        </div>
      </div>
      <button class="icon-btn" type="button" data-nav="settings" aria-label="Settings">⚙️</button>
    </header>
  `
}

function renderNav(): string {
  if (screen === 'runner') return ''
  return `
    <nav class="nav" aria-label="Main">
      <button type="button" class="${screen === 'home' ? 'active' : ''}" data-nav="home">
        <span class="ico">🏠</span>Home
      </button>
      <button type="button" class="${screen === 'library' ? 'active' : ''}" data-nav="library">
        <span class="ico">📚</span>Library
      </button>
      <button type="button" class="${screen === 'settings' ? 'active' : ''}" data-nav="settings">
        <span class="ico">⚙️</span>Settings
      </button>
    </nav>
  `
}

function dayTypePill(s: SessionSlot): string {
  const cls = s.dayType === 'HARD' ? 'pill hard' : 'pill soft'
  return `<span class="${cls}">${s.dayType} · ${s.theme}</span>`
}

function renderHome(): string {
  refreshPlan()
  const settings = loadSettings()
  const sessionsHtml = plan.sessions
    .map((s, i) => {
      const mins = estimatePrescriptionsMinutes(s.prescriptions)
      const done = isSessionDone(plan.weekSeed, s.id)
      const rest = restGapMessage(plan.sessions, i)
      const cta = done
        ? `<span class="pill done">Done ✓</span>`
        : `<button class="btn btn-primary" type="button" data-start="${s.id}">Start</button>`

      return `
        <div class="card">
          <div class="session-row">
            <div class="session-num ${done ? 'done' : ''} ${s.dayType === 'SOFT' ? 'soft' : ''}">${i + 1}</div>
            <div class="session-body">
              <div class="muted">${dayLabel(s.dayOffset)} · ~${mins} min</div>
              <h3>${s.label}</h3>
              <div class="meta">
                ${dayTypePill(s)}
                <span class="pill">${s.prescriptions.length} moves</span>
                ${done ? '<span class="pill done">Completed</span>' : '<span class="pill">Ready</span>'}
              </div>
              ${s.softWarn ? `<p class="muted" style="font-size:0.82rem;margin-top:6px">⚠️ ${s.softWarn}</p>` : ''}
              <div class="btn-row">
                ${cta}
                <button class="btn btn-ghost" type="button" data-swap="${s.id}">Swap workout</button>
              </div>
            </div>
          </div>
        </div>
        ${
          rest
            ? `<div class="rest-banner ${rest.includes('hard jump') || rest.includes('Back-to-back') || rest.includes('Yesterday') ? 'warn' : ''}">${rest}</div>`
            : ''
        }
      `
    })
    .join('')

  return `
    ${renderTop()}
    <p class="week-chip">This week · ${plan.weekSeed} · ${settings.sessionsPerWeek} sessions</p>
    <h2 class="screen-title">Your plan</h2>
    <p class="muted">Carl auto-builder: HARD / SOFT day budget, linear vs lateral themes, quality over volume.</p>
    ${
      plan.consecutiveHardWarning
        ? `<div class="rest-banner warn">⚠️ ${SOFT_WARN_CONSECUTIVE_HARD}</div>`
        : plan.backToBackWarning
          ? `<div class="rest-banner warn">⚠️ Consecutive calendar days in this plan. Soft days next to HARD are OK — keep landings quiet.</div>`
          : ''
    }
    ${curriculumNote ? `<p class="muted">${curriculumNote}</p>` : ''}
    ${sessionsHtml}
    ${renderNav()}
  `
}

function renderLibrary(): string {
  const settings = loadSettings()
  const catalog = visibleExercises(settings.equipment)
  const poolOrder: ExercisePool[] = [
    'warmup',
    'landing',
    'bounce-linear',
    'bounce-lateral',
    'hard-linear',
    'hard-lateral',
    'core',
    'lower-iso',
  ]

  const workoutsHtml = WORKOUTS.map((w) => {
    const adapted = adaptPrescriptions(w.prescriptions, settings.equipment)
    const mins = estimatePrescriptionsMinutes(adapted)
    const names = adapted
      .map((p) => getExercise(p.exerciseId)?.name ?? p.exerciseId)
      .join(' · ')
    return `
      <div class="card workout-card">
        <h3>${w.name}</h3>
        <p class="muted">${w.tagline}</p>
        <div class="meta">
          <span class="pill ${w.dayType === 'HARD' ? 'hard' : 'soft'}">${w.dayType}</span>
          <span class="pill">${w.theme}</span>
          <span class="pill">~${mins} min</span>
          <span class="pill">${w.exerciseIds.length} moves</span>
        </div>
        <p class="muted" style="font-size:0.82rem">${names}</p>
        ${
          librarySwapTarget
            ? `<button class="btn btn-primary btn-block" type="button" data-apply-swap="${w.id}" style="margin-top:10px">Use for selected session</button>`
            : ''
        }
      </div>
    `
  }).join('')

  const grouped = poolOrder
    .map((pool) => {
      const list = catalog.filter((e) => e.pools.includes(pool))
      // avoid dupes across pools: show only if this is the exercise's first listed pool
      const unique = list.filter((e) => e.pools[0] === pool)
      if (!unique.length) return ''
      const cards = unique
        .map((ex) => {
          const rx =
            ex.workUnit === 'reps'
              ? `${ex.sets}×${ex.work} reps · ${ex.restSec}s rest`
              : `${ex.sets}×${ex.work}s · ${ex.restSec}s rest`
          return `
            <div class="card">
              <h3>${ex.name}${ex.extra ? ' <span class="pill">EXTRA</span>' : ''}</h3>
              <p class="muted">${ex.cues[0] ?? ex.focus}</p>
              <div class="meta">
                <span class="pill">${rx}</span>
                <span class="pill">diff ${ex.difficulty}</span>
                <span class="pill">${ex.equipment === 'light-db-kb' ? 'DB/KB' : 'bodyweight'}</span>
                <span class="pill">${ex.focus.split(',')[0]}</span>
                ${ex.youtubeUrl ? '<span class="pill">Short</span>' : ''}
              </div>
              <p class="muted" style="font-size:0.82rem"><strong>Stop:</strong> ${ex.safetyStop}</p>
            </div>
          `
        })
        .join('')
      return `
        <h3 class="pool-heading">${POOL_LABELS[pool]} <span class="muted" style="font-weight:500;font-size:0.85rem">(${unique.length})</span></h3>
        ${cards}
      `
    })
    .join('')

  // Any exercise whose primary pool wasn't listed (shouldn't happen)
  const shown = new Set(
    poolOrder.flatMap((p) => catalog.filter((e) => e.pools[0] === p).map((e) => e.id)),
  )
  const orphan = catalog.filter((e) => !shown.has(e.id))
  const orphanHtml =
    orphan.length > 0
      ? `<h3 class="pool-heading">Other</h3>` +
        orphan
          .map(
            (ex) => `
        <div class="card"><h3>${ex.name}</h3><p class="muted">${ex.focus}</p></div>`,
          )
          .join('')
      : ''

  return `
    ${renderTop('Browse workouts & moves')}
    <h2 class="screen-title">Library</h2>
    ${
      librarySwapTarget
        ? `<div class="rest-banner">Pick a Carl sample session to swap into this week's plan, then tap <strong>Use for selected session</strong>.</div>
           <button class="btn btn-ghost" type="button" data-cancel-swap>Cancel swap</button>`
        : `<p class="muted">Carl sample weeks + ${catalog.length} moves for <strong>${settings.equipment === 'light-db-kb' ? 'light DB/KB' : 'bodyweight'}</strong> (of ${EXERCISES.length} in v3).</p>`
    }
    <h3 style="margin-top:18px;font-family:var(--display);color:var(--ice-800)">Sample sessions</h3>
    ${workoutsHtml}
    <h3 style="margin-top:18px;font-family:var(--display);color:var(--ice-800)">Exercise library · ${catalog.length}</h3>
    ${grouped}
    ${orphanHtml}
    ${renderNav()}
  `
}

function renderSettings(): string {
  const s = loadSettings()
  const budget =
    s.sessionsPerWeek === 2
      ? '2 HARD (linear + lateral)'
      : s.sessionsPerWeek === 3
        ? '2 HARD + 1 SOFT'
        : '2 HARD + 2 SOFT'
  return `
    ${renderTop('Preferences')}
    <h2 class="screen-title">Settings</h2>
    <div class="card">
      <h3>Sessions per week</h3>
      <p class="muted">Default is 2. Budget scales with Carl's rules — extra days add landing/core quality, not more max jumps.</p>
      <div class="segment" role="group" aria-label="Sessions per week">
        <button type="button" class="${s.sessionsPerWeek === 2 ? 'active' : ''}" data-spw="2">2</button>
        <button type="button" class="${s.sessionsPerWeek === 3 ? 'active' : ''}" data-spw="3">3</button>
        <button type="button" class="${s.sessionsPerWeek === 4 ? 'active' : ''}" data-spw="4">4</button>
      </div>
      <p class="muted">Current budget: <strong>${budget}</strong>. Changing regenerates this week's plan.</p>
      ${
        plan.consecutiveHardWarning
          ? `<div class="rest-banner warn">${SOFT_WARN_CONSECUTIVE_HARD}</div>`
          : plan.backToBackWarning
            ? `<div class="rest-banner warn">Plan has consecutive calendar days (SOFT next to HARD is fine).</div>`
            : `<div class="rest-banner">HARD days spaced ~48–72h. Nice.</div>`
      }
    </div>
    <div class="card">
      <h3>Equipment</h3>
      <p class="muted">Default is bodyweight. Light DB/KB unlocks goblet squats, RDLs, and similar loaded moves in the library and auto-plan.</p>
      <div class="segment segment-2" role="group" aria-label="Equipment">
        <button type="button" class="${s.equipment === 'bodyweight' ? 'active' : ''}" data-equip="bodyweight">Bodyweight</button>
        <button type="button" class="${s.equipment === 'light-db-kb' ? 'active' : ''}" data-equip="light-db-kb">Light DB / KB</button>
      </div>
      <p class="muted">Changing equipment regenerates this week's plan.</p>
    </div>
    <div class="card">
      <h3>About HomeIce</h3>
      <p class="muted">Youth hockey dryland · Carl curriculum v3 (${EXERCISES.length} moves). Offline demos use a pace ball + cues; wired YouTube Shorts embed when Carl listed a URL. Local-only (<code>homeice.*</code>).</p>
      <p class="muted">Week seed: ${weekSeedKey()}</p>
    </div>
    <div class="card">
      <h3>Reset (dev)</h3>
      <button class="btn btn-danger" type="button" data-reset>Clear completions & plan overrides</button>
    </div>
    ${renderNav()}
  `
}


function renderDemoSlot(
  ex: NonNullable<ReturnType<typeof getExercise>>,
  shortCue: string,
): string {
  const embed = youtubeEmbedUrl(ex)
  const watch = youtubeWatchUrl(ex)
  if (embed && watch) {
    return `
    <div class="demo-slot demo-${ex.kind} has-video" aria-label="Movement demo · ${ex.kind}">
      <span class="demo-label">Demo · ${ex.kind}</span>
      <div class="demo-stage">
        <div class="demo-video-wrap">
          <iframe
            src="${embed}"
            title="${ex.name} demo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            loading="lazy"
            referrerpolicy="strict-origin-when-cross-origin"
          ></iframe>
        </div>
      </div>
      <div class="demo-name">${ex.name}</div>
      <p class="demo-cue">${shortCue}</p>
      <a class="demo-open-short" href="${watch}" target="_blank" rel="noopener noreferrer">Open Short ↗</a>
    </div>`
  }
  return `
    <div class="demo-slot demo-${ex.kind}" aria-label="Pace metronome · ${ex.kind}">
      <span class="demo-label">Demo · ${ex.kind}</span>
      <div class="demo-stage">
        <div class="pace-ball" title="Pace metronome" aria-hidden="true"></div>
      </div>
      <div class="demo-name">${ex.name}</div>
      <p class="demo-cue">${shortCue}</p>
      <p class="demo-note">YouTube Shorts for more moves come later.</p>
    </div>`
}

function renderRunner(): string {
  if (!runner) return renderHome()
  const rx = currentRx()
  const ex = currentExercise()
  if (!rx || !ex) return renderHome()
  const phaseTitle =
    runner.phase === 'rest' ? 'Rest' : runner.phase === 'hold' ? 'Hold' : 'Work'
  const workHint =
    rx.workUnit === 'reps' ? `${rx.work} reps` : `${rx.work} seconds`
  const setsLeft = rx.sets - runner.setIndex
  const phaseTag = rx.phase === 'warmup' ? 'Warm-up' : 'Main'
  const shortCue = ex.cues[0] ?? ex.qualityCue

  return `
    <div class="runner-header">
      <button class="btn btn-ghost" type="button" data-exit-runner>← Exit</button>
      <span class="pill">${phaseTag}</span>
      <span class="pill">${runner.exIndex + 1} / ${runner.prescriptions.length}</span>
    </div>
    ${renderDemoSlot(ex, shortCue)}
    <p class="phase-label">${phaseTitle}${runner.phase !== 'rest' ? ` · ${workHint}` : ''}</p>
    <div id="timer-display" class="timer ${runner.phase}">${formatTime(runner.remaining)}</div>
    <div class="progress-dots" aria-hidden="true">
      ${Array.from({ length: rx.sets }, (_, i) => {
        const cls = i < runner!.setIndex ? 'done' : i === runner!.setIndex ? 'on' : ''
        return `<span class="${cls}"></span>`
      }).join('')}
    </div>
    <p class="muted" style="text-align:center">Set ${runner.setIndex + 1} of ${rx.sets} · ${setsLeft} set${setsLeft === 1 ? '' : 's'} remaining this move</p>
    <div class="cue-banner">🛡️ ${ex.qualityCue}</div>
    <ul class="cue-list">${ex.cues
      .slice(0, 3)
      .map((c) => `<li>${c}</li>`)
      .join('')}</ul>
    <div class="btn-row" style="justify-content:center">
      <button class="btn btn-secondary" type="button" data-skip>Skip phase</button>
      <button class="btn btn-ghost" type="button" data-next-ex>Next exercise</button>
    </div>
    <div class="btn-row" style="margin-top:10px">
      <button class="btn btn-primary btn-block" type="button" data-complete>Complete session</button>
    </div>
  `
}

function render(): void {
  let html = ''
  switch (screen) {
    case 'home':
      html = renderHome()
      break
    case 'library':
      html = renderLibrary()
      break
    case 'settings':
      html = renderSettings()
      break
    case 'runner':
      html = renderRunner()
      break
  }
  app.innerHTML = html
}

app.addEventListener('click', (e) => {
  const t = (e.target as HTMLElement).closest(
    '[data-nav],[data-start],[data-swap],[data-apply-swap],[data-cancel-swap],[data-spw],[data-equip],[data-skip],[data-next-ex],[data-complete],[data-exit-runner],[data-reset]',
  ) as HTMLElement | null
  if (!t) return

  if (t.dataset.nav) {
    librarySwapTarget = null
    navigate(t.dataset.nav as Screen)
    return
  }
  if (t.dataset.start) {
    const session = plan.sessions.find((s) => s.id === t.dataset.start)
    if (session) startSession(session)
    return
  }
  if (t.dataset.swap) {
    librarySwapTarget = t.dataset.swap
    navigate('library')
    return
  }
  if (t.dataset.applySwap && librarySwapTarget) {
    plan = swapSessionWorkout(librarySwapTarget, t.dataset.applySwap)
    librarySwapTarget = null
    navigate('home')
    return
  }
  if (t.hasAttribute('data-cancel-swap')) {
    librarySwapTarget = null
    render()
    return
  }
  if (t.dataset.spw) {
    const n = Number(t.dataset.spw) as 2 | 3 | 4
    if (n === 2 || n === 3 || n === 4) setSessionsPerWeek(n)
    return
  }
  if (t.dataset.equip === 'bodyweight' || t.dataset.equip === 'light-db-kb') {
    setEquipment(t.dataset.equip)
    return
  }
  if (t.hasAttribute('data-skip')) {
    skipPhase()
    return
  }
  if (t.hasAttribute('data-next-ex')) {
    nextExercise()
    return
  }
  if (t.hasAttribute('data-complete')) {
    completeSession()
    return
  }
  if (t.hasAttribute('data-exit-runner')) {
    stopTimer()
    runner = null
    navigate('home')
    return
  }
  if (t.hasAttribute('data-reset')) {
    localStorage.removeItem('homeice.completions')
    localStorage.removeItem('homeice.weekPlanOverride')
    localStorage.removeItem('homeice.weekPlan')
    refreshPlan()
    render()
  }
})

render()

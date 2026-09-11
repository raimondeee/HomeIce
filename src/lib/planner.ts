/**
 * Auto-builder wired to curriculum/02-weekly-plan-rules.md
 */
import { TEMPLATES_BY_COUNT, getWorkout, WORKOUTS } from '../data/workouts'
import {
  getJson,
  loadSettings,
  setJson,
  weekSeedKey,
  type DayTheme,
  type DayType,
  type Prescription,
  type SessionSlot,
  type WeekPlan,
} from './storage'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const SOFT_WARN_CONSECUTIVE_HARD =
  'Two hard jump days in a row is a lot for growing legs. We kept today’s session bouncy and light. Want to move a hard day? Swap it.'

export const SOFT_WARN_AFTER_HARD =
  'Yesterday was a jump day. Today is springy and strong, not a highlight-reel day.'

/**
 * Placement defaults from the doc:
 * 2 → Mon + Thu (HARD/HARD)
 * 3 → Mon HARD / Wed SOFT / Fri HARD
 * 4 → Mon HARD / Tue SOFT / Thu HARD / Fri SOFT
 */
export function placeSessionDays(n: 2 | 3 | 4): number[] {
  switch (n) {
    case 2:
      return [1, 4] // Mon, Thu
    case 3:
      return [1, 3, 5] // Mon, Wed, Fri
    case 4:
      return [1, 2, 4, 5] // Mon, Tue, Thu, Fri
  }
}

export function dayTypeBudget(n: 2 | 3 | 4): DayType[] {
  switch (n) {
    case 2:
      return ['HARD', 'HARD']
    case 3:
      return ['HARD', 'SOFT', 'HARD']
    case 4:
      return ['HARD', 'SOFT', 'HARD', 'SOFT']
  }
}

export function themeBudget(n: 2 | 3 | 4): DayTheme[] {
  switch (n) {
    case 2:
      return ['linear', 'lateral']
    case 3:
      return ['linear', 'bounce-core', 'lateral']
    case 4:
      return ['linear', 'bounce-core', 'lateral', 'landing-core']
  }
}

export function hasBackToBack(days: number[]): boolean {
  const sorted = [...days].sort((a, b) => a - b)
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i]! - sorted[i - 1]! === 1) return true
  }
  if (sorted.length >= 2 && sorted[0] === 0 && sorted[sorted.length - 1] === 6) return true
  return false
}

export function hasConsecutiveHard(sessions: SessionSlot[]): boolean {
  const hard = sessions
    .filter((s) => s.dayType === 'HARD')
    .map((s) => s.dayOffset)
    .sort((a, b) => a - b)
  for (let i = 1; i < hard.length; i++) {
    if (hard[i]! - hard[i - 1]! === 1) return true
  }
  if (hard.length >= 2 && hard[0] === 0 && hard[hard.length - 1] === 6) return true
  return false
}

/**
 * If preferred/placement forces two HARDs adjacent: prefer converting the later
 * day to SOFT when a SOFT slot still exists in the budget; else keep HARD but
 * (templates already use 4-day volume when n===4). Soft-warn either way.
 */
function applyConsecutiveHardSoftening(
  sessions: SessionSlot[],
  n: 2 | 3 | 4,
): SessionSlot[] {
  const out = sessions.map((s) => ({ ...s }))
  for (let i = 1; i < out.length; i++) {
    const prev = out[i - 1]!
    const cur = out[i]!
    const adjacent =
      cur.dayOffset - prev.dayOffset === 1 ||
      (prev.dayOffset === 6 && cur.dayOffset === 0)
    if (!adjacent) continue

    if (prev.dayType === 'HARD' && cur.dayType === 'HARD') {
      // Prefer converting later day to SOFT if budget still has unused SOFT capacity
      const softCount = out.filter((s) => s.dayType === 'SOFT').length
      const softTarget = n === 2 ? 0 : n === 3 ? 1 : 2
      if (softCount < softTarget) {
        const softTpl =
          getWorkout(n === 4 ? '4d-soft-bounce' : '3d-soft') ?? getWorkout('3d-soft')
        if (softTpl) {
          out[i] = {
            ...cur,
            dayType: 'SOFT',
            theme: softTpl.theme,
            workoutId: softTpl.id,
            label: softTpl.name,
            prescriptions: softTpl.prescriptions.map((p) => ({ ...p })),
            softWarn: SOFT_WARN_CONSECUTIVE_HARD,
          }
        }
      } else {
        out[i] = { ...cur, softWarn: SOFT_WARN_CONSECUTIVE_HARD }
      }
    } else if (prev.dayType === 'HARD' && cur.dayType === 'SOFT') {
      out[i] = {
        ...cur,
        softWarn: cur.softWarn ?? SOFT_WARN_AFTER_HARD,
      }
    }
  }
  return out
}

function buildSlots(n: 2 | 3 | 4, weekSeed: string): SessionSlot[] {
  const days = placeSessionDays(n)
  const types = dayTypeBudget(n)
  const themes = themeBudget(n)
  const templateIds = TEMPLATES_BY_COUNT[n]

  const sessions: SessionSlot[] = days.map((dayOffset, i) => {
    const workoutId = templateIds[i]!
    const w = getWorkout(workoutId)!
    return {
      id: `${weekSeed}-s${i + 1}`,
      dayOffset,
      workoutId,
      label: w.name,
      dayType: types[i] ?? w.dayType,
      theme: themes[i] ?? w.theme,
      prescriptions: w.prescriptions.map((p) => ({ ...p })),
      softWarn: null,
    }
  })

  return applyConsecutiveHardSoftening(sessions, n)
}

export function generateWeekPlan(sessionsPerWeek?: 2 | 3 | 4): WeekPlan {
  const settings = loadSettings()
  const n = sessionsPerWeek ?? settings.sessionsPerWeek
  const weekSeed = weekSeedKey()
  const days = placeSessionDays(n)
  const sessions = buildSlots(n, weekSeed)
  return {
    weekSeed,
    sessionsPerWeek: n,
    sessions,
    backToBackWarning: hasBackToBack(days),
    consecutiveHardWarning: hasConsecutiveHard(sessions),
  }
}

/** Load plan; regenerate if week seed or sessionsPerWeek mismatch. Honor overrides. */
export function loadOrCreateWeekPlan(): WeekPlan {
  const settings = loadSettings()
  const weekSeed = weekSeedKey()
  const stored = getJson<WeekPlan | null>('weekPlan', null)
  const override = getJson<{ weekSeed: string; sessions: SessionSlot[] } | null>(
    'weekPlanOverride',
    null,
  )

  if (
    stored &&
    stored.weekSeed === weekSeed &&
    stored.sessionsPerWeek === settings.sessionsPerWeek &&
    stored.sessions.every((s) => Array.isArray(s.prescriptions) && s.dayType)
  ) {
    if (override && override.weekSeed === weekSeed) {
      return {
        ...stored,
        sessions: override.sessions,
        backToBackWarning: hasBackToBack(override.sessions.map((s) => s.dayOffset)),
        consecutiveHardWarning: hasConsecutiveHard(override.sessions),
      }
    }
    return stored
  }

  const plan = generateWeekPlan(settings.sessionsPerWeek)
  setJson('weekPlan', plan)
  if (override && override.weekSeed !== weekSeed) {
    setJson('weekPlanOverride', null)
  } else if (override && override.weekSeed === weekSeed) {
    if (stored && stored.sessionsPerWeek !== settings.sessionsPerWeek) {
      setJson('weekPlanOverride', null)
    } else {
      return {
        ...plan,
        sessions: override.sessions.slice(0, settings.sessionsPerWeek).map((s, i) => ({
          ...s,
          id: plan.sessions[i]?.id ?? s.id,
          dayOffset: plan.sessions[i]?.dayOffset ?? s.dayOffset,
        })),
        backToBackWarning: hasBackToBack(plan.sessions.map((s) => s.dayOffset)),
        consecutiveHardWarning: hasConsecutiveHard(plan.sessions),
      }
    }
  }
  return plan
}

export function saveWeekPlan(plan: WeekPlan): void {
  setJson('weekPlan', plan)
}

/** Swap a session slot's workout template; persists as override */
export function swapSessionWorkout(sessionId: string, workoutId: string): WeekPlan {
  const plan = loadOrCreateWeekPlan()
  const w = getWorkout(workoutId)
  if (!w) return plan

  const target = plan.sessions.find((s) => s.id === sessionId)
  // Soft days cannot accept HARD high-intent templates with squat-jumps / jumping-lunges
  if (target?.dayType === 'SOFT' && w.dayType === 'HARD') {
    const blocked = w.exerciseIds.some(
      (id) => id === 'squat-jumps' || id === 'jumping-lunges',
    )
    if (blocked) return plan
  }

  const sessions = plan.sessions.map((s) =>
    s.id === sessionId
      ? {
          ...s,
          workoutId,
          label: w.name,
          dayType: w.dayType,
          theme: w.theme,
          prescriptions: w.prescriptions.map((p) => ({ ...p })),
        }
      : s,
  )
  const next: WeekPlan = {
    ...plan,
    sessions,
    backToBackWarning: hasBackToBack(sessions.map((x) => x.dayOffset)),
    consecutiveHardWarning: hasConsecutiveHard(sessions),
  }
  setJson('weekPlanOverride', { weekSeed: plan.weekSeed, sessions })
  setJson('weekPlan', next)
  return next
}

export function dayLabel(dayOffset: number): string {
  return DAY_NAMES[dayOffset] ?? `Day ${dayOffset}`
}

export function restGapMessage(sessions: SessionSlot[], index: number): string | null {
  if (index >= sessions.length - 1) return null
  const a = sessions[index]!
  const b = sessions[index + 1]!
  const gap = b.dayOffset - a.dayOffset
  if (gap <= 1) {
    if (a.dayType === 'HARD' && b.dayType === 'HARD') {
      return SOFT_WARN_CONSECUTIVE_HARD
    }
    if (a.dayType === 'HARD' && b.dayType === 'SOFT') {
      return b.softWarn ?? SOFT_WARN_AFTER_HARD
    }
    return 'Back-to-back days — keep volume easy and prioritize soft landings. Prefer 48–72h rest when you can.'
  }
  if (gap === 2) {
    return `Rest day (${dayLabel(a.dayOffset + 1)}) — ~48h recovery. Light play OK; skip hard plyo.`
  }
  const midDays: string[] = []
  for (let d = a.dayOffset + 1; d < b.dayOffset; d++) midDays.push(dayLabel(d))
  return `Rest (${midDays.join(', ')}) — 48–72h between HARD sessions helps landings stay soft and strong.`
}

export function sessionExerciseIds(session: SessionSlot): string[] {
  return session.prescriptions.map((p) => p.exerciseId)
}

export function clonePrescriptions(list: Prescription[]): Prescription[] {
  return list.map((p) => ({ ...p }))
}

export { WORKOUTS, getWorkout }

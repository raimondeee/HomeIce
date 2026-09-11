import type { Equipment, PhaseMode } from '../data/exercises'

const PREFIX = 'homeice.'

export function getJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw == null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function setJson(key: string, value: unknown): void {
  localStorage.setItem(PREFIX + key, JSON.stringify(value))
}

export function removeKey(key: string): void {
  localStorage.removeItem(PREFIX + key)
}

/** ISO week key like 2026-W37 */
export function weekSeedKey(d = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

export interface Settings {
  sessionsPerWeek: 2 | 3 | 4
  equipment: Equipment
}

export const DEFAULT_SETTINGS: Settings = {
  sessionsPerWeek: 2,
  equipment: 'bodyweight',
}

export function loadSettings(): Settings {
  const s = getJson<Partial<Settings>>('settings', {})
  const n = s.sessionsPerWeek
  const equipment: Equipment = s.equipment === 'light-db-kb' ? 'light-db-kb' : 'bodyweight'
  return {
    sessionsPerWeek: n === 2 || n === 3 || n === 4 ? n : DEFAULT_SETTINGS.sessionsPerWeek,
    equipment,
  }
}

export function saveSettings(s: Settings): void {
  setJson('settings', s)
  setJson('settings.sessionsPerWeek', s.sessionsPerWeek)
  setJson('settings.equipment', s.equipment)
}

export type DayType = 'HARD' | 'SOFT'
export type DayTheme = 'linear' | 'lateral' | 'bounce-core' | 'landing-core'

export interface Prescription {
  exerciseId: string
  sets: number
  work: number
  mode: PhaseMode
  workUnit: 'reps' | 'sec'
  restSec: number
  phase: 'warmup' | 'main'
}

export interface SessionSlot {
  id: string
  /** 0=Sun … 6=Sat (local week view) */
  dayOffset: number
  workoutId: string
  label: string
  dayType: DayType
  theme: DayTheme
  prescriptions: Prescription[]
  /** Soft consecutive-HARD / adjacent warn from Carl's doc */
  softWarn?: string | null
}

export interface WeekPlan {
  weekSeed: string
  sessionsPerWeek: number
  equipment?: Equipment
  sessions: SessionSlot[]
  /** true if plan has back-to-back calendar days (any type) */
  backToBackWarning: boolean
  /** true if two HARD days sit on consecutive calendar days */
  consecutiveHardWarning: boolean
}

export interface CompletionRecord {
  sessionId: string
  workoutId: string
  weekSeed: string
  completedAt: string
}

export function loadCompletions(): CompletionRecord[] {
  return getJson<CompletionRecord[]>('completions', [])
}

export function addCompletion(rec: CompletionRecord): void {
  const all = loadCompletions()
  all.push(rec)
  setJson('completions', all)
}

export function isSessionDone(weekSeed: string, sessionId: string): boolean {
  return loadCompletions().some((c) => c.weekSeed === weekSeed && c.sessionId === sessionId)
}

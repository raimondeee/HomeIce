import { estimatePrescriptionsMinutes, getExercise, type PhaseMode } from './exercises'
import type { DayTheme, DayType, Prescription } from '../lib/storage'

export interface Workout {
  id: string
  name: string
  tagline: string
  dayType: DayType
  theme: DayTheme
  /** Sample-week template prescriptions (warmup + main) */
  prescriptions: Prescription[]
  /** Convenience: ordered exercise ids */
  exerciseIds: string[]
}

function rx(
  exerciseId: string,
  sets: number,
  work: number,
  phase: 'warmup' | 'main',
  overrides?: Partial<Pick<Prescription, 'mode' | 'workUnit' | 'restSec'>>,
): Prescription {
  const ex = getExercise(exerciseId)
  const mode: PhaseMode = overrides?.mode ?? ex?.mode ?? 'reps'
  const workUnit = overrides?.workUnit ?? ex?.workUnit ?? (mode === 'reps' ? 'reps' : 'sec')
  const restSec = overrides?.restSec ?? ex?.restSec ?? 30
  return { exerciseId, sets, work, mode, workUnit, restSec, phase }
}

function pack(
  id: string,
  name: string,
  tagline: string,
  dayType: DayType,
  theme: DayTheme,
  prescriptions: Prescription[],
): Workout {
  return {
    id,
    name,
    tagline,
    dayType,
    theme,
    prescriptions,
    exerciseIds: prescriptions.map((p) => p.exerciseId),
  }
}

/** Carl sample-week session templates (02-weekly-plan-rules.md) */
export const WORKOUTS: Workout[] = [
  pack(
    '2d-hard-linear-a',
    'HARD Linear · Week A',
    '2-day Mon sample — landing → pogos → squat jumps → bird-dog',
    'HARD',
    'linear',
    [
      rx('athletic-stance', 1, 20, 'warmup'),
      rx('high-knees', 1, 20, 'warmup'),
      rx('snap-downs', 1, 5, 'warmup'),
      rx('hop-and-stick', 2, 5, 'main'),
      rx('linear-pogos', 3, 16, 'main'),
      rx('squat-jumps', 3, 5, 'main', { restSec: 75 }),
      rx('bird-dog', 2, 4, 'main'),
    ],
  ),
  pack(
    '2d-hard-lateral-a',
    'HARD Lateral · Week A',
    '2-day Thu sample — balance → lateral pogos → skaters → lunges → dead-bug',
    'HARD',
    'lateral',
    [
      rx('athletic-stance', 1, 20, 'warmup'),
      rx('light-skips', 1, 15, 'warmup'),
      rx('snap-downs', 1, 5, 'warmup'),
      rx('single-leg-balance', 2, 20, 'main'),
      rx('lateral-pogos', 3, 14, 'main'),
      rx('skater-hops-hold', 3, 5, 'main'),
      rx('jumping-lunges', 3, 4, 'main', { restSec: 75 }),
      rx('dead-bug', 2, 5, 'main'),
    ],
  ),
  pack(
    '2d-hard-linear-b',
    'HARD Linear · Week B',
    '2-day Tue flavor — snaps → power skips → lunges → wall-sit',
    'HARD',
    'linear',
    [
      rx('high-knees', 1, 20, 'warmup'),
      rx('light-skips', 1, 15, 'warmup'),
      rx('athletic-stance', 1, 20, 'warmup'),
      rx('snap-downs', 2, 6, 'main'),
      rx('power-skips', 3, 6, 'main'),
      rx('jumping-lunges', 3, 4, 'main', { restSec: 75 }),
      rx('wall-sit', 2, 25, 'main'),
    ],
  ),
  pack(
    '2d-hard-lateral-b',
    'HARD Lateral · Week B',
    '2-day Fri flavor — ski jumps → skaters → squat jumps → bridge',
    'HARD',
    'lateral',
    [
      rx('athletic-stance', 1, 20, 'warmup'),
      rx('high-knees', 1, 15, 'warmup'),
      rx('hop-and-stick', 1, 5, 'warmup'),
      rx('lateral-ski-jumps', 3, 8, 'main'),
      rx('skater-hops-hold', 3, 4, 'main'),
      rx('squat-jumps', 3, 4, 'main', { restSec: 75 }),
      rx('glute-bridge-march', 2, 25, 'main'),
    ],
  ),
  pack(
    '3d-hard-linear',
    'HARD Linear · 3-day',
    'Mon sample — thinner volume; squat jumps only (no lunges)',
    'HARD',
    'linear',
    [
      rx('athletic-stance', 1, 20, 'warmup'),
      rx('high-knees', 1, 20, 'warmup'),
      rx('snap-downs', 1, 5, 'warmup'),
      rx('hop-and-stick', 2, 5, 'main'),
      rx('linear-pogos', 2, 12, 'main'),
      rx('squat-jumps', 2, 4, 'main', { restSec: 75 }),
      rx('bodyweight-squat', 2, 8, 'main'),
    ],
  ),
  pack(
    '3d-soft',
    'SOFT Bounce + Core · 3-day',
    'Wed sample — light pogos, balance, two core moves',
    'SOFT',
    'bounce-core',
    [
      rx('athletic-stance', 1, 20, 'warmup'),
      rx('light-skips', 1, 20, 'warmup'),
      rx('high-knees', 1, 15, 'warmup'),
      rx('linear-pogos', 2, 10, 'main'),
      rx('single-leg-balance', 2, 20, 'main'),
      rx('dead-bug', 2, 6, 'main'),
      rx('bird-dog', 2, 5, 'main'),
    ],
  ),
  pack(
    '3d-hard-lateral',
    'HARD Lateral · 3-day',
    'Fri sample — lateral quality only; no squat jumps / lunges',
    'HARD',
    'lateral',
    [
      rx('athletic-stance', 1, 20, 'warmup'),
      rx('snap-downs', 1, 5, 'warmup'),
      rx('light-skips', 1, 15, 'warmup'),
      rx('lateral-pogos', 2, 12, 'main'),
      rx('skater-hops-hold', 2, 4, 'main'),
      rx('chaotic-hops', 2, 20, 'main'),
      rx('wall-sit', 2, 25, 'main'),
    ],
  ),
  pack(
    '4d-hard-linear',
    'HARD Linear · 4-day',
    'Mon sample — shorter HARD; power skips + squat jumps',
    'HARD',
    'linear',
    [
      rx('athletic-stance', 1, 20, 'warmup'),
      rx('high-knees', 1, 15, 'warmup'),
      rx('snap-downs', 1, 5, 'warmup'),
      rx('hop-and-stick', 2, 5, 'main'),
      rx('power-skips', 2, 5, 'main'),
      rx('squat-jumps', 2, 4, 'main', { restSec: 75 }),
      rx('glute-bridge-march', 2, 20, 'main'),
    ],
  ),
  pack(
    '4d-soft-bounce',
    'SOFT Bounce + Core · 4-day',
    'Tue sample — consecutive after HARD (soft-warn)',
    'SOFT',
    'bounce-core',
    [
      rx('light-skips', 1, 20, 'warmup'),
      rx('athletic-stance', 1, 20, 'warmup'),
      rx('linear-pogos', 2, 10, 'main'),
      rx('single-leg-balance', 2, 15, 'main'),
      rx('dead-bug', 2, 5, 'main'),
      rx('bear-crawl', 2, 15, 'main'),
    ],
  ),
  pack(
    '4d-hard-lateral',
    'HARD Lateral · 4-day',
    'Thu sample — skaters + ski jumps; no lunges if squats already ran',
    'HARD',
    'lateral',
    [
      rx('athletic-stance', 1, 20, 'warmup'),
      rx('high-knees', 1, 15, 'warmup'),
      rx('hop-and-stick', 1, 4, 'warmup'),
      rx('lateral-pogos', 2, 10, 'main'),
      rx('skater-hops-hold', 2, 4, 'main'),
      rx('lateral-ski-jumps', 2, 6, 'main'),
      rx('side-plank-lifts', 2, 20, 'main'),
    ],
  ),
  pack(
    '4d-soft-landing',
    'SOFT Landing + Core · 4-day',
    'Fri sample — snaps, hop-and-stick, bird-dog, wall-sit',
    'SOFT',
    'landing-core',
    [
      rx('athletic-stance', 1, 20, 'warmup'),
      rx('light-skips', 1, 15, 'warmup'),
      rx('snap-downs', 2, 5, 'main'),
      rx('hop-and-stick', 2, 5, 'main'),
      rx('bird-dog', 2, 5, 'main'),
      rx('wall-sit', 2, 20, 'main'),
    ],
  ),
]

export function getWorkout(id: string): Workout | undefined {
  return WORKOUTS.find((w) => w.id === id)
}

export function workoutDurationMin(w: Workout): number {
  return estimatePrescriptionsMinutes(w.prescriptions)
}

/** Default template ids by sessions/week (Week A samples) */
export const TEMPLATES_BY_COUNT: Record<2 | 3 | 4, string[]> = {
  2: ['2d-hard-linear-a', '2d-hard-lateral-a'],
  3: ['3d-hard-linear', '3d-soft', '3d-hard-lateral'],
  4: ['4d-hard-linear', '4d-soft-bounce', '4d-hard-lateral', '4d-soft-landing'],
}

/**
 * Carl HomeIce exercise library — all 22 Cecil-index ids.
 * Source: curriculum/01-exercise-library.md
 */

export type ExercisePool =
  | 'warmup'
  | 'landing'
  | 'bounce-linear'
  | 'bounce-lateral'
  | 'hard-linear'
  | 'hard-lateral'
  | 'core'
  | 'lower-iso'

/** Demo CSS slot mapping (focus/kind → stick-athlete class demo-${kind}) */
export type DemoKind =
  | 'landing'
  | 'high-knees'
  | 'pogo'
  | 'skip'
  | 'skate'
  | 'lateral'
  | 'lunge'
  | 'jump'
  | 'core'
  | 'iso'

export type PhaseMode = 'reps' | 'timed' | 'hold'

export interface Exercise {
  id: string
  name: string
  focus: string
  pools: ExercisePool[]
  cues: string[]
  qualityCue: string
  demoNotes: string
  safetyStop: string
  sourceRef: string
  difficulty: 1 | 2 | 3
  extra: boolean
  /** Default prescription (volume table overrides in planner) */
  sets: number
  work: number
  restSec: number
  mode: PhaseMode
  workUnit: 'reps' | 'sec'
  estSecPerSet: number
  /** CSS demo animation key */
  kind: DemoKind
}

function mapKind(focus: string, id: string): DemoKind {
  if (id === 'jumping-lunges') return 'lunge'
  if (id === 'squat-jumps') return 'jump'
  if (id === 'high-knees') return 'high-knees'
  if (id === 'skater-hops-hold') return 'skate'
  if (id === 'linear-pogos') return 'pogo'
  if (id.includes('skip')) return 'skip'
  if (
    id === 'lateral-pogos' ||
    id === 'lateral-ski-jumps' ||
    id === 'chaotic-hops' ||
    id === 'multi-directional-jumps'
  )
    return 'lateral'
  if (id.includes('pogo')) return 'pogo'
  if (
    id === 'dead-bug' ||
    id === 'bird-dog' ||
    id === 'bear-crawl' ||
    id === 'glute-bridge-march' ||
    id === 'side-plank-lifts' ||
    focus.includes('core')
  )
    return 'core'
  if (
    id === 'wall-sit' ||
    id === 'bodyweight-squat' ||
    id === 'single-leg-balance' ||
    focus.includes('iso')
  )
    return 'iso'
  if (
    id === 'snap-downs' ||
    id === 'hop-and-stick' ||
    id === 'athletic-stance' ||
    focus.includes('landing') ||
    id.includes('snap')
  )
    return 'landing'
  return 'landing'
}

const RAW: Omit<Exercise, 'kind' | 'qualityCue' | 'estSecPerSet'>[] = [
  {
    id: 'snap-downs',
    name: 'Snap Downs',
    focus: 'landing, warm-up',
    pools: ['warmup', 'landing'],
    cues: [
      'Stand tall. Rise onto your toes.',
      'Snap down into your hockey stance. Fast, then stick.',
      'Quiet feet. Bend ankles, knees, and hips together.',
      'Chest up. Eyes on the far wall.',
      'Hold two seconds. Reset. Do it again.',
    ],
    demoNotes:
      'Side view. Rise onto toes, drop fast into quarter-squat athletic stance and freeze. Hold 2s.',
    safetyStop:
      'Stop if heels slam, knees cave in, or the kid cannot hold the stick for two seconds.',
    sourceRef: 'gemini-seed; yt-0E7arQvGKIU@01:07',
    difficulty: 1,
    extra: false,
    sets: 2,
    work: 5,
    restSec: 35,
    mode: 'reps',
    workUnit: 'reps',
  },
  {
    id: 'high-knees',
    name: 'High Knees',
    focus: 'warm-up, rhythm',
    pools: ['warmup'],
    cues: [
      'Jog in place. Soft feet.',
      'Drive one knee up to hip height. Then the other.',
      'Pump your arms like you are skating hard.',
      'Stay tall. Belly quiet.',
      'Quick and light. Not a stomp.',
    ],
    demoNotes: 'Front + side. In-place high-knee jog, opposite arm/leg, knees to hip line.',
    safetyStop: 'Stop if leaning back, slamming heels, or losing arm-leg rhythm.',
    sourceRef: 'gemini-seed; usa-hockey',
    difficulty: 1,
    extra: false,
    sets: 2,
    work: 20,
    restSec: 25,
    mode: 'timed',
    workUnit: 'sec',
  },
  {
    id: 'linear-pogos',
    name: 'Linear Pogos',
    focus: 'linear bounce, ankle stiffness',
    pools: ['bounce-linear'],
    cues: [
      'Pretend you are a pogo stick.',
      'Bounce on the balls of your feet. Little knee bend.',
      'Ankles do the work. Hips stay quiet.',
      'Quick off the floor. Quiet off the floor.',
      'Same spot, or tiny hops forward if the room is clear.',
    ],
    demoNotes: 'Side view. Stiff ankles, minimal knee flex, rapid ground contact.',
    safetyStop: 'Stop if contacts get loud, knees start folding, or the rhythm breaks.',
    sourceRef: 'gemini-seed; yt-hpVVHxmB61c@00:28',
    difficulty: 2,
    extra: false,
    sets: 3,
    work: 16,
    restSec: 40,
    mode: 'reps',
    workUnit: 'reps',
  },
  {
    id: 'power-skips',
    name: 'Power Skips',
    focus: 'linear bounce, skip variation',
    pools: ['bounce-linear'],
    cues: [
      'Skip like you are proud.',
      'Drive one knee up. Push the floor away with the other leg.',
      'Reach the sky with the opposite arm.',
      'Soft land. Then skip again.',
      'In a hallway: three to five skips, walk back.',
    ],
    demoNotes: 'Side view skip with hip extension and knee drive. Living-room: 4 skips + walk-back.',
    safetyStop: 'Stop if reaching for the ceiling, landing heavy, or losing skip rhythm.',
    sourceRef: 'gemini-seed; yt-hpVVHxmB61c@02:35',
    difficulty: 2,
    extra: false,
    sets: 3,
    work: 6,
    restSec: 50,
    mode: 'reps',
    workUnit: 'reps',
  },
  {
    id: 'skater-hops-hold',
    name: 'Skater Hops (Hold)',
    focus: 'lateral, landing',
    pools: ['hard-lateral'],
    cues: [
      'Load one leg. Sit a little.',
      'Hop sideways onto the other foot. Like a stride.',
      'Land quiet. Hold three seconds. No wobble party.',
      'Swing the free leg behind you, not around the front.',
      'Small hops first. Bigger only when the hold is easy.',
    ],
    demoNotes: '3/4 view. Push off, land one leg, freeze 3s, hop back. Reset between hops.',
    safetyStop: 'Stop if landing knee caves, hold under two seconds, or hopping toward furniture.',
    sourceRef: 'gemini-seed; yt-0E7arQvGKIU@03:50',
    difficulty: 2,
    extra: false,
    sets: 3,
    work: 5,
    restSec: 50,
    mode: 'reps',
    workUnit: 'reps',
  },
  {
    id: 'lateral-pogos',
    name: 'Lateral Pogos',
    focus: 'lateral, linear bounce',
    pools: ['bounce-lateral'],
    cues: [
      'Same pogo stick. Now hop side to side.',
      'Tiny jumps over an imaginary line.',
      'Ankles springy. Knees quiet.',
      'Quick, quiet, even.',
      'Stay over your mat. Do not chase the hop.',
    ],
    demoNotes: 'Front view. Two-foot side-to-side ankle hops over a taped line.',
    safetyStop: 'Stop if jumping high, sliding, or knocking into a table.',
    sourceRef: 'gemini-seed; usa-hockey',
    difficulty: 2,
    extra: false,
    sets: 3,
    work: 14,
    restSec: 40,
    mode: 'reps',
    workUnit: 'reps',
  },
  {
    id: 'jumping-lunges',
    name: 'Jumping Lunges',
    focus: 'linear bounce, higher-intent',
    pools: ['hard-linear'],
    cues: [
      'Start in a reverse lunge. Tall chest.',
      'Jump. Switch feet in the air.',
      'Land soft in the other lunge. Then explode again.',
      'This is not a race. This is a clean switch.',
      'Fresh legs only. Few reps.',
    ],
    demoNotes: 'Side view. Reverse-lunge start, jump, switch, quiet land. Cap set at 5.',
    safetyStop: 'Stop if front knee caves, land is loud, or form fades on rep 3.',
    sourceRef: 'gemini-seed; usa-hockey; hockeytraining',
    difficulty: 3,
    extra: false,
    sets: 3,
    work: 4,
    restSec: 75,
    mode: 'reps',
    workUnit: 'reps',
  },
  {
    id: 'squat-jumps',
    name: 'Squat Jumps',
    focus: 'linear bounce, higher-intent',
    pools: ['hard-linear'],
    cues: [
      'Sit to a small squat. Chest proud.',
      'Jump up a little. Not to the ceiling.',
      'Land quiet in the same squat. Stick it.',
      'Reset. Then the next one.',
      'Soft floor. Soft feet.',
    ],
    demoNotes: 'Side view. Quarter-squat, jump, quiet absorb, two-count stick, reset.',
    safetyStop: 'Stop if landings get loud, knees cave, heels slam, or chasing height.',
    sourceRef: 'gemini-seed; usa-hockey; hockeytraining',
    difficulty: 3,
    extra: false,
    sets: 3,
    work: 5,
    restSec: 75,
    mode: 'reps',
    workUnit: 'reps',
  },
  {
    id: 'athletic-stance',
    name: 'Athletic Stance (Hockey Ready)',
    focus: 'warm-up, landing',
    pools: ['warmup', 'landing'],
    cues: [
      'Feet as wide as your shoulders.',
      'Soft knees. Soft ankles. Sit a little.',
      'Chest up. Head up. Hands ready.',
      'You look like a player waiting for a faceoff.',
      'Hold. Breathe. Do not lock your knees.',
    ],
    demoNotes: 'Front + side. Drop into hockey-ready quarter squat, hold, stand, repeat.',
    safetyStop: 'Stop if knees cave, heels lift and stay up, or low back rounds.',
    sourceRef: 'usa-hockey',
    difficulty: 1,
    extra: true,
    sets: 2,
    work: 20,
    restSec: 20,
    mode: 'hold',
    workUnit: 'sec',
  },
  {
    id: 'hop-and-stick',
    name: 'Hop and Stick',
    focus: 'landing',
    pools: ['landing'],
    cues: [
      'Two-foot hop. Tiny.',
      'Land like a ninja. No sound.',
      'Stick two seconds. Do not bounce away.',
      'Knees soft. Toes straight.',
      'Forward, then sideways, then stay in one spot.',
    ],
    demoNotes: 'Front view. Small two-foot hop, freeze on landing, hold 2s.',
    safetyStop: 'Stop if the stick fails, landings get loud, or hopping toward furniture.',
    sourceRef: 'usa-hockey',
    difficulty: 1,
    extra: true,
    sets: 2,
    work: 5,
    restSec: 35,
    mode: 'reps',
    workUnit: 'reps',
  },
  {
    id: 'single-leg-balance',
    name: 'Single-Leg Balance',
    focus: 'warm-up, landing',
    pools: ['landing'],
    cues: [
      'Stand on one foot. Soft knee.',
      'Other foot hovers. Hands out like airplane wings if you need them.',
      'Eyes on one spot.',
      'Do not hop to save it. Put the foot down and restart.',
      'Harder: reach the free foot forward, then side.',
    ],
    demoNotes: 'Front view. Quiet single-leg stand, slow reach forward and side.',
    safetyStop: 'Stop if standing knee caves or hopping around the room.',
    sourceRef: 'usa-hockey',
    difficulty: 1,
    extra: true,
    sets: 2,
    work: 20,
    restSec: 20,
    mode: 'hold',
    workUnit: 'sec',
  },
  {
    id: 'dead-bug',
    name: 'Dead Bug',
    focus: 'core',
    pools: ['core'],
    cues: [
      'On your back. Arms up. Knees bent like a table.',
      'Press your low back into the mat. Pretend a bug is under it.',
      'Lower one arm and the opposite leg. Slow.',
      'Come back. Switch.',
      'If your back pops up, make the move smaller.',
    ],
    demoNotes: 'Side/top. Supine opposite arm/leg reach, ribs down, slow tempo.',
    safetyStop: 'Stop if low back arches, neck strains, or rushing.',
    sourceRef: 'usa-hockey',
    difficulty: 1,
    extra: true,
    sets: 2,
    work: 5,
    restSec: 30,
    mode: 'reps',
    workUnit: 'reps',
  },
  {
    id: 'bird-dog',
    name: 'Bird Dog',
    focus: 'core',
    pools: ['core'],
    cues: [
      'Hands under shoulders. Knees under hips.',
      'Slide one arm forward. Slide the opposite leg back.',
      'Hold five seconds. Hips stay level. No wiggle.',
      'Come back. Switch.',
      'Pretend a glass of water sits on your back.',
    ],
    demoNotes: 'Side view. Quadruped opposite arm/leg, flat back, 5-second hold.',
    safetyStop: 'Stop if low back sags, hip hikes, or cannot hold still.',
    sourceRef: 'usa-hockey',
    difficulty: 1,
    extra: true,
    sets: 2,
    work: 4,
    restSec: 30,
    mode: 'reps',
    workUnit: 'reps',
  },
  {
    id: 'wall-sit',
    name: 'Wall Sit',
    focus: 'lower body, isometric',
    pools: ['lower-iso'],
    cues: [
      'Back on the wall. Slide down.',
      'Knees over ankles. Thighs like a chair.',
      'Heels down. Hands off your legs.',
      'Breathe. Smile at the clock.',
      'Stand up slow when time is up.',
    ],
    demoNotes: 'Side view. Slide to ~90° or higher chair-sit. Timer overlay.',
    safetyStop: 'Stop if knees cave, sharp pain, or heels lift.',
    sourceRef: 'gemini-seed extra; usa-hockey',
    difficulty: 1,
    extra: true,
    sets: 2,
    work: 25,
    restSec: 40,
    mode: 'hold',
    workUnit: 'sec',
  },
  {
    id: 'bodyweight-squat',
    name: 'Bodyweight Squat',
    focus: 'lower body, warm-up',
    pools: ['lower-iso'],
    cues: [
      'Toes ahead. Feet under you.',
      'Arms reach forward. Chest tall.',
      'Sit hips back. Heels stay down.',
      'Stop at a comfy squat. Then stand.',
      'Smooth. Not a bounce.',
    ],
    demoNotes: 'Side view. Default chair-height squat. No jump.',
    safetyStop: 'Stop if heels pop, knees cave, or chest collapses.',
    sourceRef: 'usa-hockey',
    difficulty: 1,
    extra: true,
    sets: 2,
    work: 8,
    restSec: 30,
    mode: 'reps',
    workUnit: 'reps',
  },
  {
    id: 'light-skips',
    name: 'Light Skips',
    focus: 'warm-up, skip variation',
    pools: ['warmup', 'bounce-linear'],
    cues: [
      'Easy skip. Small bounce.',
      'Soft feet. Happy rhythm.',
      'Knee up a little. Not a power skip.',
      'Hallway or in place if the room is short.',
      'Smile. This is the on-ramp.',
    ],
    demoNotes: 'Side view. Low-amplitude skip, opposite arm, no max height.',
    safetyStop: 'Stop if chasing height or clipping a light.',
    sourceRef: 'usa-hockey',
    difficulty: 1,
    extra: true,
    sets: 2,
    work: 15,
    restSec: 25,
    mode: 'timed',
    workUnit: 'sec',
  },
  {
    id: 'lateral-ski-jumps',
    name: 'Lateral Ski Jumps',
    focus: 'lateral',
    pools: ['bounce-lateral'],
    cues: [
      'Two feet together. Soft knees.',
      'Hop over a sock or a taped line.',
      'Land two feet. Quiet. Soft hips.',
      'Use your arms for balance.',
      'Small first. You are skiing moguls, not flying.',
    ],
    demoNotes: 'Front view. Two-foot side-to-side hop over a sock. Soft land.',
    safetyStop: 'Stop if landings get loud, clipping furniture, or one-leg chasing.',
    sourceRef: 'usa-hockey',
    difficulty: 2,
    extra: true,
    sets: 2,
    work: 8,
    restSec: 45,
    mode: 'reps',
    workUnit: 'reps',
  },
  {
    id: 'chaotic-hops',
    name: 'Chaotic Hops',
    focus: 'lateral, linear bounce, rhythm',
    pools: ['bounce-lateral'],
    cues: [
      'Stay on your mat. Two-foot hops.',
      'Forward. Back. Side. Diagonal. Mix it up.',
      'Quiet land every time. Bend and use your arms.',
      'Thirty seconds is plenty.',
      'This is a game, not a grind.',
    ],
    demoNotes: '3/4 view of taped square. Two-foot hops to random points, always quiet.',
    safetyStop: 'Stop at the first sloppy or loud landing.',
    sourceRef: 'usa-hockey',
    difficulty: 2,
    extra: true,
    sets: 2,
    work: 20,
    restSec: 40,
    mode: 'timed',
    workUnit: 'sec',
  },
  {
    id: 'bear-crawl',
    name: 'Bear Crawl',
    focus: 'core, warm-up',
    pools: ['core'],
    cues: [
      'Hands and feet. Knees hover.',
      'Back flat like a table.',
      'Opposite hand and foot move together.',
      'Slow is strong. Tiny steps.',
      'In a living room: four steps forward, four back.',
    ],
    demoNotes: 'Side view. Quadruped hover, opposite limbs, short living-room shuttle.',
    safetyStop: 'Stop if knees slam, back sags, or wrists hurt.',
    sourceRef: 'usa-hockey',
    difficulty: 2,
    extra: true,
    sets: 2,
    work: 15,
    restSec: 30,
    mode: 'timed',
    workUnit: 'sec',
  },
  {
    id: 'glute-bridge-march',
    name: 'Glute Bridge March',
    focus: 'core, lower body',
    pools: ['core'],
    cues: [
      'On your back. Feet on the floor. Hands by your sides.',
      'Lift your hips. Make a straight line from knees to shoulders.',
      'March one foot up a little. Set it down. Switch.',
      'Hips stay high. No rock and roll.',
      'Squeeze your seat.',
    ],
    demoNotes: 'Side view. Bridge hold, then a small march.',
    safetyStop: 'Stop if low back kinks, knees cave, or hips crash.',
    sourceRef: 'usa-hockey',
    difficulty: 1,
    extra: true,
    sets: 2,
    work: 25,
    restSec: 30,
    mode: 'timed',
    workUnit: 'sec',
  },
  {
    id: 'multi-directional-jumps',
    name: 'Multi-Directional Jumps',
    focus: 'landing, linear bounce, lateral',
    pools: ['bounce-lateral'],
    cues: [
      'Four socks in a small diamond. You stand in the middle.',
      'Hop over one sock. Hop back to the middle.',
      'Next sock. All the way around.',
      'Two feet. Quiet. Stick or quick reset.',
      'That whole diamond is one rep.',
    ],
    demoNotes: 'Top view. Four markers, two-foot hop out and back, four directions.',
    safetyStop: 'Stop if hops get huge, loud, or leave the diamond.',
    sourceRef: 'usa-hockey',
    difficulty: 2,
    extra: true,
    sets: 2,
    work: 3,
    restSec: 50,
    mode: 'reps',
    workUnit: 'reps',
  },
  {
    id: 'side-plank-lifts',
    name: 'Side Plank Lifts',
    focus: 'core',
    pools: ['core'],
    cues: [
      'Elbow under shoulder. Stack your feet, or stack your knees.',
      'Lift hips. Ear, shoulder, hip in one line.',
      'Pause two seconds. Lower with control.',
      'Tight belly. Squeeze your seat.',
      'Knees are a good start.',
    ],
    demoNotes: 'Forearm side plank from knees first. Lift, 2s pause, lower.',
    safetyStop: 'Stop if shoulder hurts, hip sags, or holding breath.',
    sourceRef: 'usa-hockey',
    difficulty: 2,
    extra: true,
    sets: 2,
    work: 20,
    restSec: 30,
    mode: 'hold',
    workUnit: 'sec',
  },
]

export const EXERCISES: Exercise[] = RAW.map((r) => {
  const kind = mapKind(r.focus, r.id)
  const qualityCue = r.safetyStop
  const workSec =
    r.mode === 'reps' ? Math.max(15, Math.round(r.work * 2.5)) : r.work
  const estSecPerSet = workSec + r.restSec
  return { ...r, kind, qualityCue, estSecPerSet }
})

export const EXERCISE_IDS = EXERCISES.map((e) => e.id)

export const POOLS: Record<ExercisePool, string[]> = {
  warmup: ['athletic-stance', 'high-knees', 'light-skips', 'snap-downs'],
  landing: ['snap-downs', 'hop-and-stick', 'single-leg-balance', 'athletic-stance'],
  'bounce-linear': ['linear-pogos', 'power-skips', 'light-skips'],
  'bounce-lateral': [
    'lateral-pogos',
    'lateral-ski-jumps',
    'chaotic-hops',
    'multi-directional-jumps',
  ],
  'hard-linear': ['squat-jumps', 'jumping-lunges'],
  'hard-lateral': ['skater-hops-hold'],
  core: ['dead-bug', 'bird-dog', 'glute-bridge-march', 'bear-crawl', 'side-plank-lifts'],
  'lower-iso': ['wall-sit', 'bodyweight-squat'],
}

/** Ids Carl said never to auto-pick (should not appear in the 22). */
export const SKIP_AUTO_PICK = new Set([
  'ladder',
  'puck',
  'pass',
  'shoot',
  'depth-drop',
  'box-jump',
  'hurdle-hop',
  'jump-rope',
  'burpee',
])

export function getExercise(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id)
}

export function exercisesByPool(pool: ExercisePool): Exercise[] {
  return EXERCISES.filter((e) => e.pools.includes(pool))
}

export function estimateMinutes(exerciseIds: string[]): number {
  let sec = 0
  for (const id of exerciseIds) {
    const ex = getExercise(id)
    if (ex) sec += ex.sets * ex.estSecPerSet
  }
  return Math.max(1, Math.round(sec / 60))
}

export function estimatePrescriptionsMinutes(
  items: { sets: number; work: number; restSec: number; mode: PhaseMode }[],
): number {
  let sec = 0
  for (const p of items) {
    const workSec =
      p.mode === 'reps' ? Math.max(15, Math.round(p.work * 2.5)) : p.work
    sec += p.sets * (workSec + p.restSec)
  }
  return Math.max(1, Math.round(sec / 60))
}

export const POOL_LABELS: Record<ExercisePool, string> = {
  warmup: 'Warm-up',
  landing: 'Landing',
  'bounce-linear': 'Bounce · linear',
  'bounce-lateral': 'Bounce · lateral',
  'hard-linear': 'Hard · linear',
  'hard-lateral': 'Hard · lateral',
  core: 'Core',
  'lower-iso': 'Lower iso',
}

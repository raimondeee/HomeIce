/**
 * Optional curriculum JSON loader (public/curriculum/exercises.json).
 * Hardcoded src/data/exercises.ts is the source of truth for the runner.
 * v3+ may include equipment + youtubeUrl overlays (Carl fills only).
 */

export interface CurriculumExerciseOverlay {
  id: string
  equipment?: 'bodyweight' | 'light-db-kb'
  youtubeUrl?: string
  youtubeShortId?: string
}

export interface CurriculumJson {
  version?: number
  ids?: string[]
  exercises?: CurriculumExerciseOverlay[]
}

export async function tryLoadCurriculumJson(): Promise<CurriculumJson | null> {
  try {
    const res = await fetch('./curriculum/exercises.json', { cache: 'no-store' })
    if (!res.ok) return null
    return (await res.json()) as CurriculumJson
  } catch {
    return null
  }
}

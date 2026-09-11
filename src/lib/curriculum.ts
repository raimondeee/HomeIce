/**
 * Optional curriculum JSON loader (public/curriculum/exercises.json).
 * Hardcoded src/data/exercises.ts is the source of truth for the runner.
 */
export async function tryLoadCurriculumJson(): Promise<unknown | null> {
  try {
    const res = await fetch('./curriculum/exercises.json', { cache: 'no-store' })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

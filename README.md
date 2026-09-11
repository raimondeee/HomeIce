# HomeIce

Youth hockey dryland trainer (web + Android) for ages ~10–12.

```bash
npm install
npm run dev      # Vite
npm run build    # → dist/
npm run preview
npm run sync     # build + cap sync android
npm run android:build
```

- Web: `dist/` — GitHub Pages deploys from `main`
- Android project: `android/` (appId `com.robertraimondi.homeice`)
- Curriculum: `src/data/exercises.ts`, `src/data/workouts.ts`, `src/lib/planner.ts`
- Curriculum index: `public/curriculum/exercises.json` (v3, 29 exercises)

## Demos

Stick-figure SVG demos were removed. Offline session demos use a bouncing **pace ball** metronome plus coach cues. When Carl listed a `youtubeUrl`, the runner embeds that YouTube Short (or opens it). No extra Shorts beyond Carl’s seven fills.

## Equipment

Settings: **bodyweight** (default) or **light DB/KB**. The library and auto-plan filter to what you have. Loaded moves (goblet squat, RDLs, split-squat iso, and similar) appear when light DB/KB is selected.

## Version

App `1.3.0`. Android `versionCode` 4 / `versionName` 1.3.

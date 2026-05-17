# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at http://localhost:5173
npm run build     # Production build → dist/
npm run lint      # ESLint check
npm run preview   # Preview production build locally
```

There is no test suite.

## What this app is

**SH8DONE** is a gamified productivity PWA with a retro space/pixel aesthetic. Users create "missions" (tasks), complete them to earn points, and progress through a zone exploration system. The Spanish-language UI is intentional — the app's text, labels, and overlay copy are all in Spanish.

## Architecture

### State management: single Zustand store

`src/store/useGameStore.js` is the entire application state. It uses `zustand/persist` with key `sh8done-v2` (localStorage). All game logic lives here: mission CRUD, scoring, streaks, pomodoro state, toast queue, level-up queue, badge queue, and zone event queue.

**Critical lifecycle calls** that must run once on app mount (done in `App.jsx`'s `AppInner`):
- `_hydrate()` — syncs audio settings from persisted state to the audio module
- `migrateOldZones()` — silently renames legacy `rubroId` field to `zoneId` in all missions

**Event queues** (`levelUpQueue`, `badgeQueue`, `zoneEventQueue`) are arrays consumed one item at a time by overlay components in `App.jsx`. Transient UI state (toasts, queue items) is excluded from persistence via `partialize`.

### Routing

React Router v7 with 5 routes: `/splash`, `/home`, `/missions`, `/dashboard`, `/profile`. All routes default-redirect to `/splash`. `BottomNav` is hidden on the splash screen via `NavGuard`.

Screen transitions use Framer Motion's `AnimatePresence` with `mode="wait"` — all screens are wrapped in `AnimatedPage`.

### Zone system (`src/utils/zones.js`)

The core domain model. Seven psychological "zones" replace the old "rubros" system:

| id | mult | emoji |
|----|------|-------|
| mision | 3× | 🎯 |
| cuerpo | 2× | 💪 |
| mente | 2.5× | 🧠 |
| vinculos | 2× | 🤝 |
| descanso | 1.5× | 🌙 |
| creacion | 3× | 🎨 |
| hogar | 1.5× | 🏠 |

Zone states: `unexplored` (0–9 pts) → `discovered` (10–49 pts) → `colonized` (≥50 pts). State transitions trigger overlay animations and SFX.

`migrateZone(id)` maps legacy rubro ids to zone ids and is called defensively throughout the codebase wherever a `zoneId` might be an old `rubroId`.

### Scoring formula (`src/utils/scoring.js`)

```
base = (minutes / 10) × zone_multiplier
pts  = round(base × (1 + streakBonus + pomoBonus))
```

- `streakBonus` = `min(streak × 0.05, 1.0)` (caps at +100%)
- `pomoBonus`   = `min(pomosCompleted × 0.1, 0.5)` (caps at +50%)

### Pomodoro (`src/hooks/usePomodoro.js`)

`PomodoroContext` is provided at the `AppInner` level so the floating `PomodoroBar` and `MissionCard` share the same timer instance. Use `usePomodoro()` (not `usePomodoroProvider()`) to consume it in child components.

### Audio (`src/utils/sounds.js`)

All sound effects are synthesized at runtime via Web Audio API — no audio files. `AudioContext` is lazy-initialized on the first user `pointerdown` event (iOS Safari requirement). The `SFX` object exposes named methods; call them directly. `_masterVolume` and `_soundEnabled` are module-level variables synced from the store via `setMasterVolume` / `setSoundEnabled`.

### Particle system

`ParticleSystem` is a `forwardRef` component. `particleRef.current.burst(x, y, count, color)` spawns particles at screen coordinates; `particleRef.current.rain(count)` triggers a full-screen celebration rain. Both `Home` and `Missions` receive `particleRef` as a prop and pass it to `MissionCard`.

## Design system

All styling is inline CSS using CSS custom properties defined in `src/styles/globals.css`. Tailwind is available but barely used — prefer CSS variables.

**Color tokens:** `--bg`, `--bg2`, `--bg3` (backgrounds), `--cyan`, `--pink`, `--gold`, `--green`, `--purple` (accent), `--text`, `--muted` (text), `--dim` (borders/inactive).

**Zone colors:** `--zone-{id}` for each zone id (e.g. `--zone-mision`).

**Fonts:** `--font-title` (Orbitron, headings), `--font-ui` (Press Start 2P, labels/badges — 7–8px), `--font-body` (Orbitron, body text).

**Pixel shape:** The characteristic clipped-corner shape is `clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)'`. Smaller variant uses `4px` offsets for buttons.

**Utility classes defined in globals.css:** `.pressable`, `.ship-float`, `.score-breathe`, `.streak-pulse`, `.fab-breathe`, `.typewriter-text`, `.badge-appear`.

## Deployment

Deployed to Netlify. `netlify.toml` sets `npm run build` as the build command with `dist/` as the publish dir, and adds a catch-all redirect to `index.html` for SPA routing.

## Data migration

The store runs a Zustand `migrate` function (version 0 → 1) that merges persisted data with `defaultState`. `migrateOldZones()` handles field-level migration of `rubroId → zoneId` in existing mission objects. Both must be preserved when touching store schema.

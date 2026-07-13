# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.1] - 2026-07-13

### Added
- Credits footer on the title and pause screens: "Made by Kevin Peckham @ Lightning Jar in Philadelphia." with a link to lightningjar.com, plus an "About this game" link
- About page (`/about`, prerendered): what the game is, how to play, credits, and links to the "Arcade Game with No Game Loop" blog post and the GitHub repo

## [0.3.0] - 2026-07-13

### Added
- Levels: every 10 hits (`HITS_PER_LEVEL`) completes a level — the field clears, a momentary "Level N" banner announces the next level, then donuts resume falling
- Tetris-style difficulty ramp (`src/lib/utils/difficulty.ts`): each level shrinks donut fall duration and the average time between drops by `LEVEL_SPEEDUP_FACTOR` (0.95/level); drop timing gets ±25% random jitter (`DROP_INTERVAL_JITTER`)
- Win state: completing level 20 (`MAX_LEVEL`) shows a "You Win!" screen with CSS confetti and a Play Again button (new `"won"` game status)

### Changed
- Bullets shrink as they climb (down to `BULLET_MIN_SCALE` at the top of the screen) and disappear the moment they hit a donut, replacing the brief red flash
- Each donut now captures its own `fallDuration` at drop time; the sprite tween, miss timer, and bullet-intercept math all read from it
- Donuts no longer show their id number below the sprite (dev leftover); the label element remains for the "huh?" miss flourish
- The level counter resets on new game (it previously never did)

## [0.2.1] - 2026-07-13

### Changed
- Starting a game always requires clicking Play / New Game again — the auto-start-from-title-screen behavior shipped in 0.2.0 is removed (clarified requirement)
- After starting, the first donut now drops after a 1.25s initial delay (`INITIAL_DROP_DELAY`) instead of waiting a full 3.2s drop interval

## [0.2.0] - 2026-07-13

Rebranded from **Donut Hunter** to **Donut Shooter** (production domain: www.donutshooter.com); package and GitHub repo renamed **donut-hunter** → **donut-shooter**.

### Added
- Spacebar fires (one shot per press; held-key auto-repeat is ignored)
- The game auto-starts from the title screen after a two-second delay (`AUTO_START_DELAY`) instead of waiting for the Play button

### Changed
- Bullet hits now register at the moment the bullet visually reaches the donut (computed from the two rendered tween trajectories) instead of after a fixed 100ms delay; the donut's explosion sequence and the score tick start at contact. `BULLET_HIT_DELAY` is replaced by the intercept math in `src/lib/utils/intercept.ts`
- Resizing the window pauses the game, clearing the field — donut timers and fall tweens both capture the viewport when they start, so a mid-flight resize would let the game state and the animation disagree

## [0.1.0] - 2026-07-13

Project revival. Renamed from **leo-game** to **donut-hunter**; the game itself is now titled **Donut Hunter**.

### Changed
- Migrated Svelte 3 → Svelte 5 (runes API throughout: `$state`, `$derived`, `$props`, `$effect`); SvelteKit 1 → 2; Vite 4 → 8; TypeScript 4 → 6
- Replaced TailwindCSS + PostCSS + autoprefixer with UnoCSS (`presetWind3`, Tailwind-compatible utilities)
- Replaced Prettier + ESLint with Biome for formatting and linting
- Replaced Playwright scaffold with Vitest 4: node project for unit tests, jsdom + Testing Library for component tests
- Switched package manager to Bun; deployment adapter to `@sveltejs/adapter-vercel`
- Removed Pug — all components are plain Svelte templates now
- Rewrote game logic into a central runes store (`src/lib/stores/game.svelte.ts`): donut dropping, shooting, hit/miss resolution, pause/resume/reset, and game over all live in one tested state machine instead of being spread across components and a dozen writable stores
- Flattened the component tree (no more atoms/molecules directories)

### Added
- Unit and component test suite (46 tests) covering helpers, viewport math, the game state machine, header, overlay, and the game page
- fallow for code-integrity checks (dead code, duplication, dependency audit)
- cspell configuration, README, CHANGELOG, CLAUDE.md, and a real error page

### Removed
- Dead code from the prototype phase: `DonutDropper.svelte` (duplicated drop logic), empty `shooterFunctions.ts`, unused player/shot/position stores, starter-template images, and the debug yellow background flash on a missed donut

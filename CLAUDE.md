# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important Instructions

- **Never include "Generated with Claude Code" or "Co-Authored-By" statements in commit messages**
- **Always use Svelte 5 runes API** ($state, $props, $derived, $effect) - no legacy stores
- **Component structure is flattened** - components are directly in `/src/lib/components/` (no atoms/molecules/organisms subdirectories)
- **Always format and lint before committing** - Run `bun run format` and `bun run lint` before any commit
- **Default branch is `main`** - The primary branch is `main` (not `master`)
- **When bumping versions**, always:
  1. Update version in `package.json`
  2. Update `CHANGELOG.md` with changes
  3. Create a version bump commit

## Project Overview

Donut Hunter (donut-hunter) is a small browser arcade game: donuts rain from the top of the screen and the player moves a shooter along the ground with the mouse, clicking to shoot donuts before they land. Three missed donuts ends the game.

**Branding**:
- Product name: "Donut Hunter" (used in the UI)
- Technical name: "donut-hunter" (package.json, GitHub repo, infrastructure)

## Architecture

All game logic lives in two runes stores; components are presentational:

- `src/lib/stores/game.svelte.ts` — the game state machine: status (ready/playing/paused/over), donuts, bullets, stats, and every transition (`startNewGame`, `pauseGame`, `resumeGame`, `resetGame`, `dropDonut`, `shoot`). Timers are module-level, outside reactive state.
- `src/lib/stores/viewport.svelte.ts` — window size + pointer tracking and derived sizes (donut size, shooter size/position, fall distance/duration).
- `src/lib/settings/gameSettings.ts` — all gameplay tuning constants (speeds, timings, sizes, rules, colors).
- `src/routes/+page.svelte` — binds window size, routes input (mousedown → shoot, Escape → pause, window resize → pause), renders the field.
- Sprites (`DonutSprite`, `BulletSprite`) animate with `Tween` from `svelte/motion`; state changes come from the store.

**Stack**:
- **Package manager**: Bun 1.x
- **Framework**: Svelte 5 (runes), SvelteKit 2.x
- **Language**: TypeScript 6.x
- **Styling**: UnoCSS with Wind preset (Tailwind-compatible)
- **Code quality**: Biome 2.x (`bun run format`, `bun run lint`), svelte-check, cspell, fallow (`bun run audit`, `bun run health`)
- **Testing**: Vitest 4 + Testing Library
  - Unit tests: `src/**/*.test.ts` (node environment)
  - Component / runes-store tests: `src/**/*.svelte.test.ts` (jsdom + @testing-library/svelte)
  - `bun run test`, `bun run test:watch`, `bun run test:coverage`
- **Deployment**: Vercel (`@sveltejs/adapter-vercel`), prerendered shell

## Key Commands

- `bun dev` - Start development server
- `bun run build` - Build for production
- `bun run test` - Run all tests
- `bun run check` - Type-check with svelte-check
- `bun run format` / `bun run lint` - Biome
- `bun run health` / `bun run audit` - fallow code-integrity checks

## Testing Notes

- `vitest-setup.ts` stubs `Element.prototype.animate` and `window.matchMedia` (jsdom lacks both; Svelte 5 transitions and svelte/motion need them)
- `uno.css` is a virtual module from the UnoCSS vite plugin; vitest aliases it to `test-stubs/uno.css`
- Game-store tests use fake timers and mock `$utils/sound` (jsdom cannot play audio)

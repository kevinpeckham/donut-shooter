# Donut Hunter

A small browser arcade game. Donuts rain from the sky — move the shooter with your mouse and click to shoot them down before they hit the ground. Miss three and it's game over. 🍩

## How to Play

- **Move**: the shooter follows your mouse along the ground
- **Shoot**: click anywhere
- **Pause**: press Escape, or use the pause button in the header
- **Reset**: use the reset button in the header
- Resizing the window pauses the game (in-flight donuts are discarded)

## Stack

- [SvelteKit 2](https://svelte.dev/docs/kit) + [Svelte 5](https://svelte.dev) (runes)
- [UnoCSS](https://unocss.dev) (Tailwind-compatible `presetWind3`)
- [Vite 8](https://vite.dev) + [Bun](https://bun.sh)
- [Biome](https://biomejs.dev) for lint + format
- [Vitest 4](https://vitest.dev) — node project for unit tests, jsdom + [@testing-library/svelte](https://testing-library.com/docs/svelte-testing-library/intro/) for component tests
- [fallow](https://docs.fallow.tools) for code-integrity checks

## Develop

```sh
bun install
bun run dev
```

## Test & checks

```sh
bun run test           # unit + component tests
bun run test:coverage  # with v8 coverage
bun run check          # svelte-check
bun run lint           # biome
bun run health         # fallow health report
```

## Architecture

Game logic is centralized in two runes stores; components are presentational:

- `src/lib/stores/game.svelte.ts` — the game state machine (statuses, donuts, bullets, stats, and all transitions)
- `src/lib/stores/viewport.svelte.ts` — window/pointer tracking and viewport-derived sizes
- `src/lib/settings/gameSettings.ts` — gameplay tuning constants

## Deploy

Deployed to Vercel via `@sveltejs/adapter-vercel`; the shell is prerendered.

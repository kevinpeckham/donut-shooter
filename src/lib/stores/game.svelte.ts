// Central game state and logic (Svelte 5 runes).

import {
	donutMaxTravelDistance,
	donutMaxTravelDuration,
	donutSize,
	shooterSize,
	shooterX,
	viewport,
} from "$stores/viewport.svelte";

import { levelSpeedMultiplier, nextDropDelay } from "$utils/difficulty";
import { getRandomInt } from "$utils/helpers";
import { bulletInterceptDelay } from "$utils/intercept";
import { playSound } from "$utils/sound";

import {
	BULLET_FLIGHT_DURATION,
	HEADER_HEIGHT,
	HITS_PER_LEVEL,
	INITIAL_DROP_DELAY,
	LEVEL_BANNER_DURATION,
	MAX_HEALTH,
	MAX_LEVEL,
	MAX_MISSES,
	TIME_BEFORE_HIT_DONUT_DISAPPEARS,
	TIME_BEFORE_HIT_DONUT_TURNS_TO_SMOKE,
	TIME_BEFORE_MISSED_DONUT_DISAPPEARS,
} from "$settings/gameSettings";

export type GameStatus = "ready" | "playing" | "paused" | "over" | "won";
export type DonutStatus = "dropped" | "hit" | "missed" | "spent";
export type BulletStatus = "fired" | "hit" | "spent";

export interface Donut {
	id: number;
	x: number;
	status: DonutStatus;
	content: string;
	label: string;
	opacity: number;
	rotate: number;
	droppedAt: number;
	/** ms this donut takes to reach the ground, captured at drop time. */
	fallDuration: number;
}

export interface Bullet {
	id: number;
	x: number;
	status: BulletStatus;
	color: string;
	opacity: number;
}

export const game = $state({
	status: "ready" as GameStatus,
	level: 1,
	/** Level number being announced between levels, or null. */
	levelBanner: null as number | null,
	health: MAX_HEALTH,
	donuts: [] as Donut[],
	bullets: [] as Bullet[],
	donutCount: 0,
	donutHits: 0,
	donutMisses: 0,
	shotCount: 0,
});

// Timers live outside reactive state: they are implementation detail, not UI
// state, and must be clearable without reactive tracking.
let pendingTimeouts: ReturnType<typeof setTimeout>[] = [];

function schedule(callback: () => void, delay: number): void {
	pendingTimeouts.push(setTimeout(callback, delay));
}

function clearAllTimers(): void {
	for (const timeout of pendingTimeouts) clearTimeout(timeout);
	pendingTimeouts = [];
}

function startDropping(): void {
	// first donut after a short initial delay, then on the level's cadence
	schedule(() => {
		dropDonut();
		scheduleNextDrop();
	}, INITIAL_DROP_DELAY);
}

function scheduleNextDrop(): void {
	schedule(() => {
		dropDonut();
		scheduleNextDrop();
	}, nextDropDelay(game.level));
}

/** Drop a new donut from a random x position. */
export function dropDonut(): void {
	const donut: Donut = {
		id: game.donutCount,
		x: getRandomInt(0, Math.max(0, viewport.width - donutSize())),
		status: "dropped",
		content: "🍩",
		label: "",
		opacity: 1,
		rotate: 0,
		droppedAt: Date.now(),
		fallDuration: donutMaxTravelDuration() * levelSpeedMultiplier(game.level),
	};
	game.donuts.push(donut);
	game.donutCount++;
	// a donut not shot before it reaches the ground counts as a miss
	schedule(() => missDonut(donut.id), donut.fallDuration);
}

function missDonut(id: number): void {
	if (game.status !== "playing") return;
	const donut = game.donuts.find((d) => d.id === id);
	if (donut?.status !== "dropped") return;
	donut.status = "missed";
	donut.content = "👽";
	donut.label = "huh?";
	game.donutMisses++;
	game.health = Math.max(0, game.health - 1);
	schedule(() => {
		donut.status = "spent";
	}, TIME_BEFORE_MISSED_DONUT_DISAPPEARS);
	if (game.donutMisses >= MAX_MISSES) endGame();
}

function hitDonut(donut: Donut, bullet: Bullet): void {
	// claim the donut immediately (hitscan) so the miss timer cannot also
	// fire for it; the visible reaction waits until the bullet gets there
	donut.status = "hit";
	const delay = bulletInterceptDelay({
		donutElapsed: Date.now() - donut.droppedAt,
		donutTravelDistance: donutMaxTravelDistance(),
		donutTravelDuration: donut.fallDuration,
		donutSize: donutSize(),
		headerHeight: HEADER_HEIGHT,
		viewportHeight: viewport.height,
		shooterSize: shooterSize(),
		bulletFlightDuration: BULLET_FLIGHT_DURATION,
	});
	schedule(() => {
		donut.opacity = 0.6;
		donut.label = "";
		game.donutHits++;
		// leaving "fired" unmounts the bullet — it disappears on impact
		if (bullet.status === "fired") bullet.status = "hit";
		if (game.donutHits % HITS_PER_LEVEL === 0) completeLevel();
	}, delay);
	schedule(() => {
		donut.content = "💨";
		donut.rotate = -90;
	}, delay + TIME_BEFORE_HIT_DONUT_TURNS_TO_SMOKE);
	schedule(
		() => {
			donut.status = "spent";
		},
		delay +
			TIME_BEFORE_HIT_DONUT_TURNS_TO_SMOKE +
			TIME_BEFORE_HIT_DONUT_DISAPPEARS,
	);
}

/** Fire a bullet from the shooter's current position. */
export function shoot(): void {
	if (game.status !== "playing") return;
	playSound("/audio/shot-01.mp3");
	game.shotCount++;
	// prune finished bullets so the array does not grow without bound
	game.bullets = game.bullets.filter((bullet) => bullet.status !== "spent");
	const x = shooterX();
	const bullet: Bullet = {
		id: game.shotCount,
		x,
		status: "fired",
		color: "#fff",
		opacity: 1,
	};
	game.bullets.push(bullet);
	schedule(() => {
		bullet.status = "spent";
	}, BULLET_FLIGHT_DURATION);
	const size = donutSize();
	const target = game.donuts.find(
		(donut) =>
			donut.status === "dropped" && x >= donut.x && x <= donut.x + size,
	);
	if (target) hitDonut(target, bullet);
}

/** Level complete: win the game after the final level, otherwise announce
 * the next level, then resume dropping at its faster cadence. */
function completeLevel(): void {
	if (game.level >= MAX_LEVEL) {
		winGame();
		return;
	}
	clearAllTimers();
	clearBoard();
	game.level++;
	game.levelBanner = game.level;
	schedule(() => {
		game.levelBanner = null;
		startDropping();
	}, LEVEL_BANNER_DURATION);
}

function winGame(): void {
	game.status = "won";
	clearAllTimers();
	clearBoard();
}

function clearBoard(): void {
	game.donuts = [];
	game.bullets = [];
}

function resetStats(): void {
	game.donutCount = 0;
	game.donutHits = 0;
	game.donutMisses = 0;
	game.shotCount = 0;
	game.health = MAX_HEALTH;
	game.level = 1;
	game.levelBanner = null;
}

export function startNewGame(): void {
	clearAllTimers();
	clearBoard();
	resetStats();
	game.status = "playing";
	startDropping();
}

/** Pause: in-flight donuts are discarded, stats are kept. */
export function pauseGame(): void {
	if (game.status !== "playing") return;
	game.status = "paused";
	game.levelBanner = null;
	clearAllTimers();
	clearBoard();
}

export function resumeGame(): void {
	if (game.status !== "paused") return;
	game.status = "playing";
	startDropping();
}

export function resetGame(): void {
	clearAllTimers();
	clearBoard();
	resetStats();
	game.status = "ready";
}

function endGame(): void {
	game.status = "over";
	clearAllTimers();
	clearBoard();
}

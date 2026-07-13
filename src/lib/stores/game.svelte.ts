// Central game state and logic (Svelte 5 runes).

import {
	donutMaxTravelDuration,
	donutSize,
	shooterX,
	viewport,
} from "$stores/viewport.svelte";

import { getRandomInt } from "$utils/helpers";
import { playSound } from "$utils/sound";

import {
	BULLET_FLIGHT_DURATION,
	BULLET_HIT_DELAY,
	MAX_HEALTH,
	MAX_MISSES,
	TIME_BEFORE_HIT_DONUT_DISAPPEARS,
	TIME_BEFORE_HIT_DONUT_TURNS_TO_SMOKE,
	TIME_BEFORE_MISSED_DONUT_DISAPPEARS,
	TIME_BETWEEN_DONUTS,
} from "$settings/gameSettings";

export type GameStatus = "ready" | "playing" | "paused" | "over";
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
let dropInterval: ReturnType<typeof setInterval> | undefined;
let pendingTimeouts: ReturnType<typeof setTimeout>[] = [];

function schedule(callback: () => void, delay: number): void {
	pendingTimeouts.push(setTimeout(callback, delay));
}

function clearAllTimers(): void {
	if (dropInterval) clearInterval(dropInterval);
	dropInterval = undefined;
	for (const timeout of pendingTimeouts) clearTimeout(timeout);
	pendingTimeouts = [];
}

function startDropping(): void {
	dropInterval = setInterval(dropDonut, TIME_BETWEEN_DONUTS);
}

/** Drop a new donut from a random x position. */
export function dropDonut(): void {
	const donut: Donut = {
		id: game.donutCount,
		x: getRandomInt(0, Math.max(0, viewport.width - donutSize())),
		status: "dropped",
		content: "🍩",
		label: String(game.donutCount),
		opacity: 1,
		rotate: 0,
	};
	game.donuts.push(donut);
	game.donutCount++;
	// a donut not shot before it reaches the ground counts as a miss
	schedule(() => missDonut(donut.id), donutMaxTravelDuration());
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
	donut.status = "hit";
	donut.opacity = 0.6;
	donut.label = "";
	schedule(() => {
		donut.content = "💨";
		donut.rotate = -90;
	}, TIME_BEFORE_HIT_DONUT_TURNS_TO_SMOKE);
	schedule(() => {
		donut.status = "spent";
	}, TIME_BEFORE_HIT_DONUT_DISAPPEARS);
	// the hit registers shortly after the shot, when the bullet arrives
	schedule(() => {
		bullet.status = "hit";
		bullet.color = "red";
		game.donutHits++;
	}, BULLET_HIT_DELAY);
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

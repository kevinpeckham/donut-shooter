// Per-level difficulty ramp: each level shrinks the donut fall duration and
// the average time between drops by the same factor (tetris-style).

import { clamp } from "$utils/helpers";

import {
	DROP_INTERVAL_JITTER,
	LEVEL_SPEEDUP_FACTOR,
	MAX_LEVEL,
	TIME_BETWEEN_DONUTS,
} from "$settings/gameSettings";

/** Multiplier on fall duration and drop interval; shrinks each level. */
export function levelSpeedMultiplier(level: number): number {
	return LEVEL_SPEEDUP_FACTOR ** (clamp(level, 1, MAX_LEVEL) - 1);
}

/** Average ms between donut drops at a given level. */
export function levelDropInterval(level: number): number {
	return TIME_BETWEEN_DONUTS * levelSpeedMultiplier(level);
}

/** Randomized delay until the next drop: the level average ± jitter. */
export function nextDropDelay(level: number): number {
	const jitter = 1 + DROP_INTERVAL_JITTER * (2 * Math.random() - 1);
	return levelDropInterval(level) * jitter;
}

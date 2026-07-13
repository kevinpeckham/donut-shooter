// Window and pointer tracking, plus sizes derived from the viewport.

import { clamp } from "$utils/helpers";

import {
	DONUT_FALL_SPEED,
	DONUT_SIZE_FACTOR,
	GROUND_HEIGHT,
	HEADER_HEIGHT,
	SHOOTER_SIZE_FACTOR,
} from "$settings/gameSettings";

export const viewport = $state({
	width: 0,
	height: 0,
	pointerX: 0,
});

/** Donut diameter in px, derived from window height. */
export function donutSize(): number {
	return Math.floor(viewport.height * 0.01 * DONUT_SIZE_FACTOR);
}

/** Shooter width in px, derived from window height. */
export function shooterSize(): number {
	return Math.floor(viewport.height * 0.01 * SHOOTER_SIZE_FACTOR);
}

/** Shooter x position: follows the pointer, clamped to the window. */
export function shooterX(): number {
	return clamp(
		viewport.pointerX,
		0,
		Math.max(0, viewport.width - shooterSize()),
	);
}

/** How far a donut falls before it reaches the ground, in px. */
export function donutMaxTravelDistance(): number {
	return viewport.height - HEADER_HEIGHT - GROUND_HEIGHT - donutSize();
}

/** How long a donut takes to reach the ground, in ms. */
export function donutMaxTravelDuration(): number {
	return donutMaxTravelDistance() / DONUT_FALL_SPEED;
}

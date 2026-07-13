// When a rising bullet visually meets a falling donut. Both sprites animate
// with closed-form tweens (cubicIn fall, cubicOut flight), so the moment of
// contact is computable at fire time — no per-frame collision detection.

import { cubicIn, cubicOut } from "svelte/easing";

import { clamp } from "$utils/helpers";

export interface InterceptInput {
	/** ms the donut has been falling when the shot is fired */
	donutElapsed: number;
	donutTravelDistance: number;
	donutTravelDuration: number;
	donutSize: number;
	headerHeight: number;
	viewportHeight: number;
	shooterSize: number;
	bulletFlightDuration: number;
}

/**
 * Delay in ms, from firing, until the bullet's top edge reaches the donut's
 * bottom edge, mirroring the trajectories the sprites render. Clamped to
 * [0, bulletFlightDuration].
 */
export function bulletInterceptDelay(input: InterceptInput): number {
	const donutBottom = (t: number) =>
		input.headerHeight +
		input.donutTravelDistance *
			cubicIn(clamp(t / input.donutTravelDuration, 0, 1)) +
		input.donutSize;
	const bulletTop = (s: number) =>
		input.viewportHeight -
		input.shooterSize -
		(input.viewportHeight + input.shooterSize) *
			cubicOut(clamp(s / input.bulletFlightDuration, 0, 1));
	// positive while the bullet is below the donut; shrinks monotonically as
	// the bullet rises and the donut falls
	const gap = (s: number) => bulletTop(s) - donutBottom(input.donutElapsed + s);
	if (gap(0) <= 0) return 0;
	let low = 0;
	let high = input.bulletFlightDuration;
	if (gap(high) > 0) return high;
	for (let i = 0; i < 24; i++) {
		const mid = (low + high) / 2;
		if (gap(mid) > 0) low = mid;
		else high = mid;
	}
	return high;
}

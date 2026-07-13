// Tests for the bullet/donut intercept math.

import { describe, expect, it } from "vitest";

import { bulletInterceptDelay } from "$utils/intercept";

// mirrors an 800px-tall window with the default gameplay constants
const base = {
	donutElapsed: 0,
	donutTravelDistance: 600,
	donutTravelDuration: 1200,
	donutSize: 48,
	headerHeight: 52,
	viewportHeight: 800,
	shooterSize: 12,
	bulletFlightDuration: 300,
};

describe("bulletInterceptDelay", () => {
	it("stays within the bullet's flight time", () => {
		for (const donutElapsed of [0, 300, 600, 900, 1200]) {
			const delay = bulletInterceptDelay({ ...base, donutElapsed });
			expect(delay).toBeGreaterThanOrEqual(0);
			expect(delay).toBeLessThanOrEqual(base.bulletFlightDuration);
		}
	});

	it("shrinks as the donut falls closer to the shooter", () => {
		const fresh = bulletInterceptDelay({ ...base, donutElapsed: 0 });
		const midway = bulletInterceptDelay({ ...base, donutElapsed: 600 });
		const low = bulletInterceptDelay({ ...base, donutElapsed: 1000 });
		expect(fresh).toBeGreaterThan(midway);
		expect(midway).toBeGreaterThan(low);
	});

	it("is near-instant for a donut about to land", () => {
		const delay = bulletInterceptDelay({
			...base,
			donutElapsed: base.donutTravelDuration,
		});
		expect(delay).toBeGreaterThan(0);
		expect(delay).toBeLessThan(40);
	});

	it("returns 0 when the donut already overlaps the bullet's start", () => {
		const delay = bulletInterceptDelay({
			...base,
			donutElapsed: base.donutTravelDuration,
			shooterSize: 150,
		});
		expect(delay).toBe(0);
	});

	it("meets the donut where the rendered trajectories cross", () => {
		// at the returned delay, the bullet's top and the donut's bottom —
		// computed the way the sprites render them — coincide
		const cubicIn = (u: number) => u ** 3;
		const cubicOut = (u: number) => 1 - (1 - u) ** 3;
		const delay = bulletInterceptDelay(base);
		const donutBottom =
			base.headerHeight +
			base.donutTravelDistance * cubicIn(delay / base.donutTravelDuration) +
			base.donutSize;
		const bulletTop =
			base.viewportHeight -
			base.shooterSize -
			(base.viewportHeight + base.shooterSize) *
				cubicOut(delay / base.bulletFlightDuration);
		expect(Math.abs(bulletTop - donutBottom)).toBeLessThan(1);
	});
});

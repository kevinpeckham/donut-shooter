// Tests for viewport-derived sizes and positions.

import {
	donutMaxTravelDistance,
	donutMaxTravelDuration,
	donutSize,
	shooterSize,
	shooterX,
	viewport,
} from "$stores/viewport.svelte";

import {
	DONUT_FALL_SPEED,
	GROUND_HEIGHT,
	HEADER_HEIGHT,
} from "$settings/gameSettings";
import { beforeEach, describe, expect, it } from "vitest";

beforeEach(() => {
	viewport.width = 1000;
	viewport.height = 800;
	viewport.pointerX = 0;
});

describe("donutSize", () => {
	it("is 6% of the window height, floored", () => {
		expect(donutSize()).toBe(48);
	});
});

describe("shooterSize", () => {
	it("is 1.5% of the window height, floored", () => {
		expect(shooterSize()).toBe(12);
	});
});

describe("shooterX", () => {
	it("follows the pointer", () => {
		viewport.pointerX = 500;
		expect(shooterX()).toBe(500);
	});

	it("clamps to the left edge", () => {
		viewport.pointerX = -20;
		expect(shooterX()).toBe(0);
	});

	it("clamps to the right edge minus the shooter width", () => {
		viewport.pointerX = 5000;
		expect(shooterX()).toBe(1000 - shooterSize());
	});

	it("never returns a negative position on a tiny window", () => {
		viewport.width = 0;
		viewport.pointerX = 10;
		expect(shooterX()).toBe(0);
	});
});

describe("donut travel", () => {
	it("distance spans from below the header to the top of the ground", () => {
		expect(donutMaxTravelDistance()).toBe(
			800 - HEADER_HEIGHT - GROUND_HEIGHT - donutSize(),
		);
	});

	it("duration is distance over fall speed", () => {
		expect(donutMaxTravelDuration()).toBe(
			donutMaxTravelDistance() / DONUT_FALL_SPEED,
		);
	});
});

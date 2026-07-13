// Tests for the per-level difficulty ramp.

import { afterEach, describe, expect, it, vi } from "vitest";

import {
	levelDropInterval,
	levelSpeedMultiplier,
	nextDropDelay,
} from "$utils/difficulty";

import {
	DROP_INTERVAL_JITTER,
	LEVEL_SPEEDUP_FACTOR,
	MAX_LEVEL,
	TIME_BETWEEN_DONUTS,
} from "$settings/gameSettings";

afterEach(() => {
	vi.restoreAllMocks();
});

describe("levelSpeedMultiplier", () => {
	it("is 1 at level 1", () => {
		expect(levelSpeedMultiplier(1)).toBe(1);
	});

	it("shrinks each level", () => {
		for (let level = 2; level <= MAX_LEVEL; level++) {
			expect(levelSpeedMultiplier(level)).toBeLessThan(
				levelSpeedMultiplier(level - 1),
			);
		}
		expect(levelSpeedMultiplier(5)).toBeCloseTo(LEVEL_SPEEDUP_FACTOR ** 4);
	});

	it("clamps outside the level range", () => {
		expect(levelSpeedMultiplier(0)).toBe(1);
		expect(levelSpeedMultiplier(MAX_LEVEL + 5)).toBe(
			levelSpeedMultiplier(MAX_LEVEL),
		);
	});
});

describe("levelDropInterval", () => {
	it("scales the base drop interval", () => {
		expect(levelDropInterval(1)).toBe(TIME_BETWEEN_DONUTS);
		expect(levelDropInterval(2)).toBeCloseTo(
			TIME_BETWEEN_DONUTS * LEVEL_SPEEDUP_FACTOR,
		);
	});
});

describe("nextDropDelay", () => {
	it("returns the level average when the jitter is neutral", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.5);
		expect(nextDropDelay(1)).toBe(TIME_BETWEEN_DONUTS);
	});

	it("stays within the jitter bounds", () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		expect(nextDropDelay(1)).toBeCloseTo(
			TIME_BETWEEN_DONUTS * (1 - DROP_INTERVAL_JITTER),
		);
		vi.spyOn(Math, "random").mockReturnValue(1);
		expect(nextDropDelay(1)).toBeCloseTo(
			TIME_BETWEEN_DONUTS * (1 + DROP_INTERVAL_JITTER),
		);
	});
});

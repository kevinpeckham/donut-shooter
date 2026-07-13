// Unit tests for the shared helpers.

import { clamp, getRandomInt } from "$utils/helpers";

import { describe, expect, it } from "vitest";

describe("getRandomInt", () => {
	it("stays within the inclusive range", () => {
		for (let i = 0; i < 200; i++) {
			const value = getRandomInt(0, 10);
			expect(value).toBeGreaterThanOrEqual(0);
			expect(value).toBeLessThanOrEqual(10);
			expect(Number.isInteger(value)).toBe(true);
		}
	});

	it("returns min when min equals max", () => {
		expect(getRandomInt(7, 7)).toBe(7);
	});
});

describe("clamp", () => {
	it("returns the value when it is in range", () => {
		expect(clamp(5, 0, 10)).toBe(5);
	});

	it("clamps below the minimum", () => {
		expect(clamp(-3, 0, 10)).toBe(0);
	});

	it("clamps above the maximum", () => {
		expect(clamp(42, 0, 10)).toBe(10);
	});
});

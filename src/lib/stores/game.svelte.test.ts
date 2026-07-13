// Tests for the central game state machine: dropping, shooting, misses,
// pause/resume, reset, and game over.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// no real audio in tests
vi.mock("$utils/sound", () => ({ playSound: vi.fn() }));

import {
	dropDonut,
	game,
	pauseGame,
	resetGame,
	resumeGame,
	shoot,
	startNewGame,
} from "$stores/game.svelte";
import { donutMaxTravelDuration, viewport } from "$stores/viewport.svelte";

import {
	BULLET_FLIGHT_DURATION,
	BULLET_HIT_DELAY,
	MAX_HEALTH,
	MAX_MISSES,
	TIME_BEFORE_HIT_DONUT_DISAPPEARS,
	TIME_BEFORE_MISSED_DONUT_DISAPPEARS,
	TIME_BETWEEN_DONUTS,
} from "$settings/gameSettings";

beforeEach(() => {
	vi.useFakeTimers();
	viewport.width = 1000;
	viewport.height = 800;
	viewport.pointerX = 0;
	resetGame();
});

afterEach(() => {
	vi.useRealTimers();
});

describe("startNewGame", () => {
	it("resets stats and starts playing", () => {
		game.donutHits = 5;
		game.donutMisses = 2;
		game.health = 1;
		startNewGame();
		expect(game.status).toBe("playing");
		expect(game.donutHits).toBe(0);
		expect(game.donutMisses).toBe(0);
		expect(game.health).toBe(MAX_HEALTH);
		expect(game.donuts).toHaveLength(0);
		expect(game.bullets).toHaveLength(0);
	});

	it("drops donuts on an interval", () => {
		startNewGame();
		expect(game.donuts).toHaveLength(0);
		vi.advanceTimersByTime(TIME_BETWEEN_DONUTS);
		expect(game.donuts).toHaveLength(1);
		vi.advanceTimersByTime(TIME_BETWEEN_DONUTS);
		expect(game.donuts).toHaveLength(2);
	});
});

describe("dropDonut", () => {
	it("creates a dropped donut within the window", () => {
		startNewGame();
		dropDonut();
		const donut = game.donuts[0];
		expect(donut.status).toBe("dropped");
		expect(donut.content).toBe("🍩");
		expect(donut.x).toBeGreaterThanOrEqual(0);
		expect(donut.x).toBeLessThanOrEqual(viewport.width);
		expect(game.donutCount).toBe(1);
	});
});

describe("missed donuts", () => {
	it("counts a miss and loses health when a donut lands", () => {
		startNewGame();
		dropDonut();
		vi.advanceTimersByTime(donutMaxTravelDuration());
		const donut = game.donuts[0];
		expect(donut.status).toBe("missed");
		expect(donut.content).toBe("👽");
		expect(game.donutMisses).toBe(1);
		expect(game.health).toBe(MAX_HEALTH - 1);
		vi.advanceTimersByTime(TIME_BEFORE_MISSED_DONUT_DISAPPEARS);
		expect(donut.status).toBe("spent");
	});

	it("ends the game after the maximum number of misses", () => {
		startNewGame();
		for (let i = 0; i < MAX_MISSES; i++) {
			dropDonut();
			vi.advanceTimersByTime(donutMaxTravelDuration());
		}
		expect(game.donutMisses).toBe(MAX_MISSES);
		expect(game.status).toBe("over");
		expect(game.donuts).toHaveLength(0);
	});
});

describe("shoot", () => {
	it("does nothing when the game is not playing", () => {
		shoot();
		expect(game.bullets).toHaveLength(0);
		expect(game.shotCount).toBe(0);
	});

	it("fires a bullet from the shooter position", () => {
		startNewGame();
		viewport.pointerX = 400;
		shoot();
		expect(game.bullets).toHaveLength(1);
		expect(game.bullets[0].status).toBe("fired");
		expect(game.bullets[0].x).toBe(400);
		expect(game.shotCount).toBe(1);
	});

	it("marks a missed bullet spent after its flight", () => {
		startNewGame();
		shoot();
		vi.advanceTimersByTime(BULLET_FLIGHT_DURATION);
		expect(game.bullets[0].status).toBe("spent");
	});

	it("hits a donut the bullet lines up with", () => {
		startNewGame();
		dropDonut();
		const donut = game.donuts[0];
		viewport.pointerX = donut.x;
		shoot();
		expect(donut.status).toBe("hit");

		// the hit registers when the bullet arrives
		vi.advanceTimersByTime(BULLET_HIT_DELAY);
		expect(game.donutHits).toBe(1);
		expect(game.bullets[0].status).toBe("hit");
		expect(game.bullets[0].color).toBe("red");

		vi.advanceTimersByTime(TIME_BEFORE_HIT_DONUT_DISAPPEARS);
		expect(donut.status).toBe("spent");
	});

	it("does not hit a donut the bullet misses", () => {
		startNewGame();
		dropDonut();
		const donut = game.donuts[0];
		viewport.pointerX = donut.x > 500 ? 0 : 990;
		shoot();
		expect(donut.status).toBe("dropped");
		vi.advanceTimersByTime(BULLET_HIT_DELAY);
		expect(game.donutHits).toBe(0);
	});

	it("prunes spent bullets on the next shot", () => {
		startNewGame();
		shoot();
		vi.advanceTimersByTime(BULLET_FLIGHT_DURATION);
		shoot();
		expect(game.bullets).toHaveLength(1);
	});
});

describe("pause and resume", () => {
	it("pauses only while playing", () => {
		pauseGame();
		expect(game.status).toBe("ready");
	});

	it("discards in-flight donuts but keeps stats", () => {
		startNewGame();
		dropDonut();
		game.donutHits = 4;
		pauseGame();
		expect(game.status).toBe("paused");
		expect(game.donuts).toHaveLength(0);
		expect(game.donutHits).toBe(4);
	});

	it("stops the drop interval while paused", () => {
		startNewGame();
		pauseGame();
		vi.advanceTimersByTime(TIME_BETWEEN_DONUTS * 3);
		expect(game.donuts).toHaveLength(0);
	});

	it("resumes dropping after resume", () => {
		startNewGame();
		pauseGame();
		resumeGame();
		expect(game.status).toBe("playing");
		vi.advanceTimersByTime(TIME_BETWEEN_DONUTS);
		expect(game.donuts).toHaveLength(1);
	});
});

describe("resetGame", () => {
	it("returns to the ready state with cleared stats", () => {
		startNewGame();
		dropDonut();
		game.donutHits = 2;
		resetGame();
		expect(game.status).toBe("ready");
		expect(game.donuts).toHaveLength(0);
		expect(game.donutHits).toBe(0);
		expect(game.health).toBe(MAX_HEALTH);
		// no more drops after reset
		vi.advanceTimersByTime(TIME_BETWEEN_DONUTS * 3);
		expect(game.donuts).toHaveLength(0);
	});
});

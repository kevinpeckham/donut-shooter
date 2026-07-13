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

import { levelDropInterval } from "$utils/difficulty";

import {
	BULLET_FLIGHT_DURATION,
	HITS_PER_LEVEL,
	INITIAL_DROP_DELAY,
	LEVEL_BANNER_DURATION,
	LEVEL_SPEEDUP_FACTOR,
	MAX_HEALTH,
	MAX_LEVEL,
	MAX_MISSES,
	TIME_BEFORE_HIT_DONUT_DISAPPEARS,
	TIME_BEFORE_HIT_DONUT_TURNS_TO_SMOKE,
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
	vi.restoreAllMocks();
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

	it("drops the first donut after the initial delay, then on an interval", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.5); // neutralize drop jitter
		startNewGame();
		expect(game.donuts).toHaveLength(0);
		vi.advanceTimersByTime(INITIAL_DROP_DELAY - 1);
		expect(game.donuts).toHaveLength(0);
		vi.advanceTimersByTime(1);
		expect(game.donuts).toHaveLength(1);
		vi.advanceTimersByTime(TIME_BETWEEN_DONUTS);
		expect(game.donuts).toHaveLength(2);
		vi.advanceTimersByTime(TIME_BETWEEN_DONUTS);
		expect(game.donuts).toHaveLength(3);
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
		// the donut is claimed at fire time (hitscan)...
		expect(donut.status).toBe("hit");
		expect(game.donutHits).toBe(0);

		// ...but the hit registers when the bullet reaches it, some time
		// within its flight
		vi.advanceTimersByTime(BULLET_FLIGHT_DURATION - 1);
		expect(game.donutHits).toBe(1);
		expect(game.bullets[0].status).toBe("hit");

		vi.advanceTimersByTime(
			TIME_BEFORE_HIT_DONUT_TURNS_TO_SMOKE + TIME_BEFORE_HIT_DONUT_DISAPPEARS,
		);
		expect(donut.status).toBe("spent");
	});

	it("registers the hit sooner for a donut closer to the ground", () => {
		startNewGame();
		dropDonut();
		// let the donut fall most of the way before shooting it
		vi.advanceTimersByTime(donutMaxTravelDuration() * 0.75);
		const donut = game.donuts[0];
		viewport.pointerX = donut.x;
		shoot();
		// a fresh donut takes ~1/3 of the flight to reach; a low one is
		// hit almost immediately
		vi.advanceTimersByTime(BULLET_FLIGHT_DURATION / 4);
		expect(game.donutHits).toBe(1);
	});

	it("does not hit a donut the bullet misses", () => {
		startNewGame();
		dropDonut();
		const donut = game.donuts[0];
		viewport.pointerX = donut.x > 500 ? 0 : 990;
		shoot();
		expect(donut.status).toBe("dropped");
		vi.advanceTimersByTime(BULLET_FLIGHT_DURATION);
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

describe("levels", () => {
	/** Land one hit on a freshly dropped donut and let the bullet arrive. */
	function scoreOneHit(): void {
		dropDonut();
		const donut = game.donuts[game.donuts.length - 1];
		viewport.pointerX = donut.x;
		shoot();
		vi.advanceTimersByTime(BULLET_FLIGHT_DURATION);
	}

	it("advances the level, announces it, and resumes dropping after enough hits", () => {
		startNewGame();
		game.donutHits = HITS_PER_LEVEL - 1;
		scoreOneHit();
		expect(game.donutHits).toBe(HITS_PER_LEVEL);
		expect(game.level).toBe(2);
		expect(game.levelBanner).toBe(2);
		// the field is cleared while the banner is up
		expect(game.donuts).toHaveLength(0);
		vi.advanceTimersByTime(LEVEL_BANNER_DURATION);
		expect(game.levelBanner).toBe(null);
		// then dropping resumes at the new level
		vi.advanceTimersByTime(INITIAL_DROP_DELAY);
		expect(game.donuts).toHaveLength(1);
	});

	it("pausing during the level banner dismisses it", () => {
		startNewGame();
		game.donutHits = HITS_PER_LEVEL - 1;
		scoreOneHit();
		expect(game.levelBanner).toBe(2);
		pauseGame();
		expect(game.status).toBe("paused");
		expect(game.levelBanner).toBe(null);
		resumeGame();
		vi.advanceTimersByTime(INITIAL_DROP_DELAY);
		expect(game.level).toBe(2);
		expect(game.donuts).toHaveLength(1);
	});

	it("donuts fall faster at higher levels", () => {
		startNewGame();
		game.level = 10;
		dropDonut();
		const donut = game.donuts[0];
		expect(donut.fallDuration).toBeCloseTo(
			donutMaxTravelDuration() * LEVEL_SPEEDUP_FACTOR ** 9,
		);
		// the miss timer matches the faster fall
		vi.advanceTimersByTime(Math.ceil(donut.fallDuration));
		expect(donut.status).toBe("missed");
	});

	it("drops come more frequently at higher levels", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.5); // neutralize drop jitter
		startNewGame();
		game.level = 10;
		vi.advanceTimersByTime(INITIAL_DROP_DELAY);
		expect(game.donuts).toHaveLength(1);
		const interval = levelDropInterval(10);
		expect(interval).toBeLessThan(TIME_BETWEEN_DONUTS);
		vi.advanceTimersByTime(Math.ceil(interval));
		expect(game.donuts).toHaveLength(2);
	});

	it("wins the game after completing the final level", () => {
		startNewGame();
		game.level = MAX_LEVEL;
		game.donutHits = MAX_LEVEL * HITS_PER_LEVEL - 1;
		scoreOneHit();
		expect(game.status).toBe("won");
		expect(game.level).toBe(MAX_LEVEL);
		expect(game.levelBanner).toBe(null);
		expect(game.donuts).toHaveLength(0);
		// no more drops after winning
		vi.advanceTimersByTime(TIME_BETWEEN_DONUTS * 3);
		expect(game.donuts).toHaveLength(0);
	});

	it("starts a new game back at level 1", () => {
		startNewGame();
		game.level = 7;
		startNewGame();
		expect(game.level).toBe(1);
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
		vi.advanceTimersByTime(INITIAL_DROP_DELAY);
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

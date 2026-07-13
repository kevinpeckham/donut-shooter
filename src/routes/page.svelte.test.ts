// Component tests for the game page: title screen, starting a game, and
// window-level input routing.

import { describe, expect, it, vi } from "vitest";

// no real audio in tests
vi.mock("$utils/sound", () => ({ playSound: vi.fn() }));

import { AUTO_START_DELAY } from "$settings/gameSettings";
import { game, resetGame } from "$stores/game.svelte";
import { viewport } from "$stores/viewport.svelte";

import { fireEvent, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { beforeEach } from "vitest";
import Page from "./+page.svelte";

beforeEach(() => {
	resetGame();
	viewport.width = 1000;
	viewport.height = 800;
	viewport.pointerX = 0;
});

describe("game page", () => {
	it("shows the title screen when ready", () => {
		render(Page);
		expect(
			screen.getByRole("heading", { name: "Donut Shooter" }),
		).toBeInTheDocument();
	});

	it("starts the game from the Play button and shows the header", async () => {
		const user = userEvent.setup();
		render(Page);
		await user.click(screen.getByRole("button", { name: /Play/ }));
		expect(game.status).toBe("playing");
		expect(screen.getByText("Level: 1")).toBeInTheDocument();
	});

	it("tracks the pointer from window mousemove", async () => {
		render(Page);
		await fireEvent.mouseMove(window, { clientX: 321 });
		expect(viewport.pointerX).toBe(321);
	});

	it("fires a shot on mousedown while playing", async () => {
		render(Page);
		game.status = "playing";
		await fireEvent.mouseDown(window);
		expect(game.shotCount).toBe(1);
	});

	it("fires a shot on Space while playing, once per press", async () => {
		render(Page);
		game.status = "playing";
		await fireEvent.keyDown(window, { key: " " });
		expect(game.shotCount).toBe(1);
		// a held-down key auto-repeats; only the initial press fires
		await fireEvent.keyDown(window, { key: " ", repeat: true });
		expect(game.shotCount).toBe(1);
	});

	it("auto-starts the game from the title screen after a delay", () => {
		vi.useFakeTimers();
		try {
			render(Page);
			expect(game.status).toBe("ready");
			vi.advanceTimersByTime(AUTO_START_DELAY);
			expect(game.status).toBe("playing");
		} finally {
			vi.useRealTimers();
		}
	});

	it("pauses on Escape while playing", async () => {
		render(Page);
		game.status = "playing";
		await fireEvent.keyDown(window, { key: "Escape" });
		expect(game.status).toBe("paused");
	});

	it("pauses when the window is resized while playing", async () => {
		render(Page);
		game.status = "playing";
		await fireEvent(window, new Event("resize"));
		expect(game.status).toBe("paused");
	});
});

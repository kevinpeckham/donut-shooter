// Component tests for the message overlay: per-status messages and the
// start / continue / new-game button.

import { describe, expect, it, vi } from "vitest";

// no real audio in tests
vi.mock("$utils/sound", () => ({ playSound: vi.fn() }));

import MessageOverlay from "$components/MessageOverlay.svelte";

import { game, resetGame } from "$stores/game.svelte";

import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { beforeEach } from "vitest";

beforeEach(() => {
	resetGame();
});

describe("MessageOverlay", () => {
	it("shows the title screen when ready", () => {
		render(MessageOverlay);
		expect(
			screen.getByRole("heading", { name: "Donut Hunter" }),
		).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /Play/ })).toBeInTheDocument();
	});

	it("shows 'Paused' with a Continue button when paused", () => {
		game.status = "paused";
		render(MessageOverlay);
		expect(screen.getByText("Paused")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /Continue/ }),
		).toBeInTheDocument();
	});

	it("shows 'Game Over.' with a New Game button when over", () => {
		game.status = "over";
		render(MessageOverlay);
		expect(screen.getByText("Game Over.")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /New Game/ }),
		).toBeInTheDocument();
	});

	it("starts a new game from the ready screen", async () => {
		const user = userEvent.setup();
		render(MessageOverlay);
		await user.click(screen.getByRole("button", { name: /Play/ }));
		expect(game.status).toBe("playing");
	});

	it("resumes the game from the pause screen", async () => {
		const user = userEvent.setup();
		game.status = "paused";
		render(MessageOverlay);
		await user.click(screen.getByRole("button", { name: /Continue/ }));
		expect(game.status).toBe("playing");
	});

	it("starts a fresh game after game over", async () => {
		const user = userEvent.setup();
		game.status = "over";
		game.donutMisses = 3;
		render(MessageOverlay);
		await user.click(screen.getByRole("button", { name: /New Game/ }));
		expect(game.status).toBe("playing");
		expect(game.donutMisses).toBe(0);
	});
});

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
			screen.getByRole("heading", { name: "Donut Shooter" }),
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

	it("shows 'You Win!' with a Play Again button when won", () => {
		game.status = "won";
		render(MessageOverlay);
		expect(screen.getByText("You Win!")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /Play Again/ }),
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

	it("shows the credits and about link on the title and pause screens", () => {
		for (const status of ["ready", "paused"] as const) {
			game.status = status;
			const { unmount } = render(MessageOverlay);
			expect(screen.getByText(/Made by Kevin Peckham/)).toBeInTheDocument();
			expect(
				screen.getByRole("link", { name: "Lightning Jar" }),
			).toHaveAttribute("href", "https://www.lightningjar.com");
			expect(
				screen.getByRole("link", { name: "About this game" }),
			).toHaveAttribute("href", "/about");
			unmount();
		}
	});

	it("hides the credits on the game-over screen", () => {
		game.status = "over";
		render(MessageOverlay);
		expect(screen.queryByText(/Made by Kevin Peckham/)).not.toBeInTheDocument();
	});

	it("starts a fresh game at level 1 after winning", async () => {
		const user = userEvent.setup();
		game.status = "won";
		game.level = 20;
		render(MessageOverlay);
		await user.click(screen.getByRole("button", { name: /Play Again/ }));
		expect(game.status).toBe("playing");
		expect(game.level).toBe(1);
	});
});

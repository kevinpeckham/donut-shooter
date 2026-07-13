// Component tests for the in-game header: stats display and controls.

import Header from "$components/Header.svelte";

import { game, resetGame } from "$stores/game.svelte";

import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

beforeEach(() => {
	resetGame();
});

describe("Header", () => {
	it("shows the donut hit count", () => {
		game.donutHits = 7;
		render(Header);
		expect(screen.getByTestId("donut-hits")).toHaveTextContent("7");
	});

	it("shows the current level", () => {
		render(Header);
		expect(screen.getByText("Level: 1")).toBeInTheDocument();
	});

	it("dims hearts as health is lost", () => {
		game.health = 1;
		render(Header);
		expect(screen.getByTestId("heart-0").className).not.toContain("opacity-20");
		expect(screen.getByTestId("heart-1").className).toContain("opacity-20");
		expect(screen.getByTestId("heart-2").className).toContain("opacity-20");
	});

	it("pauses a playing game from the pause button", async () => {
		const user = userEvent.setup();
		game.status = "playing";
		render(Header);
		await user.click(screen.getByRole("button", { name: "Pause game" }));
		expect(game.status).toBe("paused");
	});

	it("resumes a paused game from the same button", async () => {
		const user = userEvent.setup();
		game.status = "paused";
		render(Header);
		await user.click(screen.getByRole("button", { name: "Resume game" }));
		expect(game.status).toBe("playing");
	});

	it("resets the game from the reset button", async () => {
		const user = userEvent.setup();
		game.status = "playing";
		game.donutHits = 3;
		render(Header);
		await user.click(screen.getByRole("button", { name: "Reset game" }));
		expect(game.status).toBe("ready");
		expect(game.donutHits).toBe(0);
	});
});

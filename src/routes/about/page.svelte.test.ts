// Component tests for the about page: content and outbound links.

import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";

import Page from "./+page.svelte";

describe("about page", () => {
	it("describes the game and how to play", () => {
		render(Page);
		expect(
			screen.getByRole("heading", { name: "About Donut Shooter" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: "How to play" }),
		).toBeInTheDocument();
		expect(screen.getByText(/press the spacebar/)).toBeInTheDocument();
	});

	it("links to Lightning Jar, the blog post, and the source code", () => {
		render(Page);
		expect(screen.getByRole("link", { name: "Lightning Jar" })).toHaveAttribute(
			"href",
			"https://www.lightningjar.com",
		);
		expect(
			screen.getByRole("link", { name: "The Arcade Game with No Game Loop" }),
		).toHaveAttribute(
			"href",
			"https://www.lightningjar.com/blog/the-arcade-game-with-no-game-loop",
		);
		expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute(
			"href",
			"https://github.com/kevinpeckham/donut-shooter",
		);
	});

	it("links back to the game", () => {
		render(Page);
		expect(
			screen.getByRole("link", { name: /Back to the game/ }),
		).toHaveAttribute("href", "/");
	});
});

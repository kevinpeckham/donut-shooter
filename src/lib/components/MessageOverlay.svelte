<!--
@component
Full-screen overlay shown whenever the game is not actively playing:
title screen, pause screen, and game-over screen, plus the start button.
-->

<script lang="ts">
import { fade } from "svelte/transition";

import IconPlay from "$components/IconPlay.svelte";

import { game, resumeGame, startNewGame } from "$stores/game.svelte";

const buttonLabel = $derived(
	game.status === "paused"
		? "Continue"
		: game.status === "over"
			? "New Game"
			: "Play",
);

function onStartButtonMousedown(event: MouseEvent) {
	event.stopPropagation();
	if (game.status === "paused") resumeGame();
	else startNewGame();
}
</script>

<div
	class="pointer-events-auto fixed z-20 grid h-screen w-screen grid-cols-1 place-items-center"
	transition:fade
>
	<div class="h-auto w-full">
		<!-- message -->
		<div class="mb-8 flex justify-center text-center text-4xl text-white">
			{#if game.status === "over"}
				<div class="inline-block">Game Over.</div>
			{:else if game.status === "ready"}
				<div class="grid w-full grid-cols-1 justify-center pt-48">
					<h1 class="mb-8">Donut Shooter</h1>
					<div class="text-[200px] leading-none">🍩</div>
				</div>
			{:else if game.status === "paused"}
				<div>Paused</div>
			{/if}
		</div>

		<!-- start button -->
		<div class="grid place-content-center">
			<button
				type="button"
				class="pointer-events-auto flex items-center rounded bg-transparent px-4 py-2 text-center text-white outline outline-white transition-colors hover:bg-white hover:text-blue-500"
				onmousedown={onStartButtonMousedown}
			>
				<div class="m-0 w-3.5">
					<IconPlay />
				</div>
				<div class="ml-2 inline-block">{buttonLabel}</div>
			</button>
		</div>
	</div>
</div>

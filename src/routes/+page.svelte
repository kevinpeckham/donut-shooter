<!--
@component
The game screen. Tracks window size and pointer position, routes input
(mousedown or Space fires, Escape pauses, resizing pauses), and renders the
play field.
-->

<script lang="ts">
import { fade } from "svelte/transition";

import Header from "$components/Header.svelte";
import MessageOverlay from "$components/MessageOverlay.svelte";
import PlayField from "$components/PlayField.svelte";

import { game, pauseGame, shoot } from "$stores/game.svelte";
import { viewport } from "$stores/viewport.svelte";

import { clamp } from "$utils/helpers";

import { GAME_BACKGROUND_COLOR } from "$settings/gameSettings";

function onmousemove(event: MouseEvent) {
	viewport.pointerX = clamp(Math.floor(event.x), 0, viewport.width);
}

function onmousedown() {
	if (game.status === "playing") shoot();
}

function onkeydown(event: KeyboardEvent) {
	if (event.key === "Escape") pauseGame();
	if (event.key === " " && !event.repeat) {
		event.preventDefault();
		if (game.status === "playing") shoot();
	}
}

// donut timers and tweens both capture the viewport when they start, so a
// mid-flight resize would desync them; pausing clears the field instead
function onresize() {
	pauseGame();
}
</script>

<svelte:window
	bind:innerWidth={viewport.width}
	bind:innerHeight={viewport.height}
	{onmousemove}
	{onmousedown}
	{onkeydown}
	{onresize}
/>

<div
	id="game"
	class="relative h-screen w-full select-none overflow-hidden"
	style="background-color: {GAME_BACKGROUND_COLOR};"
>
	<!-- header -->
	{#if game.status === "playing" || game.status === "paused"}
		<div class="relative z-20 flex" transition:fade>
			<Header />
		</div>
	{/if}

	<PlayField />

	<!-- message overlay -->
	{#if game.status !== "playing"}
		<MessageOverlay />
	{/if}
</div>

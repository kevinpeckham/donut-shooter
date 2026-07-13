<!--
@component
In-game header: hits, health hearts, level, and pause / reset controls.
-->

<script lang="ts">
import IconHeart from "$components/IconHeart.svelte";
import IconPause from "$components/IconPause.svelte";
import IconReset from "$components/IconReset.svelte";

import { game, pauseGame, resetGame, resumeGame } from "$stores/game.svelte";

import { HEADER_BACKGROUND_COLOR, MAX_HEALTH } from "$settings/gameSettings";

const hearts = Array.from({ length: MAX_HEALTH }, (_, index) => index);

function onPauseButtonMousedown(event: MouseEvent) {
	event.stopPropagation();
	if (game.status === "playing") pauseGame();
	else resumeGame();
}

function onResetButtonMousedown(event: MouseEvent) {
	event.stopPropagation();
	resetGame();
}
</script>

<header
	class="absolute flex w-full px-4 py-2"
	style="background-color: {HEADER_BACKGROUND_COLOR};"
>
	<div class="grid w-full grid-cols-3">
		<!-- left: donut hits + health -->
		<div class="flex w-full">
			<div class="mr-6 flex items-center text-lg text-white">
				<div class="mr-2">
					<div class="inline-block origin-center rotate-45 text-2xl">🍩</div>
				</div>
				<div class="min-w-[10px] text-base" data-testid="donut-hits">
					{game.donutHits}
				</div>
			</div>
			<div class="mr-4 flex items-center text-lg text-white transition-opacity">
				{#each hearts as heart (heart)}
					<div
						class="mr-2 w-5 text-red-700 {game.health >= heart + 1
							? ''
							: 'opacity-20'}"
						data-testid="heart-{heart}"
					>
						<IconHeart />
					</div>
				{/each}
			</div>
		</div>

		<!-- center: game level -->
		<div class="grid w-full grid-cols-1 place-content-center">
			<div class="ml-4 p-1 text-center text-lg text-white">
				Level: {game.level}
			</div>
		</div>

		<!-- right: pause + reset buttons -->
		<div
			class="absolute right-0 top-0 flex h-full items-center pr-4 text-lg"
		>
			<button
				type="button"
				aria-label={game.status === "playing" ? "Pause game" : "Resume game"}
				class="pointer-events-auto rounded p-1 hover:bg-white/20 {game.status ===
				'paused'
					? 'bg-white/20'
					: ''}"
				onmousedown={onPauseButtonMousedown}
			>
				<div class="h-4 w-4 text-white">
					<IconPause />
				</div>
			</button>
			<button
				type="button"
				aria-label="Reset game"
				class="pointer-events-auto ml-4 rounded p-1 hover:bg-white/20"
				onmousedown={onResetButtonMousedown}
			>
				<div class="h-4 w-4 text-white">
					<IconReset />
				</div>
			</button>
		</div>
	</div>
</header>

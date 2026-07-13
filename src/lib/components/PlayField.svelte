<!--
@component
The active play field: ground, shooter, bullets, and falling donuts.
Rendered only while the game is playing.
-->

<script lang="ts">
import { fade } from "svelte/transition";

import BulletSprite from "$components/BulletSprite.svelte";
import DonutSprite from "$components/DonutSprite.svelte";
import Shooter from "$components/Shooter.svelte";

import { game } from "$stores/game.svelte";

const activeBullets = $derived(
	game.bullets.filter((bullet) => bullet.status === "fired"),
);
const activeDonuts = $derived(
	game.donuts.filter((donut) => donut.status !== "spent"),
);
</script>

{#if game.status === "playing"}
	<!-- ground -->
	<div
		class="absolute bottom-0 left-0 h-24 w-full bg-green-500"
		transition:fade
	>
		<Shooter />
	</div>

	<!-- bullets -->
	<div class="pointer-events-none">
		{#each activeBullets as bullet (bullet.id)}
			<BulletSprite {bullet} />
		{/each}
	</div>

	<!-- donuts -->
	<div class="pointer-events-none">
		{#each activeDonuts as donut (donut.id)}
			<div transition:fade>
				<DonutSprite {donut} />
			</div>
		{/each}
	</div>
{/if}

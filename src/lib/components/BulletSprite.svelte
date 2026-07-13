<!--
@component
A single fired bullet. Flies from the shooter to the top of the screen;
turns red briefly when it registers a hit.
-->

<script lang="ts">
import { cubicOut } from "svelte/easing";
import { Tween } from "svelte/motion";

import { shooterSize, viewport } from "$stores/viewport.svelte";

import type { Bullet } from "$stores/game.svelte";

import { BULLET_FLIGHT_DURATION } from "$settings/gameSettings";

interface Props {
	bullet: Bullet;
}
let { bullet }: Props = $props();

const y = new Tween(0, {
	duration: BULLET_FLIGHT_DURATION,
	easing: cubicOut,
});

$effect(() => {
	if (bullet.status === "fired" || bullet.status === "hit") {
		void y.set(-1 * (viewport.height + shooterSize()));
	}
});
</script>

<div
	id="bullet-{bullet.id}"
	class="pointer-events-none absolute bottom-0 left-0 grid place-content-center rounded-full p-2"
	style="background-color: {bullet.color}; height: {shooterSize()}px; width: {shooterSize()}px; opacity: {bullet.opacity}; transform: translate({bullet.x}px, {y.current}px);"
>
	<div class="rounded-full" style="background-color: {bullet.color};">
		&nbsp;
	</div>
</div>

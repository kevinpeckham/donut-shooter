<!--
@component
A single fired bullet. Flies from the shooter to the top of the screen,
shrinking as it climbs; the play field unmounts it when it hits a donut
or finishes its flight.
-->

<script lang="ts">
import { cubicOut } from "svelte/easing";
import { Tween } from "svelte/motion";

import { shooterSize, viewport } from "$stores/viewport.svelte";

import type { Bullet } from "$stores/game.svelte";

import {
	BULLET_FLIGHT_DURATION,
	BULLET_MIN_SCALE,
} from "$settings/gameSettings";

interface Props {
	bullet: Bullet;
}
let { bullet }: Props = $props();

const y = new Tween(0, {
	duration: BULLET_FLIGHT_DURATION,
	easing: cubicOut,
});

$effect(() => {
	if (bullet.status === "fired") {
		void y.set(-1 * (viewport.height + shooterSize()));
	}
});

const flightProgress = $derived(-y.current / (viewport.height + shooterSize()));
const scale = $derived(1 - (1 - BULLET_MIN_SCALE) * flightProgress);
</script>

<div
	id="bullet-{bullet.id}"
	class="pointer-events-none absolute bottom-0 left-0 grid place-content-center rounded-full p-2"
	style="background-color: {bullet.color}; height: {shooterSize()}px; width: {shooterSize()}px; opacity: {bullet.opacity}; transform: translate({bullet.x}px, {y.current}px) scale({scale});"
>
	<div class="rounded-full" style="background-color: {bullet.color};">
		&nbsp;
	</div>
</div>

<!--
@component
A single falling donut. Position and status live in the game store; this
component only animates the fall and renders the current state.
-->

<script lang="ts">
import { cubicIn } from "svelte/easing";
import { Tween } from "svelte/motion";

import {
	donutMaxTravelDistance,
	donutMaxTravelDuration,
	donutSize,
} from "$stores/viewport.svelte";

import type { Donut } from "$stores/game.svelte";

import { HEADER_HEIGHT } from "$settings/gameSettings";

interface Props {
	donut: Donut;
}
let { donut }: Props = $props();

// falls from just below the header to the top of the ground
const y = new Tween(HEADER_HEIGHT, {
	duration: donutMaxTravelDuration(),
	easing: cubicIn,
});

$effect(() => {
	if (donut.status === "dropped") {
		void y.set(HEADER_HEIGHT + donutMaxTravelDistance());
	}
});
</script>

<div
	id="donut-{donut.id}"
	class="absolute left-0 top-0 rounded-full text-center leading-none"
	style="font-size: {donutSize()}px; opacity: {donut.opacity}; transform: translate({donut.x}px, {y.current}px);"
>
	<div style="rotate: {donut.rotate}deg;">{donut.content}</div>
	<div class="text-sm text-white">{donut.label}</div>
</div>

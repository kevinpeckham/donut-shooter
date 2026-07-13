<!--
@component
Momentary full-screen announcement shown between levels.
-->

<script lang="ts">
import { fade } from "svelte/transition";

interface Props {
	level: number;
}
let { level }: Props = $props();
</script>

<div
	class="pointer-events-none fixed inset-0 z-30 grid place-content-center"
	transition:fade
>
	<div class="text-center text-6xl text-white">Level {level}</div>
</div>

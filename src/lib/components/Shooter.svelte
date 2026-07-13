<!--
@component
The user-controlled shooter. Follows the pointer along the bottom of the
screen; firing is handled by the game store (see `shoot()`).
-->

<script lang="ts">
import { shooterSize, shooterX } from "$stores/viewport.svelte";
</script>

<div
	class="pointer-events-none absolute bottom-0 mb-8 grid place-content-center text-white"
	style="transform: translateX({shooterX()}px);"
>
	<div class="relative h-8 bg-white" style="width: {shooterSize()}px;">
		&nbsp;
	</div>
</div>

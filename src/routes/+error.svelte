<script lang="ts">
import { page } from "$app/state";
</script>

<div
	class="grid h-screen w-full place-content-center bg-primary text-center text-white"
>
	<div class="mb-4 text-6xl">🍩</div>
	<h1 class="mb-2 text-4xl">{page.status}</h1>
	<p class="mb-8">{page.error?.message ?? "Something went wrong."}</p>
	<a class="underline underline-offset-2 hover:text-accent" href="/">
		Back to the game
	</a>
</div>

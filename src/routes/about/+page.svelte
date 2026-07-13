<!--
@component
About page: what the game is, how to play, and credits.
-->

<script lang="ts">
import { GAME_BACKGROUND_COLOR } from "$settings/gameSettings";
</script>

<svelte:head>
	<title>About — Donut Shooter</title>
	<meta
		name="description"
		content="What Donut Shooter is, how to play, and who made it."
	/>
</svelte:head>

<main
	class="min-h-screen w-full px-6 py-16 text-white"
	style="background-color: {GAME_BACKGROUND_COLOR};"
>
	<div class="mx-auto max-w-xl">
		<div class="mb-6 text-6xl">🍩</div>
		<h1 class="mb-6 text-4xl">About Donut Shooter</h1>

		<p class="mb-4 leading-relaxed">
			Donut Shooter is a free browser arcade game. Donuts rain from the top
			of the screen, and your job is to shoot them out of the air before
			they reach the ground.
		</p>

		<h2 class="mb-3 mt-10 text-2xl">How to play</h2>
		<ul class="list-disc space-y-2 pl-5 leading-relaxed">
			<li>Move the shooter along the ground with your mouse.</li>
			<li>Click — or press the spacebar — to shoot.</li>
			<li>If three donuts hit the ground, the game is over.</li>
			<li>
				Every ten hits takes you to the next level, where donuts fall a
				little faster and arrive a little more often.
			</li>
			<li>Make it through level 20 to win.</li>
		</ul>

		<h2 class="mb-3 mt-10 text-2xl">Who made this?</h2>
		<p class="mb-4 leading-relaxed">
			Donut Shooter was built for fun by Kevin Peckham at
			<a
				class="underline transition-colors hover:text-yellow-300"
				href="https://www.lightningjar.com">Lightning Jar</a
			> in Philadelphia.
		</p>
		<p class="mb-4 leading-relaxed">
			Curious how it was built? Read the blog post
			<a
				class="underline transition-colors hover:text-yellow-300"
				href="https://www.lightningjar.com/blog/the-arcade-game-with-no-game-loop"
				>The Arcade Game with No Game Loop</a
			>. The game is also open source — the code is available on
			<a
				class="underline transition-colors hover:text-yellow-300"
				href="https://github.com/kevinpeckham/donut-shooter">GitHub</a
			>.
		</p>

		<p class="mt-12">
			<a class="underline transition-colors hover:text-yellow-300" href="/"
				>← Back to the game</a
			>
		</p>
	</div>
</main>

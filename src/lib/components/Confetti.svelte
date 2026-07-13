<!--
@component
Full-screen celebratory confetti for the win screen. Pure CSS animation;
each piece gets a random position, color, and timing when it mounts.
-->

<script lang="ts">
const COLORS = [
	"#f43f5e",
	"#f59e0b",
	"#facc15",
	"#4ade80",
	"#38bdf8",
	"#a78bfa",
	"#f472b6",
	"#ffffff",
];

const pieces = Array.from({ length: 120 }, (_, index) => ({
	id: index,
	left: Math.random() * 100,
	delay: Math.random() * 4,
	duration: 3 + Math.random() * 3,
	width: 6 + Math.random() * 8,
	color: COLORS[index % COLORS.length],
	spin: Math.random() < 0.5 ? 1 : -1,
}));
</script>

<div
	class="pointer-events-none fixed inset-0 overflow-hidden"
	aria-hidden="true"
>
	{#each pieces as piece (piece.id)}
		<div
			class="confetti absolute"
			style="left: {piece.left}%; width: {piece.width}px; height: {piece.width *
				0.4}px; background-color: {piece.color}; animation-delay: {piece.delay}s; animation-duration: {piece.duration}s; --spin: {piece.spin};"
		></div>
	{/each}
</div>

<style>
.confetti {
	top: -20px;
	animation-name: confetti-fall;
	animation-timing-function: linear;
	animation-iteration-count: infinite;
}

@keyframes confetti-fall {
	0% {
		transform: translateY(0) rotate(0deg);
		opacity: 1;
	}
	100% {
		transform: translateY(110vh) rotate(calc(var(--spin) * 720deg));
		opacity: 0.7;
	}
}
</style>

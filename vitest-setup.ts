// Extends Vitest's `expect` with @testing-library/jest-dom matchers
// (toBeInTheDocument, toHaveAttribute, etc.) for component tests. Inert for the
// .ts-only unit/integration tests (just adds matchers; no DOM access).
import "@testing-library/jest-dom/vitest";

// jsdom implements neither the Web Animations API (used by Svelte 5
// `transition:`) nor `matchMedia` (used by svelte/motion for
// prefers-reduced-motion) — stub both so components render in tests.
if (typeof window !== "undefined") {
	if (!window.matchMedia) {
		window.matchMedia = (query: string) =>
			({
				matches: false,
				media: query,
				onchange: null,
				addEventListener: () => {},
				removeEventListener: () => {},
				addListener: () => {},
				removeListener: () => {},
				dispatchEvent: () => false,
			}) as MediaQueryList;
	}
	if (!Element.prototype.animate) {
		Element.prototype.animate = function animate() {
			const animation = {
				cancel: () => {},
				finish: () => {},
				pause: () => {},
				play: () => {},
				reverse: () => {},
				finished: Promise.resolve(),
				onfinish: null as (() => void) | null,
				oncancel: null as (() => void) | null,
			};
			// complete asynchronously so intros/outros resolve
			queueMicrotask(() => animation.onfinish?.());
			return animation as unknown as Animation;
		};
	}
}

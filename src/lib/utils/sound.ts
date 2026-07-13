/**
 * Fire-and-forget sound-effect playback. Safe to call in non-browser
 * environments (SSR, tests) where Audio is unavailable or unimplemented.
 */
export function playSound(path: string): void {
	if (typeof Audio === "undefined") return;
	try {
		void new Audio(path).play()?.catch(() => {});
	} catch {
		// jsdom implements the Audio constructor but not playback
	}
}

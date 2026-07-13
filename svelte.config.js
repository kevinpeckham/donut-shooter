// vercel adapter
import { default as vercel } from "@sveltejs/adapter-vercel";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Use vitePreprocess for TypeScript support
	preprocess: vitePreprocess(),
	kit: {
		adapter: vercel(),
		alias: {
			$assets: "./src/lib/assets",
			$components: "./src/lib/components",
			$data: "./src/lib/data",
			$settings: "./src/lib/settings",
			$stores: "./src/lib/stores",
			$types: "./src/lib/types",
			$utils: "./src/lib/utils",
		},
	},
	compilerOptions: {
		discloseVersion: false,
		runes: true,
	},
};

export default config;

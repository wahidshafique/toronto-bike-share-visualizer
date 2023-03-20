import adapter from 'sveltekit-adapter-chrome-extension';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		alias: {
			stores: './src/stores.ts',
			components: './src/components'
		},
		adapter: adapter({
			// default options are shown
			pages: 'build',
			assets: 'build',
			// fallback: null,
			precompress: false,
			manifest: 'manifest.json'
		}),
		appDir: 'app',
		prerender: {
			concurrency: 2
		}
	}
};

export default config;

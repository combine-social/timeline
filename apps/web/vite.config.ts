import type { UserConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import path from 'path';

const config: UserConfig = {
	plugins: [sveltekit()],
	test: {
		includeSource: ['src/**/*.{test,spec}.{js,ts}'],
		globals: true,
		environment: 'jsdom'
	},
	resolve: {
		alias: {
			$lib: path.resolve(__dirname, './src/lib')
		}
	}
};

export default config;

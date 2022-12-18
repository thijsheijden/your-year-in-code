import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
  resolve: {
    alias: {
      'node-fetch': 'isomorphic-fetch',
    },
  },
};

export default config;

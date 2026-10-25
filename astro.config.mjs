import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// GitHub Pages project site: https://ivanabdurrafie.github.io/ivanlabs/
export default defineConfig({
  site: 'https://ivanabdurrafie.github.io',
  base: '/ivanlabs',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  build: {
    inlineStylesheets: 'auto',
  },
});

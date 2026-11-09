// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import yaml from '@rollup/plugin-yaml';

export default defineConfig({
  site: 'https://hvdxx.github.io',
  base: '/hadiahmed.com',
  trailingSlash: 'ignore',
  output: 'static',
  integrations: [sitemap()],
  vite: { plugins: [yaml()] },
});

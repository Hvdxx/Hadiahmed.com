// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import yaml from '@rollup/plugin-yaml';
import { photoRows } from './src/plugins/rehype-photo-rows.ts';

export default defineConfig({
  site: 'https://hvdxx.github.io',
  base: '/Hadiahmed.com', // must match the GitHub repo name exactly (Pages paths are case-sensitive)
  trailingSlash: 'ignore',
  output: 'static',
  redirects: { '/photos': '/Hadiahmed.com/gallery' },
  integrations: [sitemap()],
  markdown: { rehypePlugins: [photoRows] },
  vite: { plugins: [yaml()] },
});

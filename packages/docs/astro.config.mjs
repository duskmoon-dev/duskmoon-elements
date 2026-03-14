import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  integrations: [mdx()],
  site: 'https://duskmoon-dev.github.io',
  base: '/duskmoon-elements',
  output: 'static',
  server: {
    port: 4331,
  },
  vite: {
    optimizeDeps: {
      include: ['mermaid'],
    },
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      defaultColor: false,
    },
  },
});

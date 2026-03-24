import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { fileURLToPath } from 'node:url';

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
      // Exclude workspace element packages so Vite resolves them from source
      exclude: ['@duskmoon-dev/el-markdown-input'],
    },
    resolve: {
      alias: {
        // Point workspace packages to their TypeScript source for live HMR
        '@duskmoon-dev/el-markdown-input': fileURLToPath(
          new URL('../../elements/markdown-input/src/index.ts', import.meta.url)
        ),
      },
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

import { resolve } from 'path';
import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';

const pageData = {
  '/index.html': {
    title: 'Playground',
  },
  '/button.html': {
    title: 'Button',
    name: 'Button',
    tag: 'el-dm-button',
    description:
      'Button component with multiple variants, sizes, loading states, and icon support through slots.',
  },
  '/card.html': {
    title: 'Card',
    name: 'Card',
    tag: 'el-dm-card',
    description:
      'Card container with header, content, footer, and media slots. Supports multiple variants and interactive states.',
  },
  '/input.html': {
    title: 'Input',
    name: 'Input',
    tag: 'el-dm-input',
    description:
      'Input component with validation states, multiple types, prefix/suffix slots, and helper text support.',
  },
  '/markdown.html': {
    title: 'Markdown',
    name: 'Markdown',
    tag: 'el-dm-markdown',
    description:
      'Markdown renderer with GitHub Flavored Markdown support, syntax highlighting, and customizable themes.',
  },
};

export default defineConfig({
  plugins: [
    handlebars({
      partialDirectory: resolve(__dirname, 'partials'),
      context(pagePath) {
        return pageData[pagePath] || {};
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 4220,
    open: false,
  },
  preview: {
    host: '0.0.0.0',
    port: 4220,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        button: resolve(__dirname, 'button.html'),
        card: resolve(__dirname, 'card.html'),
        input: resolve(__dirname, 'input.html'),
        markdown: resolve(__dirname, 'markdown.html'),
      },
    },
  },
});

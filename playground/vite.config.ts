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
  '/cascader.html': {
    title: 'Cascader',
    name: 'Cascader',
    tag: 'el-dm-cascader',
    description:
      'Multi-panel cascading selection for hierarchical data like locations, categories, and organizational structures.',
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
  '/markdown-input.html': {
    title: 'Markdown Input',
    name: 'Markdown Input',
    tag: 'el-dm-markdown-input',
    description:
      'Markdown editor with syntax-highlighted write mode, preview, file upload, autocomplete, and word count.',
  },
  '/select.html': {
    title: 'Select',
    name: 'Select',
    tag: 'el-dm-select',
    description:
      'Select component with single, multi-select, and tree-select modes with search and filtering support.',
  },
  '/pro-data-grid.html': {
    title: 'Pro Data Grid',
    name: 'Pro Data Grid',
    tag: 'el-dm-pro-data-grid',
    description:
      'Enterprise-grade data grid with virtual scrolling, sorting, filtering, editing, grouping, and export.',
  },
  '/art-moon.html': {
    title: 'Moon',
    name: 'Moon',
    tag: 'el-dm-art-moon',
    description: 'Pure CSS moon illustration with full and crescent variants, optional glow, and size options.',
  },
  '/art-sun.html': {
    title: 'Sun',
    name: 'Sun',
    tag: 'el-dm-art-sun',
    description: 'Pure CSS sun with day and sunset variants, optional rays, and pulse animation.',
  },
  '/art-atom.html': {
    title: 'Atom',
    name: 'Atom',
    tag: 'el-dm-art-atom',
    description: 'Pure CSS atom illustration with animated orbiting electrons.',
  },
  '/art-eclipse.html': {
    title: 'Eclipse',
    name: 'Eclipse',
    tag: 'el-dm-art-eclipse',
    description: 'Pure CSS solar eclipse with moon silhouette and layered corona glow.',
  },
  '/art-mountain.html': {
    title: 'Mountain',
    name: 'Mountain',
    tag: 'el-dm-art-mountain',
    description: 'Pure CSS mountain landscape with single peak and range variants, plus sunset mode.',
  },
  '/art-plasma-ball.html': {
    title: 'Plasma Ball',
    name: 'Plasma Ball',
    tag: 'el-dm-art-plasma-ball',
    description: 'Pure CSS plasma ball with animated electric rays, glass sphere, base, and switch.',
  },
  '/art-cat-stargazer.html': {
    title: 'Cat Stargazer',
    name: 'Cat Stargazer',
    tag: 'el-dm-art-cat-stargazer',
    description: 'Pure CSS cat sitting on a hill gazing at the moon on a starry night.',
  },
  '/art-color-spin.html': {
    title: 'Color Spin',
    name: 'Color Spin',
    tag: 'el-dm-art-color-spin',
    description: 'Pure CSS animated spinning color wheel with four rotating segments.',
  },
  '/art-synthwave-starfield.html': {
    title: 'Synthwave Starfield',
    name: 'Synthwave Starfield',
    tag: 'el-dm-art-synthwave-starfield',
    description: 'Pure CSS retro synthwave scene with perspective grid, animated stars, and neon gradient sky.',
  },
  '/art-circular-gallery.html': {
    title: 'Circular Gallery',
    name: 'Circular Gallery',
    tag: 'el-dm-art-circular-gallery',
    description: 'Pure CSS circular image gallery with items arranged in a rotating ring.',
  },
  '/art-snow.html': {
    title: 'Snow',
    name: 'Snow',
    tag: 'el-dm-art-snow',
    description: 'Pure CSS animated snowfall with configurable count, unicode snowflakes, and falling animation.',
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
  optimizeDeps: {
    // Don't pre-bundle @duskmoon-dev/core so changes are picked up on reinstall
    exclude: ['@duskmoon-dev/core'],
  },
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
        cascader: resolve(__dirname, 'cascader.html'),
        input: resolve(__dirname, 'input.html'),
        markdown: resolve(__dirname, 'markdown.html'),
        'markdown-input': resolve(__dirname, 'markdown-input.html'),
        select: resolve(__dirname, 'select.html'),
        'pro-data-grid': resolve(__dirname, 'pro-data-grid.html'),
        'art-moon': resolve(__dirname, 'art-moon.html'),
        'art-sun': resolve(__dirname, 'art-sun.html'),
        'art-atom': resolve(__dirname, 'art-atom.html'),
        'art-eclipse': resolve(__dirname, 'art-eclipse.html'),
        'art-mountain': resolve(__dirname, 'art-mountain.html'),
        'art-plasma-ball': resolve(__dirname, 'art-plasma-ball.html'),
        'art-cat-stargazer': resolve(__dirname, 'art-cat-stargazer.html'),
        'art-color-spin': resolve(__dirname, 'art-color-spin.html'),
        'art-synthwave-starfield': resolve(__dirname, 'art-synthwave-starfield.html'),
        'art-circular-gallery': resolve(__dirname, 'art-circular-gallery.html'),
        'art-snow': resolve(__dirname, 'art-snow.html'),
      },
    },
  },
});

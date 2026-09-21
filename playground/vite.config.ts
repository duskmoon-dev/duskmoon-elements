import { resolve } from 'path';
import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';

const pageData = {
  '/index.html': {
    title: 'Playground',
  },
  '/carousel.html': { title: 'Carousel', name: 'Carousel', tag: 'el-dm-carousel' },
  '/console-page.html': { title: 'Console Page', name: 'Console Page', tag: 'el-dm-console-page' },
  '/countdown.html': { title: 'Countdown', name: 'Countdown', tag: 'el-dm-countdown' },
  '/diff.html': { title: 'Diff', name: 'Diff', tag: 'el-dm-diff' },
  '/dropdown.html': { title: 'Dropdown', name: 'Dropdown', tag: 'el-dm-dropdown' },
  '/fab.html': { title: 'FAB', name: 'FAB', tag: 'el-dm-fab' },
  '/file-input.html': { title: 'File Input', name: 'File Input', tag: 'el-dm-file-input' },
  '/filter-group.html': {
    title: 'Filter Group',
    name: 'Filter Group',
    tag: 'el-dm-filter-group',
  },
  '/footer.html': { title: 'Footer', name: 'Footer', tag: 'el-dm-footer' },
  '/hero.html': { title: 'Hero', name: 'Hero', tag: 'el-dm-hero' },
  '/home-page.html': { title: 'Home Page', name: 'Home Page', tag: 'el-dm-home-page' },
  '/indicator.html': { title: 'Indicator', name: 'Indicator', tag: 'el-dm-indicator' },
  '/join.html': { title: 'Join', name: 'Join', tag: 'el-dm-join' },
  '/kbd.html': { title: 'Keyboard Key', name: 'Keyboard Key', tag: 'el-dm-kbd' },
  '/link.html': { title: 'Link', name: 'Link', tag: 'el-dm-link' },
  '/loading.html': { title: 'Loading', name: 'Loading', tag: 'el-dm-loading' },
  '/mask.html': { title: 'Mask', name: 'Mask', tag: 'el-dm-mask' },
  '/megamenu.html': { title: 'Megamenu', name: 'Megamenu', tag: 'el-dm-megamenu' },
  '/radial-progress.html': {
    title: 'Radial Progress',
    name: 'Radial Progress',
    tag: 'el-dm-radial-progress',
  },
  '/range.html': { title: 'Range', name: 'Range', tag: 'el-dm-range' },
  '/sidebar-layout.html': {
    title: 'Sidebar Layout',
    name: 'Sidebar Layout',
    tag: 'el-dm-sidebar-layout',
  },
  '/sign-page.html': { title: 'Sign Page', name: 'Sign Page', tag: 'el-dm-sign-page' },
  '/stack.html': { title: 'Stack', name: 'Stack', tag: 'el-dm-stack' },
  '/stat.html': { title: 'Stat', name: 'Stat', tag: 'el-dm-stat' },
  '/swap.html': { title: 'Swap', name: 'Swap', tag: 'el-dm-swap' },
  '/toggle-switch.html': {
    title: 'Toggle Switch',
    name: 'Toggle Switch',
    tag: 'el-dm-toggle-switch',
  },
  '/validator.html': { title: 'Validator', name: 'Validator', tag: 'el-dm-validator' },
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
  '/chip.html': {
    title: 'Chip',
    name: 'Chip',
    tag: 'el-dm-chip',
    description:
      'Accessible chip component with display, link, action, selection, deletion, and disabled modes.',
  },
  '/datetime.html': {
    title: 'Datetime',
    name: 'Datetime',
    tag: 'el-dm-datetime',
    description:
      'Display-only ISO date and datetime formatting with custom tokens and time-zone conversion.',
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
    description:
      'Pure CSS moon illustration with full and crescent variants, optional glow, and size options.',
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
    description:
      'Pure CSS mountain landscape with single peak and range variants, plus sunset mode.',
  },
  '/art-plasma-ball.html': {
    title: 'Plasma Ball',
    name: 'Plasma Ball',
    tag: 'el-dm-art-plasma-ball',
    description:
      'Pure CSS plasma ball with animated electric rays, glass sphere, base, and switch.',
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
    description:
      'Pure CSS retro synthwave scene with perspective grid, animated stars, and neon gradient sky.',
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
    description:
      'Pure CSS animated snowfall with configurable count, unicode snowflakes, and falling animation.',
  },
};

export default defineConfig({
  plugins: [
    {
      name: 'duskmoon-css-art-raw-imports',
      enforce: 'pre',
      transform(code, id) {
        if (!id.includes('/art-elements/') || !id.endsWith('.ts')) return;

        return code.replace(
          /(@duskmoon-dev\/css-art\/[^'"]+\.css)(['"]) with \{ type: ['"]text['"] \}/g,
          '$1?raw$2',
        );
      },
    },
    handlebars({
      partialDirectory: resolve(import.meta.dirname, 'partials'),
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
        main: resolve(import.meta.dirname, 'index.html'),
        carousel: resolve(import.meta.dirname, 'carousel.html'),
        'console-page': resolve(import.meta.dirname, 'console-page.html'),
        countdown: resolve(import.meta.dirname, 'countdown.html'),
        diff: resolve(import.meta.dirname, 'diff.html'),
        dropdown: resolve(import.meta.dirname, 'dropdown.html'),
        fab: resolve(import.meta.dirname, 'fab.html'),
        'file-input': resolve(import.meta.dirname, 'file-input.html'),
        'filter-group': resolve(import.meta.dirname, 'filter-group.html'),
        footer: resolve(import.meta.dirname, 'footer.html'),
        hero: resolve(import.meta.dirname, 'hero.html'),
        'home-page': resolve(import.meta.dirname, 'home-page.html'),
        indicator: resolve(import.meta.dirname, 'indicator.html'),
        join: resolve(import.meta.dirname, 'join.html'),
        kbd: resolve(import.meta.dirname, 'kbd.html'),
        link: resolve(import.meta.dirname, 'link.html'),
        loading: resolve(import.meta.dirname, 'loading.html'),
        mask: resolve(import.meta.dirname, 'mask.html'),
        megamenu: resolve(import.meta.dirname, 'megamenu.html'),
        'radial-progress': resolve(import.meta.dirname, 'radial-progress.html'),
        range: resolve(import.meta.dirname, 'range.html'),
        'sidebar-layout': resolve(import.meta.dirname, 'sidebar-layout.html'),
        'sign-page': resolve(import.meta.dirname, 'sign-page.html'),
        stack: resolve(import.meta.dirname, 'stack.html'),
        stat: resolve(import.meta.dirname, 'stat.html'),
        swap: resolve(import.meta.dirname, 'swap.html'),
        'toggle-switch': resolve(import.meta.dirname, 'toggle-switch.html'),
        validator: resolve(import.meta.dirname, 'validator.html'),
        button: resolve(import.meta.dirname, 'button.html'),
        card: resolve(import.meta.dirname, 'card.html'),
        cascader: resolve(import.meta.dirname, 'cascader.html'),
        chip: resolve(import.meta.dirname, 'chip.html'),
        datetime: resolve(import.meta.dirname, 'datetime.html'),
        input: resolve(import.meta.dirname, 'input.html'),
        markdown: resolve(import.meta.dirname, 'markdown.html'),
        'markdown-input': resolve(import.meta.dirname, 'markdown-input.html'),
        select: resolve(import.meta.dirname, 'select.html'),
        'pro-data-grid': resolve(import.meta.dirname, 'pro-data-grid.html'),
        'art-moon': resolve(import.meta.dirname, 'art-moon.html'),
        'art-sun': resolve(import.meta.dirname, 'art-sun.html'),
        'art-atom': resolve(import.meta.dirname, 'art-atom.html'),
        'art-eclipse': resolve(import.meta.dirname, 'art-eclipse.html'),
        'art-mountain': resolve(import.meta.dirname, 'art-mountain.html'),
        'art-plasma-ball': resolve(import.meta.dirname, 'art-plasma-ball.html'),
        'art-cat-stargazer': resolve(import.meta.dirname, 'art-cat-stargazer.html'),
        'art-color-spin': resolve(import.meta.dirname, 'art-color-spin.html'),
        'art-synthwave-starfield': resolve(import.meta.dirname, 'art-synthwave-starfield.html'),
        'art-circular-gallery': resolve(import.meta.dirname, 'art-circular-gallery.html'),
        'art-snow': resolve(import.meta.dirname, 'art-snow.html'),
      },
    },
  },
});

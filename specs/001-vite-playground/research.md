# Research: Vite Playground Package

**Feature**: 001-vite-playground
**Date**: 2025-12-31

## Overview

This document captures research findings for implementing the Vite-powered playground package. Since the Technical Context had no NEEDS CLARIFICATION items, research focuses on best practices and integration patterns.

## Research Topics

### 1. Vite MPA Configuration

**Decision**: Use Vite's built-in MPA support with `build.rollupOptions.input` for multiple HTML entry points.

**Rationale**:
- Vite natively supports multi-page applications without additional plugins
- Each HTML file becomes a separate entry point with its own JavaScript bundle
- Supports HMR out of the box for all entry points

**Configuration Pattern**:
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'src/pages/index.html',
        button: 'src/pages/button.html',
        card: 'src/pages/card.html',
        input: 'src/pages/input.html',
        markdown: 'src/pages/markdown.html',
      },
    },
  },
});
```

**Alternatives Considered**:
- Vite plugin for auto-discovery of HTML files: Adds complexity, not needed for 5 pages
- Single SPA with client-side routing: Rejected per spec (MPA architecture chosen)

---

### 2. Workspace Package Integration

**Decision**: Create playground as a workspace package in `packages/playground/` with workspace dependencies.

**Rationale**:
- Follows existing monorepo pattern established in constitution
- Workspace dependencies (`workspace:*`) allow development against local element packages
- Vite resolves workspace packages correctly during development

**Package.json Pattern**:
```json
{
  "name": "@duskmoon-dev/playground",
  "private": true,
  "dependencies": {
    "@duskmoon-dev/el-button": "workspace:*",
    "@duskmoon-dev/el-card": "workspace:*",
    "@duskmoon-dev/el-input": "workspace:*",
    "@duskmoon-dev/el-markdown": "workspace:*"
  },
  "devDependencies": {
    "vite": "^6.0.0"
  }
}
```

**Alternatives Considered**:
- Standalone project outside monorepo: Loses workspace benefits, complicates development
- npm link for dependencies: More fragile than workspace protocol

---

### 3. Element Registration Strategy

**Decision**: Each page's TypeScript entry point imports and registers only the element it demonstrates.

**Rationale**:
- Minimizes bundle size per page
- Follows tree-shaking principles from constitution
- Each element package exports a `register()` function

**Pattern**:
```typescript
// src/scripts/button.ts
import { register } from '@duskmoon-dev/el-button';
register();
```

**Alternatives Considered**:
- Global registration of all elements: Larger bundles, not tree-shakable
- Lazy loading elements: Overengineering for 4 elements

---

### 4. Navigation Component

**Decision**: Implement navigation as static HTML with shared CSS, included in each page.

**Rationale**:
- Follows Web Standards First principle (no framework)
- Simple to maintain for small number of pages
- No JavaScript required for navigation (standard `<a>` links)

**Pattern**:
```html
<nav class="playground-nav">
  <a href="/index.html">Home</a>
  <a href="/button.html">Button</a>
  <a href="/card.html">Card</a>
  <a href="/input.html">Input</a>
  <a href="/markdown.html">Markdown</a>
</nav>
```

**Alternatives Considered**:
- Navigation as Web Component: Adds complexity, requires custom element for playground itself
- JavaScript-generated navigation: Unnecessary when pages are static

---

### 5. Dev Server and HMR

**Decision**: Use Vite's default dev server configuration with no custom plugins.

**Rationale**:
- Vite provides HMR for TypeScript and CSS out of the box
- Custom elements work well with Vite's HMR when re-registering is handled
- Dev server startup is fast (< 5s goal easily achievable)

**Note on HMR for Custom Elements**:
- Custom elements cannot be re-defined (browser limitation)
- HMR will reload the page when element source changes
- This is acceptable behavior for a development playground

**Alternatives Considered**:
- Custom HMR plugin for Web Components: Complex and fragile
- Full page refresh only: Already the default behavior for element changes

---

### 6. Build Output

**Decision**: Build to `dist/` directory with static HTML, JS, and CSS files.

**Rationale**:
- Standard Vite output configuration
- Suitable for static hosting (GitHub Pages, Netlify, etc.)
- No server-side runtime required

**Build Command**: `vite build`

**Alternatives Considered**:
- SSR/SSG: Overengineering for static demo pages

---

## Summary

All research items resolved with clear decisions. No blockers identified. The playground implementation will use:

1. Vite with MPA configuration (multiple HTML inputs)
2. Workspace package with `workspace:*` dependencies
3. Per-page element registration via TypeScript entry points
4. Static HTML navigation with shared CSS
5. Default Vite dev server with standard HMR
6. Static build output for deployment

Ready to proceed to Phase 1: Design & Contracts.

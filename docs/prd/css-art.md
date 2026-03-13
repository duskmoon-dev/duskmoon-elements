# CSS Art Elements — Product Requirements Document

**Package:** `@duskmoon-dev/css-art` (upstream) → `@duskmoon-dev/el-art-*` (custom elements)
**Status:** Specification
**Date:** 2026-03-12

---

## 1. Overview

`@duskmoon-dev/css-art` (v0.2.0) is a published CSS-only illustration library containing 11 pure-CSS art components. This PRD specifies the work to wrap each illustration as a custom element (web component), bundle them, and integrate them into the docs site and playground.

### Goals

- Expose every css-art illustration as a first-class `<el-dm-art-*>` custom element
- Follow the existing `@duskmoon-dev/el-*` package conventions exactly
- Add a "CSS Art" top-level section to the docs site, parallel to "Components"
- Add a "CSS Art" section to the playground index, distinct from the elements section
- Add theme toggle to playground

---

## 2. Upstream Package

**Package:** `@duskmoon-dev/css-art ^0.2.0`
**Source:** `duskmoon-dev/duskmoonui` monorepo, `packages/css-art/`

**Exports:**
```json
{
  ".": "./dist/index.css",
  "./art": "./dist/art/index.css"
}
```

Individual art CSS files available at `./dist/art/<name>.css` (not explicitly exported but resolvable).

**All styles wrapped in `@layer css-art { }` to avoid cascade conflicts.**
**All class names prefixed with `.art-`.**
**All custom properties prefixed with `--art-`.**

---

## 3. CSS Art Inventory

### 3.1 Simple Arts (single root div, no child elements required)

| Art | CSS Class | Custom Element | Tag |
|-----|-----------|----------------|-----|
| Moon | `.art-moon` | `ElDmArtMoon` | `<el-dm-art-moon>` |
| Sun | `.art-sun` | `ElDmArtSun` | `<el-dm-art-sun>` |
| Mountain (single) | `.art-mountain` | `ElDmArtMountain` | `<el-dm-art-mountain>` |

### 3.2 Structural Arts (root div + small set of named child divs)

| Art | CSS Class | Child DOM Required | Custom Element | Tag |
|-----|-----------|-------------------|----------------|-----|
| Atom | `.art-atom` | 3 divs: `.electron.electron-alpha`, `.electron.electron-omega`, `.electron` | `ElDmArtAtom` | `<el-dm-art-atom>` |
| Eclipse | `.art-eclipse` | 6 divs: `.layer.layer-1` … `.layer.layer-6` | `ElDmArtEclipse` | `<el-dm-art-eclipse>` |
| Mountain Range | `.art-mountain.art-mountain-range` | 3 divs: `.art-peak` × 3 | _(variant of ElDmArtMountain)_ | `<el-dm-art-mountain variant="range">` |
| Color Spin | `.art-color-spin` | `<ul>` with 4 `<li>` children | `ElDmArtColorSpin` | `<el-dm-art-color-spin>` |
| Synthwave Starfield | `.art-synthwave-starfield` | 4 divs: `.art-synthwave-starfield-lefrig.art-synthwave-starfield-sides`, `.art-synthwave-starfield-topbot.art-synthwave-starfield-sides`, `.art-synthwave-starfield-stars` × 2 | `ElDmArtSynthwaveStarfield` | `<el-dm-art-synthwave-starfield>` |

### 3.3 Complex Arts (deeply nested DOM, interactive, or image-dependent)

| Art | CSS Class | Notes | Custom Element | Tag |
|-----|-----------|-------|----------------|-----|
| Plasma Ball | `.art-plasma-ball` | Interactive (CSS checkbox toggle), complex inner DOM with rays, electrode, glass ball, base, switch | `ElDmArtPlasmaBall` | `<el-dm-art-plasma-ball>` |
| Cat Stargazer | `.art-cat-stargazer` | Deeply nested: `.moon`, `.cat` with body/head/ears/eyes/whiskers | `ElDmArtCatStargazer` | `<el-dm-art-cat-stargazer>` |
| Circular Gallery | `.art-circular-gallery` | Requires `h1`, `div > a > img` per card, uses CSS anchor positioning + `@property`, content-dependent | `ElDmArtCircularGallery` | `<el-dm-art-circular-gallery>` |
| Snow | `.art-snowflake` | Primitive element — individual snowflake; element renders a configurable snow scene (N snowflakes) | `ElDmArtSnow` | `<el-dm-art-snow>` |

---

## 4. Package Architecture

### 4.1 Workspace Layout

```
duskmoon-elements/
├── css-arts/                    # NEW — one package per art
│   ├── moon/
│   ├── sun/
│   ├── atom/
│   ├── eclipse/
│   ├── mountain/
│   ├── plasma-ball/
│   ├── cat-stargazer/
│   ├── color-spin/
│   ├── synthwave-starfield/
│   ├── circular-gallery/
│   └── snow/
├── packages/
│   ├── base/                    # existing
│   ├── elements/                # existing
│   └── css-arts/                # NEW — bundle of all art elements
├── elements/                    # existing UI elements (unchanged)
├── playground/                  # updated
└── packages/docs/               # updated
```

Add `"css-arts/*"` to root `package.json` workspaces array.

### 4.2 Per-Art Package Structure

Each `css-arts/<name>/` package:

```
css-arts/moon/
├── src/
│   ├── el-dm-art-moon.ts        # Main class
│   ├── index.ts                 # Exports class + register()
│   └── register.ts              # Auto-registers on import
├── package.json
├── tsconfig.json
└── bunfig.toml
```

**package.json naming:** `@duskmoon-dev/el-art-<name>`
**tsconfig.json:** extends root, references `../../packages/base`
**bunfig.toml:** `preload = ["../../test-setup.ts"]`

### 4.3 Package Dependencies

```json
{
  "dependencies": {
    "@duskmoon-dev/el-base": "workspace:*",
    "@duskmoon-dev/css-art": "^0.2.0"
  }
}
```

Note: `@duskmoon-dev/css-art` is a published npm package (not workspace), so it uses a versioned semver range.

### 4.4 Bundle Package `packages/css-arts/`

**npm name:** `@duskmoon-dev/art-elements`

```typescript
// src/index.ts
export { ElDmArtMoon, register as registerArtMoon } from '@duskmoon-dev/el-art-moon';
// ... all 11

export function registerAllArts(): void { /* calls all register fns */ }

// src/register.ts
import { registerAllArts } from './index.js';
registerAllArts();
```

---

## 5. Element Implementation Pattern

### 5.1 CSS Loading

Each art element imports its individual CSS as a build-time text string using Bun's import assertion, then strips the `@layer css-art {}` wrapper before creating a `CSSStyleSheet`:

```typescript
import rawCss from '@duskmoon-dev/css-art/dist/art/moon.css' with { type: 'text' };

// Strip @layer wrapper — same pattern used across all art elements
const coreCss = rawCss.replace(/@layer\s+css-art\s*\{/, '').replace(/\}\s*$/, '');

const styles = css`
  :host { display: inline-block; }
  :host([hidden]) { display: none !important; }
  ${coreCss}
`;
```

This inlines CSS as a string literal at bundle time — no runtime file reads, Shadow DOM encapsulated.

### 5.2 Class Pattern

```typescript
export class ElDmArtMoon extends BaseElement {
  static properties = {
    variant: { type: String, reflect: true, default: 'full' },
    size:    { type: String, reflect: true },
    glow:    { type: Boolean, reflect: true },
  };

  declare variant: string;
  declare size: string;
  declare glow: boolean;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  render(): string {
    const classes = ['art-moon'];
    if (this.variant === 'crescent') classes.push('art-moon-crescent');
    if (this.size && this.size !== 'md') classes.push(`art-moon-${this.size}`);
    if (this.glow) classes.push('art-moon-glow');
    return `<div class="${classes.join(' ')}"></div>`;
  }
}
```

### 5.3 Properties per Art

| Art | Properties | Notes |
|-----|-----------|-------|
| moon | `variant: 'full'\|'crescent'`, `size: 'sm'\|'md'\|'lg'\|'xl'`, `glow: boolean` | |
| sun | `variant: 'default'\|'sunset'`, `size: 'sm'\|'md'\|'lg'\|'xl'`, `rays: boolean`, `pulse: boolean` | |
| atom | `size: 'sm'\|'md'\|'lg'` | Fixed 3-electron DOM |
| eclipse | `size: 'sm'\|'md'\|'lg'` | Fixed 6-layer DOM |
| mountain | `variant: 'single'\|'range'\|'sunset'\|'forest'`, `size: 'sm'\|'md'\|'lg'` | Range needs `.art-peak` children |
| plasma-ball | `size: 'sm'\|'md'\|'lg'` | Complex DOM hard-coded; interactive toggle built-in |
| cat-stargazer | `size: 'sm'\|'md'\|'lg'` | Full cat+stargazer DOM hard-coded |
| color-spin | `size: 'sm'\|'md'\|'lg'` | Renders `ul > li × 4` with `--i` CSS vars |
| synthwave-starfield | `size: 'sm'\|'md'\|'lg'`, `paused: boolean` | 4 child divs required |
| circular-gallery | `size: 'sm'\|'md'\|'lg'`, `title: string` | Renders placeholder cards; `slot` for custom cards |
| snow | `count: number` (default 12), `unicode: boolean`, `fall: boolean` | Renders N `.art-snowflake` divs |

### 5.4 `@property` Declaration Handling

`circular-gallery.css` contains a top-level `@property` declaration outside `@layer`. After stripping the `@layer` wrapper, the `@property` rule remains in the stylesheet — this is correct behavior as constructable stylesheets support `@property` in modern browsers. No special handling needed.

---

## 6. Build Scripts

Root `package.json` additions:

```json
{
  "scripts": {
    "build:css-arts": "bun run --filter '@duskmoon-dev/el-art-*' build",
    "build:css-arts-bundle": "bun run --filter @duskmoon-dev/art-elements build",
    "build:all": "bun run build:base && bun run build:elements && bun run build:bundle && bun run build:css-arts && bun run build:css-arts-bundle"
  }
}
```

Per-art `build:esm` / `build:cjs` / `build:types` scripts follow the identical pattern as existing elements, with `--external @duskmoon-dev/el-base` (css-art is bundled in, not external, since it provides CSS text).

---

## 7. Docs Site Integration

### 7.1 Content Schema

Add `'css-art'` to the `section` enum in `packages/docs/src/content/config.ts`.

### 7.2 Top Navigation

Modify `packages/docs/src/layouts/DocsLayout.astro` header to add navigation links between the logo and header-actions:

```
[DuskMoon Elements]  [Components] [CSS Art]  [Theme ▼] [GitHub]
```

- **Components** → `/duskmoon-elements/docs/getting-started` (existing docs root)
- **CSS Art** → `/duskmoon-elements/docs/css-art/moon` (first css-art page)
- Active state derived from `currentPath.includes('/docs/css-art')`

### 7.3 Sidebar Filtering

Modify `packages/docs/src/components/DocsSidebar.astro` to filter the content collection based on the current path:

- Path under `/docs/css-art/` → show only `section: 'css-art'` docs
- All other docs paths → exclude `section: 'css-art'` docs (show existing sections only)

Add to `sectionConfig`:
```typescript
'css-art': { order: 80, label: 'CSS Art' },
```

### 7.4 MDX Pages

Create `packages/docs/src/content/docs/css-art/` with 11 MDX files:

```
css-art/
├── moon.mdx         (order: 1)
├── sun.mdx          (order: 2)
├── atom.mdx         (order: 3)
├── eclipse.mdx      (order: 4)
├── mountain.mdx     (order: 5)
├── plasma-ball.mdx  (order: 6)
├── cat-stargazer.mdx (order: 7)
├── color-spin.mdx   (order: 8)
├── synthwave-starfield.mdx (order: 9)
├── circular-gallery.mdx (order: 10)
└── snow.mdx         (order: 11)
```

Frontmatter per page:
```yaml
---
title: Moon
description: Pure-CSS lunar art with full moon and crescent variants
order: 1
section: css-art
component: "@duskmoon-dev/el-art-moon"
---
```

Each page includes: installation, usage, live `<ComponentDemo>` demos, properties table, CSS custom properties table.

### 7.5 Element Registration

Update `packages/docs/src/scripts/register-elements.ts` to import and call `register()` for all 11 art elements.

---

## 8. Playground Integration

### 8.1 Index Page Grouping

Split `playground/index.html` flat grid into two labeled sections:

```
## Elements
[grid of existing 35 element cards]

## CSS Art
[grid of 11 art cards]
```

Add `section-heading` CSS class for section headers.

### 8.2 Theme Toggle

Add sunshine/moonlight theme toggle to playground index header. The toggle sets `document.documentElement.dataset.theme` (same mechanism as docs site).

### 8.3 Per-Art Playground Pages

Create 11 new playground pages: `playground/art-moon.html`, `playground/art-sun.html`, etc.

Each page follows the existing Handlebars partial pattern:
- `{{> head}}` / `{{> footer}}`
- Demos showing the element at multiple sizes/variants
- Inline `<script type="module">` importing and registering the element

Update `playground/vite.config.ts` with 11 new `pageData` entries and `rollupOptions.input` entries.

Update `playground/package.json` with all 11 `@duskmoon-dev/el-art-*` as workspace dependencies.

---

## 9. Verification Checklist

- [ ] `bun install` — all workspace deps resolved including `css-arts/*`
- [ ] `bun run build:base && bun run build:css-arts` — all 11 art packages build with no errors
- [ ] `bun run build:css-arts-bundle` — `@duskmoon-dev/art-elements` bundle builds
- [ ] `bun run docs:dev` — docs site loads at `localhost:4331`
  - [ ] Header shows "Components" and "CSS Art" nav links
  - [ ] "Components" link shows sidebar with existing 9 sections
  - [ ] "CSS Art" link shows sidebar with only css-art pages
  - [ ] All 11 css-art MDX pages render with live demos
- [ ] `bun run playground` — playground loads at `localhost:4220`
  - [ ] Index shows "Elements" and "CSS Art" sections
  - [ ] Theme toggle works (sunshine/moonlight)
  - [ ] Each `art-*.html` page renders the art element
- [ ] Visual check: all 11 arts render correctly in both themes
- [ ] TypeScript: `bun run typecheck` passes with no errors

---

## 10. File Manifest

| Path | Status | Description |
|------|--------|-------------|
| `package.json` | modify | Add `css-arts/*` workspace, build scripts |
| `css-arts/moon/` | create | `@duskmoon-dev/el-art-moon` |
| `css-arts/sun/` | create | `@duskmoon-dev/el-art-sun` |
| `css-arts/atom/` | create | `@duskmoon-dev/el-art-atom` |
| `css-arts/eclipse/` | create | `@duskmoon-dev/el-art-eclipse` |
| `css-arts/mountain/` | create | `@duskmoon-dev/el-art-mountain` |
| `css-arts/plasma-ball/` | create | `@duskmoon-dev/el-art-plasma-ball` |
| `css-arts/cat-stargazer/` | create | `@duskmoon-dev/el-art-cat-stargazer` |
| `css-arts/color-spin/` | create | `@duskmoon-dev/el-art-color-spin` |
| `css-arts/synthwave-starfield/` | create | `@duskmoon-dev/el-art-synthwave-starfield` |
| `css-arts/circular-gallery/` | create | `@duskmoon-dev/el-art-circular-gallery` |
| `css-arts/snow/` | create | `@duskmoon-dev/el-art-snow` |
| `packages/css-arts/` | create | `@duskmoon-dev/art-elements` bundle |
| `packages/docs/src/content/config.ts` | modify | Add `css-art` section enum |
| `packages/docs/src/components/DocsSidebar.astro` | modify | Path-based filtering + css-art config |
| `packages/docs/src/layouts/DocsLayout.astro` | modify | Top nav links |
| `packages/docs/src/content/docs/css-art/*.mdx` | create | 11 MDX doc pages |
| `packages/docs/src/scripts/register-elements.ts` | modify | Register art elements |
| `playground/index.html` | modify | Two-section layout + theme toggle |
| `playground/vite.config.ts` | modify | 11 new page entries |
| `playground/art-*.html` | create | 11 playground pages |
| `playground/package.json` | modify | 11 new workspace deps |

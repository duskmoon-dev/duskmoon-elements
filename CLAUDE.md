# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Install dependencies
bun install

# Build all packages (core must build before elements due to TypeScript project references)
bun run build:all

# Build only core package
bun run build:base

# Build only element packages
bun run build:elements

# Run tests across all packages
bun run test

# Type checking
bun run typecheck

# Linting and formatting
bun run lint:check
bun run format:check
bun run lint:fix
bun run format

# Clean all dist directories
bun run clean

# Release (publish to npm)
bun run release:dry-run  # Test first
bun run release          # Actual publish
```

### Running a single package's commands

```bash
bun run --filter @duskmoon-dev/el-button test
bun run --filter @duskmoon-dev/el-base build
```

## Architecture

### Monorepo Structure

This is a Bun workspace monorepo with two package directories:
- `packages/` - Core utilities (`@duskmoon-dev/el-base`)
- `elements/` - Individual custom element packages (`@duskmoon-dev/el-*`)

### Package Naming Convention

- npm package: `@duskmoon-dev/el-<name>`
- Custom element tag: `<el-dm-<name>>`

### Build Output

Each package builds to:
- `dist/esm/` - ES Modules
- `dist/cjs/` - CommonJS
- `dist/types/` - TypeScript declarations

### Core Package (`@duskmoon-dev/el-base`)

Provides the foundation for all custom elements:

- **`BaseElement`** - Abstract base class extending `HTMLElement` with:
  - Shadow DOM setup with `adoptedStyleSheets`
  - Reactive properties system via static `properties` definition
  - Automatic attribute reflection and type conversion
  - Batched updates using microtask queue
  - Helper methods: `attachStyles()`, `render()`, `update()`, `emit()`, `query()`, `queryAll()`

- **`css`** - Template tag that creates `CSSStyleSheet` objects
- **`combineStyles`** - Merges multiple stylesheets
- **`cssVars`** - Generates CSS custom property declarations
- **Default theme** - CSS custom properties (`--dm-*`) for colors, spacing, typography

### Element Pattern

Each element package follows this structure:

```typescript
import { BaseElement, css } from '@duskmoon-dev/el-base';

const styles = css`...`;

export class ElDmExample extends BaseElement {
  static properties = {
    myProp: { type: String, reflect: true, default: 'value' }
  };

  constructor() {
    super();
    this.attachStyles(styles);
  }

  render() {
    return `<div>...</div>`;
  }
}

export function register() {
  if (!customElements.get('el-dm-example')) {
    customElements.define('el-dm-example', ElDmExample);
  }
}
```

### TypeScript Project References

Element packages reference the core package via TypeScript project references. The core package must be built first for type checking to work on elements.

### Workspace Dependencies

Elements use `"@duskmoon-dev/el-base": "workspace:*"` which gets resolved to actual versions during `bun publish`.

## Theme System

### How core themes work

`@duskmoon-dev/core` themes use `[data-theme="<name>"]` selectors on the `<html>` element. Each theme CSS file also contains a `:root { ... }` fallback block that acts as the default when no `data-theme` is set. Dark themes additionally provide `@media (prefers-color-scheme: dark) { :root:not([data-theme]) { ... } }` for automatic system-preference detection.

### CSS cascade ordering rule

**When importing multiple core themes, the last-imported theme's `:root` fallback wins the cascade** because `:root` and `[data-theme="<name>"]` have equal specificity (0,1,0). This means:

- Import the "default fallback" theme **first** (e.g., sunshine)
- Import themes that should override it **after** (e.g., moonlight)

```css
/* CORRECT — moonlight's [data-theme] rule comes after sunshine's :root fallback */
@import '@duskmoon-dev/core/themes/sunshine';
@import '@duskmoon-dev/core/themes/moonlight';

/* WRONG — sunshine's :root overwrites moonlight's [data-theme="moonlight"] */
@import '@duskmoon-dev/core/themes/moonlight';
@import '@duskmoon-dev/core/themes/sunshine';
```

### Docs site theme modes

The docs site (`packages/docs/`) supports three modes:

| Mode | `data-theme` attr | localStorage | Behavior |
|------|-------------------|--------------|----------|
| Auto | _(removed)_ | _(cleared)_ | CSS `@media (prefers-color-scheme)` in core themes handles it |
| Moonlight | `"moonlight"` | `"moonlight"` | Explicit dark theme |
| Sunshine | `"sunshine"` | `"sunshine"` | Explicit light theme |

### Theme-controller CSS import workaround

Vite cannot resolve `@duskmoon-dev/core/components/theme-controller` via CSS `@import` because the package exports map has mixed conditions (`style` + `import` + `default`). The workaround is to read the CSS file at build time in Astro frontmatter using `readFileSync` and inject it via `<Fragment set:html>`.

## @duskmoon-dev/core (upstream dependency)

`@duskmoon-dev/core` lives in `duskmoon-dev/duskmoonui` — it is our own package. If core has bugs or missing features, file a GitHub issue on `duskmoon-dev/duskmoonui` with the label `internal request`. Never use `bun patch` or other local workarounds.

## Active Technologies
- TypeScript (ES2022+ target) + Vite (build tool), existing element packages (@duskmoon-dev/el-*) (001-vite-playground)
- N/A (static site, no persistent storage) (001-vite-playground)
- TypeScript (ES2022+ target), Astro 5.x + Astro, @duskmoon-dev/core, @duskmoon-dev/el-* packages (001-astro-docs)
- N/A (static site generation) (001-astro-docs)

## Recent Changes
- 001-vite-playground: Added TypeScript (ES2022+ target) + Vite (build tool), existing element packages (@duskmoon-dev/el-*)

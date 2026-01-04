# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Install dependencies
bun install

# Build all packages (core must build before elements due to TypeScript project references)
bun run build:all

# Build only core package
bun run build:core

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
bun run --filter @duskmoon-dev/el-core build
```

## Architecture

### Monorepo Structure

This is a Bun workspace monorepo with two package directories:
- `packages/` - Core utilities (`@duskmoon-dev/el-core`)
- `elements/` - Individual custom element packages (`@duskmoon-dev/el-*`)

### Package Naming Convention

- npm package: `@duskmoon-dev/el-<name>`
- Custom element tag: `<el-dm-<name>>`

### Build Output

Each package builds to:
- `dist/esm/` - ES Modules
- `dist/cjs/` - CommonJS
- `dist/types/` - TypeScript declarations

### Core Package (`@duskmoon-dev/el-core`)

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
import { BaseElement, css } from '@duskmoon-dev/el-core';

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

Elements use `"@duskmoon-dev/el-core": "workspace:*"` which gets resolved to actual versions during `bun publish`.

## Active Technologies
- TypeScript (ES2022+ target) + Vite (build tool), existing element packages (@duskmoon-dev/el-*) (001-vite-playground)
- N/A (static site, no persistent storage) (001-vite-playground)

## Recent Changes
- 001-vite-playground: Added TypeScript (ES2022+ target) + Vite (build tool), existing element packages (@duskmoon-dev/el-*)

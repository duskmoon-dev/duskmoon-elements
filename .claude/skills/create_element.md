# Create Element Skill

Create a new custom element package in the DuskMoon Elements monorepo.

## Naming Conventions

- **Package name:** `@duskmoon-dev/el-{name}` (e.g., `@duskmoon-dev/el-button`)
- **Custom element tag:** `<el-dm-{name}>` (e.g., `<el-dm-button>`)
- **Class name:** `ElDm{Name}` in PascalCase (e.g., `ElDmButton`)
- **Directory:** `elements/{name}/`

## File Structure

Each element package requires these files:

```
elements/{name}/
├── package.json
├── tsconfig.json
└── src/
    ├── duskmoon-core.d.ts
    ├── el-dm-{name}.ts
    ├── index.ts
    └── register.ts
```

## Step-by-Step Process

### 1. Create package.json

```json
{
  "name": "@duskmoon-dev/el-{name}",
  "version": "0.3.0",
  "type": "module",
  "main": "./dist/cjs/index.js",
  "module": "./dist/esm/index.js",
  "types": "./dist/types/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js"
    },
    "./register": {
      "types": "./dist/types/register.d.ts",
      "import": "./dist/esm/register.js",
      "require": "./dist/cjs/register.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "prebuild": "bun run clean",
    "build": "bun run build:esm && bun run build:cjs && bun run build:types",
    "build:esm": "bun build ./src/index.ts ./src/register.ts --outdir ./dist/esm --format esm --sourcemap --external @duskmoon-dev/el-core --external @duskmoon-dev/core",
    "build:cjs": "bun build ./src/index.ts ./src/register.ts --outdir ./dist/cjs --format cjs --sourcemap --external @duskmoon-dev/el-core --external @duskmoon-dev/core",
    "build:types": "tsc --emitDeclarationOnly --outDir ./dist/types",
    "dev": "bun build ./src/index.ts --outdir ./dist/esm --format esm --sourcemap --external @duskmoon-dev/el-core --watch",
    "clean": "del-cli dist",
    "test": "bun test",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write 'src/**/*.ts' '*.json'",
    "format:check": "prettier --check 'src/**/*.ts' '*.json'",
    "lint": "eslint src",
    "lint:check": "eslint src --max-warnings 0",
    "lint:fix": "eslint src --fix",
    "release": "bun publish",
    "release:dry-run": "bun publish --dry-run"
  },
  "dependencies": {
    "@duskmoon-dev/el-core": "workspace:*",
    "@duskmoon-dev/core": "^1.1.1"
  },
  "devDependencies": {
    "typescript": "^5.7.2"
  },
  "publishConfig": {
    "access": "public"
  },
  "keywords": ["duskmoon-dev", "custom-elements", "web-components", "{name}"]
}
```

**Important:** Do NOT include `'*.md'` in format scripts if there's no README.md file.

### 2. Create tsconfig.json

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist/types",
    "composite": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"],
  "references": [{ "path": "../../packages/core" }]
}
```

### 3. Create src/duskmoon-core.d.ts

```typescript
declare module '@duskmoon-dev/core/components/{name}' {
  export const css: string;
  export const styles: CSSStyleSheet;
}
```

### 4. Create src/el-dm-{name}.ts (Main Component)

```typescript
/**
 * DuskMoon {Name} Element
 *
 * Brief description of what this component does.
 * Uses styles from @duskmoon-dev/core for consistent theming.
 *
 * @element el-dm-{name}
 *
 * @attr {type} attrName - Description
 *
 * @slot - Default slot description
 * @slot slotName - Named slot description
 *
 * @csspart partName - CSS part description
 *
 * @fires eventName - Event description
 */

import { BaseElement, css } from '@duskmoon-dev/el-core';
import { css as {name}CSS } from '@duskmoon-dev/core/components/{name}';

// Map attribute values to CSS classes
const VARIANT_CLASSES: Record<string, string> = {
  default: '',
  primary: '{name}-primary',
};

export type {Name}Variant = 'default' | 'primary';

// Strip @layer wrapper for Shadow DOM compatibility
const coreStyles = {name}CSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');

const styles = css`
  :host {
    display: inline-flex;
  }

  :host([hidden]) {
    display: none !important;
  }

  ${coreStyles}

  /* Web component specific adjustments */
  .{name} {
    font-family: inherit;
  }
`;

export class ElDm{Name} extends BaseElement {
  static properties = {
    variant: { type: String, reflect: true, default: 'default' },
    disabled: { type: Boolean, reflect: true },
  };

  declare variant: {Name}Variant;
  declare disabled: boolean;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  private _getClasses(): string {
    const classes = ['{name}'];
    if (this.variant && VARIANT_CLASSES[this.variant]) {
      classes.push(VARIANT_CLASSES[this.variant]);
    }
    return classes.join(' ');
  }

  render(): string {
    const classes = this._getClasses();
    return `
      <div class="${classes}" part="{name}">
        <slot></slot>
      </div>
    `;
  }

  update(): void {
    super.update();
    // Add event listeners here if needed
  }
}
```

### 5. Create src/index.ts

```typescript
/**
 * @duskmoon-dev/el-{name}
 *
 * DuskMoon {Name} custom element
 */

import { ElDm{Name} } from './el-dm-{name}.js';

export { ElDm{Name} };
export type { {Name}Variant } from './el-dm-{name}.js';

/**
 * Register the el-dm-{name} custom element
 */
export function register(): void {
  if (!customElements.get('el-dm-{name}')) {
    customElements.define('el-dm-{name}', ElDm{Name});
  }
}
```

### 6. Create src/register.ts

```typescript
import { register } from './index.js';
register();
```

## Update Bundle Package

After creating the element, update `packages/elements/`:

### 1. Update packages/elements/src/index.ts

Add imports and exports:

```typescript
import { ElDm{Name}, register as register{Name} } from '@duskmoon-dev/el-{name}';

export { ElDm{Name}, register{Name} };
export type { {Name}Variant } from '@duskmoon-dev/el-{name}';
```

Add to `registerAll()`:

```typescript
export function registerAll(): void {
  // ... existing registers
  register{Name}();
}
```

### 2. Update packages/elements/package.json

Add dependency:

```json
"dependencies": {
  "@duskmoon-dev/el-{name}": "workspace:*"
}
```

Update build scripts to include `--external @duskmoon-dev/el-{name}`.

### 3. Update root package.json

Add to `build:elements` and `release:elements` scripts:

```
--filter '@duskmoon-dev/el-{name}'
```

## Create Documentation

Create `packages/docs/src/content/docs/components/{name}.mdx`:

```mdx
---
title: {Name}
description: Brief description
order: {next_number}
section: components
component: "@duskmoon-dev/el-{name}"
---

import ComponentDemo from '../../../components/ComponentDemo.astro';

# {Name}

Description of the component.

## Installation

\`\`\`bash
npm install @duskmoon-dev/el-{name}
\`\`\`

## Usage

\`\`\`javascript
import '@duskmoon-dev/el-{name}/register';
\`\`\`

\`\`\`html
<el-dm-{name}>Content</el-dm-{name}>
\`\`\`

## Live Demo

<ComponentDemo title="{Name} Demo">
  <el-dm-{name}>Example</el-dm-{name}>
</ComponentDemo>

<script>
  import('@duskmoon-dev/el-{name}/register');
</script>

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `variant` | `string` | `'default'` | Visual variant |

## Events

| Event | Description |
|-------|-------------|
| `change` | Fired when value changes |

## CSS Parts

| Part | Description |
|------|-------------|
| `{name}` | The main container |

## Accessibility

- Accessibility considerations for this component
```

## Verification Steps

1. Run `bun install` to link workspace packages
2. Run `bun run build:all` to verify compilation
3. Run `bun run typecheck` to verify types
4. Run `bun run format:check` to verify formatting
5. Run `bun run docs:build` to verify documentation

## CSS Variable Reference

Use these CSS variables from `@duskmoon-dev/core` themes:

- `--color-primary`, `--color-on-primary`
- `--color-secondary`, `--color-on-secondary`
- `--color-surface`, `--color-on-surface`
- `--color-surface-container`, `--color-surface-container-high`
- `--color-outline`
- `--color-success`, `--color-warning`, `--color-error`, `--color-info`

**Note:** Use `--color-surface-container` NOT `--color-surface-variant` (doesn't exist).

## Common Patterns

### Event Emission

```typescript
this.emit('eventName', { detail: 'data' });
```

### Shadow DOM Queries

```typescript
const element = this.shadowRoot?.querySelector('.class');
```

### Handling Click Events in update()

```typescript
update(): void {
  super.update();
  const btn = this.shadowRoot?.querySelector('.btn');
  btn?.addEventListener('click', this._handleClick.bind(this));
}
```

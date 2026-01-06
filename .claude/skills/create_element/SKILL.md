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

**Important:** Do NOT include `'*.md'` in format scripts unless there's a README.md file in the package.

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
 * @attr {string} variant - Visual variant: primary, secondary, etc.
 * @attr {string} size - Size: sm, md, lg
 * @attr {boolean} disabled - Whether the element is disabled
 *
 * @slot - Default slot for content
 *
 * @csspart {name} - The main container
 *
 * @fires change - Fired when value changes
 */

import { BaseElement, css } from '@duskmoon-dev/el-core';
import { css as {name}CSS } from '@duskmoon-dev/core/components/{name}';

// Map attribute values to CSS classes
const VARIANT_CLASSES: Record<string, string> = {
  filled: '',
  outlined: '{name}-outlined',
  soft: '{name}-soft',
};

const COLOR_CLASSES: Record<string, string> = {
  primary: '{name}-primary',
  secondary: '{name}-secondary',
  tertiary: '{name}-tertiary',
  success: '{name}-success',
  warning: '{name}-warning',
  error: '{name}-error',
  info: '{name}-info',
};

const SIZE_CLASSES: Record<string, string> = {
  sm: '{name}-sm',
  md: '',
  lg: '{name}-lg',
};

// Use multi-line union types for colors with many options
export type {Name}Variant = 'filled' | 'outlined' | 'soft';
export type {Name}Color =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';
export type {Name}Size = 'sm' | 'md' | 'lg';

// Strip @layer wrapper for Shadow DOM compatibility
const coreStyles = {name}CSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');

const styles = css`
  :host {
    display: inline-flex;
    vertical-align: middle;
  }

  :host([hidden]) {
    display: none !important;
  }

  ${coreStyles}

  /* Web component specific adjustments */
  .{name} {
    font-family: inherit;
  }

  :host([disabled]) .{name} {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
`;

export class ElDm{Name} extends BaseElement {
  static properties = {
    variant: { type: String, reflect: true, default: 'filled' },
    color: { type: String, reflect: true, default: 'primary' },
    size: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
  };

  declare variant: {Name}Variant;
  declare color: {Name}Color;
  declare size: {Name}Size;
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

    if (this.color && COLOR_CLASSES[this.color]) {
      classes.push(COLOR_CLASSES[this.color]);
    }

    if (this.size && SIZE_CLASSES[this.size]) {
      classes.push(SIZE_CLASSES[this.size]);
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
    // const element = this.shadowRoot?.querySelector('.{name}');
    // element?.addEventListener('click', this._handleClick.bind(this));
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
export type { {Name}Variant, {Name}Color, {Name}Size } from './el-dm-{name}.js';

/**
 * Register the el-dm-{name} custom element
 *
 * @example
 * ```ts
 * import { register } from '@duskmoon-dev/el-{name}';
 * register();
 * ```
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

Add imports:

```typescript
import { ElDm{Name}, register as register{Name} } from '@duskmoon-dev/el-{name}';
```

Add exports:

```typescript
export { ElDm{Name}, register{Name} };
export type { {Name}Variant, {Name}Color, {Name}Size } from '@duskmoon-dev/el-{name}';
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

Add to both `build:esm` and `build:cjs` scripts:

```
--external @duskmoon-dev/el-{name}
```

### 3. Update root package.json

Add `--filter '@duskmoon-dev/el-{name}'` to these scripts:
- `build:elements`
- `release:elements`
- `release:elements:dry-run`

## Create Documentation

Create `packages/docs/src/content/docs/components/{name}.mdx`:

```mdx
---
title: {Name}
description: Brief description of the component
order: {next_number}
section: components
component: "@duskmoon-dev/el-{name}"
---

import ComponentDemo from '../../../components/ComponentDemo.astro';

# {Name}

Description of the component and its purpose.

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

<ComponentDemo title="{Name} Variants">
  <el-dm-{name} color="primary">Primary</el-dm-{name}>
  <el-dm-{name} color="secondary">Secondary</el-dm-{name}>
  <el-dm-{name} color="success">Success</el-dm-{name}>
</ComponentDemo>

<script>
  import('@duskmoon-dev/el-{name}/register');
</script>

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `variant` | `'filled' \| 'outlined' \| 'soft'` | `'filled'` | Visual style |
| `color` | `'primary' \| 'secondary' \| ...` | `'primary'` | Color theme |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `disabled` | `boolean` | `false` | Disabled state |

## Colors

<ComponentDemo title="{Name} Colors">
  <el-dm-{name} color="primary">Primary</el-dm-{name}>
  <el-dm-{name} color="secondary">Secondary</el-dm-{name}>
  <el-dm-{name} color="success">Success</el-dm-{name}>
  <el-dm-{name} color="warning">Warning</el-dm-{name}>
  <el-dm-{name} color="error">Error</el-dm-{name}>
</ComponentDemo>

\`\`\`html
<el-dm-{name} color="primary">Primary</el-dm-{name}>
<el-dm-{name} color="success">Success</el-dm-{name}>
\`\`\`

## Sizes

<ComponentDemo title="{Name} Sizes">
  <el-dm-{name} size="sm">Small</el-dm-{name}>
  <el-dm-{name} size="md">Medium</el-dm-{name}>
  <el-dm-{name} size="lg">Large</el-dm-{name}>
</ComponentDemo>

\`\`\`html
<el-dm-{name} size="sm">Small</el-dm-{name}>
<el-dm-{name} size="md">Medium</el-dm-{name}>
<el-dm-{name} size="lg">Large</el-dm-{name}>
\`\`\`

## Events

| Event | Description |
|-------|-------------|
| `change` | Fired when value changes |

### Event Handling

\`\`\`javascript
const element = document.querySelector('el-dm-{name}');
element.addEventListener('change', (event) => {
  console.log('Changed:', event.detail);
});
\`\`\`

## CSS Parts

| Part | Description |
|------|-------------|
| `{name}` | The main container |

## Accessibility

- Keyboard accessible with focus states
- Proper ARIA attributes where applicable
- Disabled state is properly announced
```

**MDX Note:** Avoid complex JavaScript in `<script>` tags. For interactive demos like dialogs, use inline `onclick` handlers:

```html
<el-dm-button onclick="this.nextElementSibling.show()">Open</el-dm-button>
<el-dm-dialog>...</el-dm-dialog>
```

## Verification Steps

1. Run `bun install` to link workspace packages
2. Run `bun run build:all` to verify compilation
3. Run `bun run typecheck` to verify types
4. Run `bun run format` to auto-format code
5. Run `bun run format:check` to verify formatting
6. Run `bun run lint:check` to verify linting
7. Run `bun run docs:build` to verify documentation

## CSS Variable Reference

Use these CSS variables from `@duskmoon-dev/core` themes:

### Colors
- `--color-primary`, `--color-on-primary`
- `--color-secondary`, `--color-on-secondary`
- `--color-tertiary`, `--color-on-tertiary`
- `--color-success`, `--color-on-success`
- `--color-warning`, `--color-on-warning`
- `--color-error`, `--color-on-error`
- `--color-info`, `--color-on-info`

### Surfaces
- `--color-surface`, `--color-on-surface`
- `--color-surface-dim`, `--color-surface-bright`
- `--color-surface-container-lowest`
- `--color-surface-container-low`
- `--color-surface-container`
- `--color-surface-container-high`
- `--color-surface-container-highest`
- `--color-on-surface-variant`

### Other
- `--color-outline`
- `--color-inverse-surface`, `--color-inverse-on-surface`

**Important:** Use `--color-surface-container` NOT `--color-surface-variant` (doesn't exist in theme).

## Common Patterns

### Event Emission

```typescript
this.emit('eventName', { detail: 'data' });
```

### Shadow DOM Queries

```typescript
const element = this.shadowRoot?.querySelector('.class');
```

### Handling Events in update()

```typescript
update(): void {
  super.update();
  const btn = this.shadowRoot?.querySelector('.btn');
  if (btn) {
    btn.addEventListener('click', this._handleClick.bind(this));
  }
}
```

### Lifecycle Hooks

```typescript
connectedCallback(): void {
  super.connectedCallback();
  // Element added to DOM
  this.addEventListener('keydown', this._handleKeyDown.bind(this));
}

disconnectedCallback(): void {
  super.disconnectedCallback?.();
  // Element removed from DOM - cleanup
}
```

### Multi-line CSS Transitions (Prettier format)

```typescript
const styles = css`
  .element {
    transition:
      opacity 150ms ease,
      visibility 150ms ease;
  }
`;
```

### Conditional Class Assignment

```typescript
const labelClass =
  this.labelPosition === 'left' ? 'label label-left' : 'label';
```

## Checklist

Before committing:

- [ ] All 6 source files created in `elements/{name}/src/`
- [ ] `package.json` has correct name and no `*.md` in format scripts
- [ ] `tsconfig.json` references `../../packages/core`
- [ ] Types exported from `index.ts`
- [ ] Bundle package updated (`packages/elements/`)
- [ ] Root `package.json` scripts updated (3 scripts)
- [ ] Documentation MDX created
- [ ] `bun run build:all` passes
- [ ] `bun run typecheck` passes
- [ ] `bun run format:check` passes
- [ ] `bun run docs:build` passes

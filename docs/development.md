# Development Guide

This guide covers everything you need to know to work with and contribute to the DuskMoon Elements monorepo.

## Prerequisites

- [Bun](https://bun.sh/) v1.2+
- Node.js 20+ (for TypeScript tooling)
- Git

## Quick Start

```bash
# Clone and install
git clone https://github.com/duskmoon-dev/duskmoon-elements.git
cd duskmoon-elements
bun install

# Build everything (core must build first)
bun run build:all

# Run all tests
bun run test

# Start the playground
bun run playground        # http://localhost:4220
```

## Repository Layout

```
duskmoon-elements/
├── packages/
│   ├── core/             # @duskmoon-dev/el-core — base class, styles, utilities
│   ├── elements/         # @duskmoon-dev/elements — bundle re-exporting all elements
│   └── docs/             # @duskmoon-dev/docs — Astro documentation site
├── elements/             # 31 individual element packages (@duskmoon-dev/el-*)
│   ├── button/
│   ├── card/
│   ├── input/
│   └── ...
├── playground/           # Vite playground for manual testing
├── CLAUDE.md             # Project instructions for Claude Code
├── AGENTS.md             # Conventions for agentic tools
└── PRD.md                # Product requirements document
```

### Build Order

The core package must build before elements because element packages use TypeScript project references to core:

```
@duskmoon-dev/el-core  →  @duskmoon-dev/el-*  →  @duskmoon-dev/elements
```

`bun run build:all` handles this automatically.

## Commands Reference

### Build

| Command | Description |
|---------|-------------|
| `bun run build:all` | Build core, then elements, then bundle (sequential) |
| `bun run build:core` | Build only `@duskmoon-dev/el-core` |
| `bun run build:elements` | Build all 30 element packages |
| `bun run build:bundle` | Build the `@duskmoon-dev/elements` bundle package |

### Development

| Command | Description |
|---------|-------------|
| `bun run playground` | Start Vite playground at http://localhost:4220 |
| `bun run docs:dev` | Start Astro docs site at http://localhost:4331 |
| `bun run dev` | Start dev mode for all workspaces |

### Quality

| Command | Description |
|---------|-------------|
| `bun run test` | Run all tests with coverage |
| `bun run typecheck` | TypeScript type checking across all packages |
| `bun run lint:check` | ESLint check (zero warnings) |
| `bun run lint:fix` | Auto-fix ESLint issues |
| `bun run format:check` | Prettier check |
| `bun run format` | Auto-format with Prettier |

### Per-Package Commands

Target a specific package with `--filter`:

```bash
bun run --filter @duskmoon-dev/el-button test
bun run --filter @duskmoon-dev/el-core build
bun run --filter @duskmoon-dev/el-input lint:check
```

### Release

| Command | Description |
|---------|-------------|
| `bun run release:dry-run` | Simulate publishing all packages |
| `bun run release` | Publish core, then elements, then bundle to npm |

## Architecture

### Core Package (`@duskmoon-dev/el-core`)

The foundation for all custom elements. Zero runtime dependencies.

#### BaseElement

Abstract base class extending `HTMLElement`:

```typescript
import { BaseElement, css } from '@duskmoon-dev/el-core';

const styles = css`
  :host { display: block; }
  .greeting { color: var(--color-primary); }
`;

export class ElDmGreeting extends BaseElement {
  static properties = {
    name: { type: String, reflect: true, default: 'World' },
  };

  declare name: string;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  render(): string {
    return `<div class="greeting">Hello, ${this.name}!</div>`;
  }
}
```

Key features:
- **Shadow DOM** with `adoptedStyleSheets` for style encapsulation
- **Reactive properties** — declare in `static properties`, changes auto-trigger `render()`
- **Batched updates** via microtask queue (multiple property changes = single re-render)
- **Attribute reflection** — `reflect: true` syncs property ↔ attribute
- **Type conversion** — `type: Boolean | Number | String | Object | Array`

#### BaseElement API

| Method | Description |
|--------|-------------|
| `attachStyles(sheet)` | Add CSSStyleSheet(s) to shadow DOM |
| `render()` | Override to return HTML string for shadow DOM content |
| `update()` | Called when properties change. Default calls `render()` |
| `emit(name, detail?)` | Dispatch a composed, bubbling CustomEvent |
| `query(selector)` | `shadowRoot.querySelector()` shorthand |
| `queryAll(selector)` | `shadowRoot.querySelectorAll()` shorthand |
| `connectedCallback()` | Element added to DOM. Always call `super.connectedCallback()` |
| `disconnectedCallback()` | Element removed from DOM |

#### Style Utilities

```typescript
import { css, combineStyles, cssVars, defaultTheme, resetStyles } from '@duskmoon-dev/el-core';

// Create a CSSStyleSheet from a template literal
const myStyles = css`
  :host { display: block; }
`;

// Combine multiple sheets
const combined = combineStyles(resetStyles, defaultTheme, myStyles);

// Generate CSS custom property declarations
const vars = cssVars({ '--my-color': 'red', '--my-size': '16px' });
```

#### Animation Utilities

```typescript
import { animation, transition, durations, easings, animationStyles } from '@duskmoon-dev/el-core';

// Generate animation shorthand
animation('fadeIn');                          // "fadeIn 200ms ease both"
animation('slideUp', 'slow', 'easeOut');     // "slideUp 300ms cubic-bezier(...) both"

// Generate transition shorthand
transition('opacity');                        // "opacity 200ms ease"
transition(['opacity', 'transform'], 'fast'); // "opacity 150ms ease, transform 150ms ease"

// Available keyframes (in animationStyles CSSStyleSheet):
// fadeIn, fadeOut, slideUp, slideDown, slideLeft, slideRight,
// scaleIn, scaleOut, spin, pulse
```

#### Theme Presets

Five built-in themes using oklch color system:

```typescript
import { themes, applyTheme, sunshineTheme } from '@duskmoon-dev/el-core';
import type { ThemeName } from '@duskmoon-dev/el-core';

// Available themes: sunshine, moonlight, ocean, forest, rose
applyTheme(element, 'moonlight');

// Or apply a custom CSS string
applyTheme(element, '--color-primary: red; --color-surface: white;');
```

#### Validation Utilities

Composable validator functions for form elements:

```typescript
import { validate, validateAsync, validators } from '@duskmoon-dev/el-core';

// Synchronous validation
const result = validate('hello@example.com', [
  validators.required('Email is required'),
  validators.email('Must be a valid email'),
]);
// → { state: 'valid', message: undefined }

// Apply to an element
inputEl.validationState = result.state;
inputEl.errorMessage = result.message ?? '';

// Available validators:
validators.required(message?)         // Non-empty string
validators.minLength(min, message?)   // Minimum length
validators.maxLength(max, message?)   // Maximum length
validators.pattern(regex, message?)   // Regex match
validators.email(message?)            // Email format
validators.range(min, max, message?)  // Numeric range
validators.custom(predicate, message) // Custom predicate function

// Async validation (runs sync rules first, then async)
const result = await validateAsync(
  username,
  [validators.required()],
  async (value) => {
    const taken = await checkUsername(value);
    return taken ? 'Username is taken' : undefined;
  },
);
```

#### Composition Mixins

Reusable behaviors that compose via the class expression pattern:

```typescript
import { BaseElement, FocusableMixin, FormMixin, EventListenerMixin } from '@duskmoon-dev/el-core';

// Stack mixins — order doesn't matter
class MyInput extends FormMixin(FocusableMixin(BaseElement)) {
  // Inherits from FocusableMixin:
  //   - focused: boolean (reactive, reflected)
  //   - Auto-sets tabindex="0"
  //   - Tracks focus/blur events

  // Inherits from FormMixin:
  //   - name, value, disabled, required (reactive, reflected)
  //   - form getter (finds nearest <form>)
}
```

| Mixin | What it adds |
|-------|-------------|
| `FocusableMixin` | `focused` property, tabindex management, focus/blur tracking |
| `FormMixin` | `name`, `value`, `disabled`, `required` properties, `form` getter |
| `EventListenerMixin` | `addListener()` with auto-cleanup on disconnect |
| `SlotObserverMixin` | `observeSlot()` for tracking slot content changes |

#### Performance Utilities

```typescript
import { debounce, throttle, scheduleIdle } from '@duskmoon-dev/el-core';

// Debounce — delays until no calls for `delay` ms
const search = debounce((query: string) => { /* ... */ }, 300);
search('hello');   // Waits 300ms
search.cancel();   // Abort pending

// Throttle — at most once per `interval` ms (leading edge)
const onScroll = throttle(() => { /* ... */ }, 100);
onScroll.cancel();

// Schedule low-priority work (requestIdleCallback with fallback)
const cancel = scheduleIdle(() => { /* cleanup */ }, { timeout: 1000 });
cancel(); // Abort
```

### Element Package Structure

Every element follows an identical structure:

```
elements/{name}/
├── package.json          # @duskmoon-dev/el-{name}
├── tsconfig.json         # Extends root, references core
├── README.md             # Component documentation
└── src/
    ├── el-dm-{name}.ts       # Main component class
    ├── el-dm-{name}.test.ts  # Tests
    ├── index.ts              # Public exports + register()
    └── register.ts           # Side-effect auto-registration
```

#### Naming Conventions

| Convention | Example |
|-----------|---------|
| npm package | `@duskmoon-dev/el-button` |
| Custom element tag | `<el-dm-button>` |
| Class name | `ElDmButton` |
| Directory | `elements/button/` |
| Main file | `el-dm-button.ts` |
| Test file | `el-dm-button.test.ts` |

#### Two Import Styles

```typescript
// 1. Explicit registration (tree-shakable)
import { ElDmButton, register } from '@duskmoon-dev/el-button';
register();

// 2. Side-effect auto-registration
import '@duskmoon-dev/el-button/register';
```

#### Build Outputs

Each package produces three output formats:

| Directory | Format | Use Case |
|-----------|--------|----------|
| `dist/esm/` | ES Modules | Modern bundlers (Vite, webpack 5, Rollup) |
| `dist/cjs/` | CommonJS | Node.js, legacy bundlers |
| `dist/types/` | `.d.ts` declarations | TypeScript consumers |

### Bundle Package (`@duskmoon-dev/elements`)

Re-exports everything for convenience:

```typescript
// Import all elements at once
import { ElDmButton, ElDmCard, registerAll } from '@duskmoon-dev/elements';
registerAll();

// Or auto-register everything
import '@duskmoon-dev/elements/register';
```

## Creating a New Element

Use the `/create_element` Claude Code skill, or follow the manual steps below.

### 1. Scaffold the Package

Create `elements/{name}/` with the standard file structure (see above).

### 2. Implement the Component

```typescript
// elements/example/src/el-dm-example.ts
import { BaseElement, css } from '@duskmoon-dev/el-core';
import { css as exampleCSS } from '@duskmoon-dev/core/components/example';

// Strip @layer wrapper for Shadow DOM compatibility
const coreStyles = exampleCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');

const styles = css`
  :host { display: inline-flex; }
  :host([hidden]) { display: none !important; }
  ${coreStyles}
`;

export class ElDmExample extends BaseElement {
  static properties = {
    variant: { type: String, reflect: true, default: 'filled' },
    disabled: { type: Boolean, reflect: true },
  };

  declare variant: 'filled' | 'outlined';
  declare disabled: boolean;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  render(): string {
    return `
      <div class="example" part="example" role="group">
        <slot></slot>
      </div>
    `;
  }
}
```

### 3. Register Across the Monorepo

After creating the element package, update:

1. **`packages/elements/`** — Add import, export, dependency, `--external` flag, and tsconfig reference
2. **Root `package.json`** — Add `--filter` to `build:elements`, `release:elements`, `release:elements:dry-run`
3. **`packages/docs/`** — Add dependency and register call
4. **`playground/`** — Add test page and navigation link

### 4. Verify

```bash
bun install
bun run build:all
bun run typecheck
bun run test
bun run lint:check
bun run format:check
```

## Testing

### Setup

Tests use `bun:test` with `happy-dom` for DOM APIs. The test environment is configured in:
- `bunfig.toml` — Enables coverage, preloads `test-setup.ts`
- `test-setup.ts` — Registers `HTMLElement`, `CustomEvent`, `CSSStyleSheet`, `customElements`, etc. from happy-dom

### Writing Tests

```typescript
import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmButton, register } from './index';

register();

describe('ElDmButton', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('creates element with shadow DOM', () => {
    const el = document.createElement('el-dm-button') as ElDmButton;
    container.appendChild(el);
    expect(el.shadowRoot).toBeTruthy();
  });

  test('reflects variant to attribute', () => {
    const el = document.createElement('el-dm-button') as ElDmButton;
    container.appendChild(el);
    el.variant = 'primary';
    expect(el.getAttribute('variant')).toBe('primary');
  });
});
```

### Important Testing Notes

- **Always append to DOM** before asserting rendered content — `connectedCallback()` triggers the first `render()`
- **Clean up in `afterEach`** — Remove elements from the document
- **Properties without `reflect: true`** won't appear as attributes — test via property access, not `getAttribute()`
- **Batched updates** use microtasks — if you need to assert after a property change triggers a re-render, use `await new Promise(r => queueMicrotask(r))`

### Running Tests

```bash
# All tests
bun run test

# Single package
bun run --filter @duskmoon-dev/el-button test

# Specific test file
bun test elements/button/src/el-dm-button.test.ts

# Filter by test name
bun run --filter @duskmoon-dev/el-button test -- -t "renders slot"
```

## Code Style

### TypeScript

- Strict mode enabled, ES2022 target
- Use `declare` for reactive properties on BaseElement subclasses
- Explicit types for public APIs
- Avoid `any` — use `unknown` with narrowing
- Include `.js` extension for local imports (`./el-dm-button.js`)

### Formatting (Prettier)

- Semicolons, single quotes, 2-space indentation
- Trailing commas, 100 character print width
- Run `bun run format` before committing

### Naming

- Private methods: `_methodName`
- Constants: `UPPER_SNAKE_CASE`
- Events: use `emit('dm-eventname', detail)` for custom events
- CSS parts: semantic names (`button`, `input`, `label`)

### CSS

- Use CSS custom properties from the core theme (`--color-primary`, `--color-surface`, etc.)
- Define component styles with the `css` template tag
- Strip `@layer` wrappers from `@duskmoon-dev/core` styles for Shadow DOM

## CI/CD

### Pull Requests

The CI workflow (`.github/workflows/ci.yml`) runs on every push and PR to `main`:
1. Lint check
2. Format check
3. TypeScript type checking
4. Full build
5. Publish dry-run

### Documentation Deployment

The docs workflow (`.github/workflows/docs.yml`) deploys to GitHub Pages on push to `main` when `packages/docs/` changes:
1. Builds all packages
2. Builds documentation (`bun run --filter @duskmoon-dev/docs build`)
3. Deploys to GitHub Pages

### Releases

Releases are triggered manually via `.github/workflows/release.yml`:
1. Updates all `package.json` versions
2. Builds all packages
3. Publishes in order: core, elements, bundle
4. Creates git tag and GitHub release

## Troubleshooting

### "Cannot find module '@duskmoon-dev/el-core'"

Build core first: `bun run build:core`

### Tests fail with "HTMLElement is not defined"

The `test-setup.ts` preload isn't running. Make sure you're running tests from the workspace root with `bun test` or `bun run test`, not from inside a package directory.

### Type errors in element packages

Element packages use TypeScript project references to core. Rebuild core first: `bun run build:core && bun run typecheck`

### "@layer" styles not working in Shadow DOM

`@duskmoon-dev/core` wraps component CSS in `@layer components { ... }`. Strip the wrapper before using in Shadow DOM:

```typescript
const coreStyles = componentCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');
```

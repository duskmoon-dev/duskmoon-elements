# @duskmoon-dev/el-core

Core utilities and base classes for DuskMoon custom elements.

## Installation

```bash
bun add @duskmoon-dev/el-core
```

## Usage

### BaseElement

The `BaseElement` class provides a foundation for creating custom elements with:

- Shadow DOM setup with `adoptedStyleSheets`
- Reactive properties with attribute reflection
- Batched updates using microtask queue
- Style injection utilities
- Event emission helpers

```typescript
import { BaseElement, css } from '@duskmoon-dev/el-core';

const styles = css`
  :host {
    display: block;
  }
  .greeting {
    color: var(--dm-primary);
  }
`;

class MyGreeting extends BaseElement {
  static properties = {
    name: { type: String, reflect: true, default: 'World' },
  };

  declare name: string;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  render() {
    return `<div class="greeting">Hello, ${this.name}!</div>`;
  }
}

customElements.define('my-greeting', MyGreeting);
```

### CSS Utilities

#### `css` Template Tag

Creates a `CSSStyleSheet` from a template literal:

```typescript
import { css } from '@duskmoon-dev/el-core';

const styles = css`
  :host {
    display: inline-flex;
  }
  button {
    padding: 0.5rem 1rem;
  }
`;
```

#### `combineStyles`

Combines multiple stylesheets:

```typescript
import { combineStyles } from '@duskmoon-dev/el-core';

const combinedStyles = combineStyles(baseStyles, themeStyles, componentStyles);
```

#### `cssVars`

Creates CSS custom property declarations:

```typescript
import { cssVars } from '@duskmoon-dev/el-core';

const vars = cssVars({
  'dm-primary': '#3b82f6',
  'dm-spacing': '1rem',
});
// Returns: '--dm-primary: #3b82f6; --dm-spacing: 1rem;'
```

### Default Theme

The package includes default CSS custom properties for theming. Import the theme stylesheet:

```typescript
import { defaultTheme, resetStyles } from '@duskmoon-dev/el-core';

// Apply to shadow root
this.shadowRoot.adoptedStyleSheets = [resetStyles, defaultTheme, componentStyles];
```

#### Color Tokens

| Variable | Description |
|----------|-------------|
| `--dm-primary` | Primary brand color |
| `--dm-secondary` | Secondary color |
| `--dm-success` | Success/positive color |
| `--dm-warning` | Warning color |
| `--dm-error` | Error/danger color |
| `--dm-info` | Information color |

#### Gray Scale

| Variable | Description |
|----------|-------------|
| `--dm-gray-50` | Lightest gray |
| `--dm-gray-100` through `--dm-gray-800` | Gray scale |
| `--dm-gray-900` | Darkest gray |

#### Typography

| Variable | Description |
|----------|-------------|
| `--dm-font-family` | Base font family |
| `--dm-font-size-xs` through `--dm-font-size-2xl` | Font sizes |
| `--dm-font-weight-normal`, `--dm-font-weight-medium`, `--dm-font-weight-semibold`, `--dm-font-weight-bold` | Font weights |
| `--dm-line-height-tight`, `--dm-line-height-normal`, `--dm-line-height-relaxed` | Line heights |

#### Spacing

| Variable | Description |
|----------|-------------|
| `--dm-spacing-xs` | Extra small (0.25rem) |
| `--dm-spacing-sm` | Small (0.5rem) |
| `--dm-spacing-md` | Medium (1rem) |
| `--dm-spacing-lg` | Large (1.5rem) |
| `--dm-spacing-xl` | Extra large (2rem) |

#### Border Radius

| Variable | Description |
|----------|-------------|
| `--dm-radius-sm` | Small radius |
| `--dm-radius-md` | Medium radius |
| `--dm-radius-lg` | Large radius |
| `--dm-radius-full` | Full/pill radius |

#### Shadows

| Variable | Description |
|----------|-------------|
| `--dm-shadow-sm` | Small shadow |
| `--dm-shadow-md` | Medium shadow |
| `--dm-shadow-lg` | Large shadow |

#### Transitions

| Variable | Description |
|----------|-------------|
| `--dm-transition-fast` | Fast transition (150ms) |
| `--dm-transition-normal` | Normal transition (200ms) |
| `--dm-transition-slow` | Slow transition (300ms) |

## API

### BaseElement

| Method | Description |
|--------|-------------|
| `attachStyles(styles)` | Attach one or more stylesheets to Shadow DOM |
| `render()` | Override to return HTML content string |
| `update()` | Called when reactive properties change (batched) |
| `emit(name, detail?)` | Emit a CustomEvent from the element |
| `query(selector)` | Query single element in Shadow DOM |
| `queryAll(selector)` | Query all matching elements in Shadow DOM |

### Property Definitions

Define reactive properties with automatic attribute reflection:

```typescript
static properties = {
  // Simple string property
  label: { type: String },

  // Boolean with attribute reflection
  disabled: { type: Boolean, reflect: true },

  // Number with default value
  count: { type: Number, default: 0 },

  // Custom attribute name (kebab-case)
  maxItems: { type: Number, attribute: 'max-items' },

  // Object/Array (not reflected to attributes)
  data: { type: Object },
  items: { type: Array, default: [] },
};
```

Property definition options:

| Option | Type | Description |
|--------|------|-------------|
| `type` | `Function` | Type constructor: `String`, `Number`, `Boolean`, `Object`, `Array` |
| `reflect` | `boolean` | Whether to reflect property to attribute |
| `attribute` | `string` | Custom attribute name (defaults to lowercase property name) |
| `default` | `any` | Default value for the property |

### Lifecycle

```typescript
class MyElement extends BaseElement {
  // Called when element is added to DOM
  connectedCallback() {
    super.connectedCallback();
    // Setup code
  }

  // Called when element is removed from DOM
  disconnectedCallback() {
    super.disconnectedCallback();
    // Cleanup code
  }

  // Called when properties change (batched)
  update() {
    // Re-render or update DOM
    this.shadowRoot.innerHTML = this.render();
  }

  // Return HTML string for Shadow DOM content
  render() {
    return `<div>Content</div>`;
  }
}
```

### TypeScript Types

```typescript
import type {
  PropertyDefinition,
  PropertyDefinitions,
  Size,
  Variant,
  ValidationState,
  BaseElementProps,
  SizableProps,
  VariantProps,
  FormElementProps,
  ValidatableProps,
  ValueChangeEventDetail,
} from '@duskmoon-dev/el-core';
```

## Creating Custom Elements

Full example of a custom element:

```typescript
import { BaseElement, css, defaultTheme, resetStyles } from '@duskmoon-dev/el-core';

const styles = css`
  :host {
    display: inline-block;
  }

  .counter {
    display: flex;
    align-items: center;
    gap: var(--dm-spacing-sm);
  }

  button {
    padding: var(--dm-spacing-xs) var(--dm-spacing-sm);
    border-radius: var(--dm-radius-sm);
    background: var(--dm-primary);
    color: white;
    border: none;
    cursor: pointer;
    transition: opacity var(--dm-transition-fast);
  }

  button:hover {
    opacity: 0.9;
  }

  .value {
    min-width: 2rem;
    text-align: center;
    font-weight: var(--dm-font-weight-medium);
  }
`;

export class MyCounter extends BaseElement {
  static properties = {
    value: { type: Number, reflect: true, default: 0 },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
  };

  declare value: number;
  declare min: number;
  declare max: number;

  constructor() {
    super();
    this.attachStyles(resetStyles, defaultTheme, styles);
  }

  connectedCallback() {
    super.connectedCallback();
    this.shadowRoot?.addEventListener('click', this.handleClick.bind(this));
  }

  private handleClick(e: Event) {
    const target = e.target as HTMLElement;
    if (target.matches('[data-action="decrement"]')) {
      this.decrement();
    } else if (target.matches('[data-action="increment"]')) {
      this.increment();
    }
  }

  private decrement() {
    if (this.value > this.min) {
      this.value--;
      this.emit('change', { value: this.value });
    }
  }

  private increment() {
    if (this.value < this.max) {
      this.value++;
      this.emit('change', { value: this.value });
    }
  }

  render() {
    return `
      <div class="counter">
        <button data-action="decrement" ${this.value <= this.min ? 'disabled' : ''}>-</button>
        <span class="value">${this.value}</span>
        <button data-action="increment" ${this.value >= this.max ? 'disabled' : ''}>+</button>
      </div>
    `;
  }
}

export function register() {
  if (!customElements.get('my-counter')) {
    customElements.define('my-counter', MyCounter);
  }
}
```

## License

MIT

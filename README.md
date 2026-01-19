# DuskMoon Elements

[![npm version](https://img.shields.io/npm/v/@duskmoon-dev/elements)](https://www.npmjs.com/package/@duskmoon-dev/elements)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A comprehensive collection of customizable web components built with vanilla TypeScript and Shadow DOM.

## Features

- **Lightweight**: No framework dependencies, pure web components
- **Customizable**: CSS custom properties for easy theming
- **Accessible**: Built with accessibility in mind
- **TypeScript**: Full TypeScript support with type definitions
- **Tree-shakable**: Import only what you need
- **Dual Theme**: Includes moonlight (dark) and sunshine (light) themes

## Quick Start

```bash
# Install the complete bundle
bun add @duskmoon-dev/elements

# Or install individual components
bun add @duskmoon-dev/el-button
```

```html
<script type="module">
  import '@duskmoon-dev/elements/register';
</script>

<el-dm-button variant="primary">Click me</el-dm-button>
```

## Packages

### Core

| Package | Description |
|---------|-------------|
| [@duskmoon-dev/el-core](./packages/core) | Base element class, CSS utilities, and theming |
| [@duskmoon-dev/elements](./packages/elements) | All elements bundled together |

### Input Components

| Package | Element | Description |
|---------|---------|-------------|
| [@duskmoon-dev/el-button](./elements/button) | `<el-dm-button>` | Customizable button with variants and loading state |
| [@duskmoon-dev/el-input](./elements/input) | `<el-dm-input>` | Text input with validation and helper text |
| [@duskmoon-dev/el-switch](./elements/switch) | `<el-dm-switch>` | Toggle switch with labels |
| [@duskmoon-dev/el-slider](./elements/slider) | `<el-dm-slider>` | Range slider with value display |
| [@duskmoon-dev/el-select](./elements/select) | `<el-dm-select>` | Dropdown select with search |
| [@duskmoon-dev/el-cascader](./elements/cascader) | `<el-dm-cascader>` | Multi-level cascading selector |
| [@duskmoon-dev/el-autocomplete](./elements/autocomplete) | `<el-dm-autocomplete>` | Input with suggestions |
| [@duskmoon-dev/el-datepicker](./elements/datepicker) | `<el-dm-datepicker>` | Date picker with calendar |
| [@duskmoon-dev/el-file-upload](./elements/file-upload) | `<el-dm-file-upload>` | File upload with drag and drop |
| [@duskmoon-dev/el-form](./elements/form) | `<el-dm-form>` | Form container with validation |

### Feedback Components

| Package | Element | Description |
|---------|---------|-------------|
| [@duskmoon-dev/el-alert](./elements/alert) | `<el-dm-alert>` | Alert messages with variants |
| [@duskmoon-dev/el-dialog](./elements/dialog) | `<el-dm-dialog>` | Modal dialog |
| [@duskmoon-dev/el-badge](./elements/badge) | `<el-dm-badge>` | Status badges and counters |
| [@duskmoon-dev/el-chip](./elements/chip) | `<el-dm-chip>` | Tags and chips |
| [@duskmoon-dev/el-tooltip](./elements/tooltip) | `<el-dm-tooltip>` | Hover tooltips |
| [@duskmoon-dev/el-progress](./elements/progress) | `<el-dm-progress>` | Progress bars and spinners |

### Navigation Components

| Package | Element | Description |
|---------|---------|-------------|
| [@duskmoon-dev/el-tabs](./elements/tabs) | `<el-dm-tabs>` | Tabbed interface |
| [@duskmoon-dev/el-menu](./elements/menu) | `<el-dm-menu>` | Dropdown and context menus |
| [@duskmoon-dev/el-navbar](./elements/navbar) | `<el-dm-navbar>` | Navigation bar |
| [@duskmoon-dev/el-drawer](./elements/drawer) | `<el-dm-drawer>` | Slide-out drawer |
| [@duskmoon-dev/el-breadcrumbs](./elements/breadcrumbs) | `<el-dm-breadcrumbs>` | Breadcrumb navigation |
| [@duskmoon-dev/el-pagination](./elements/pagination) | `<el-dm-pagination>` | Page navigation |
| [@duskmoon-dev/el-stepper](./elements/stepper) | `<el-dm-stepper>` | Step indicator |
| [@duskmoon-dev/el-bottom-navigation](./elements/bottom-navigation) | `<el-dm-bottom-navigation>` | Mobile bottom nav |

### Surface Components

| Package | Element | Description |
|---------|---------|-------------|
| [@duskmoon-dev/el-card](./elements/card) | `<el-dm-card>` | Content card with slots |
| [@duskmoon-dev/el-accordion](./elements/accordion) | `<el-dm-accordion>` | Collapsible sections |
| [@duskmoon-dev/el-popover](./elements/popover) | `<el-dm-popover>` | Floating content |
| [@duskmoon-dev/el-bottom-sheet](./elements/bottom-sheet) | `<el-dm-bottom-sheet>` | Mobile bottom sheet |

### Data Display Components

| Package | Element | Description |
|---------|---------|-------------|
| [@duskmoon-dev/el-table](./elements/table) | `<el-dm-table>` | Data table with sorting |
| [@duskmoon-dev/el-markdown](./elements/markdown) | `<el-dm-markdown>` | Markdown renderer with syntax highlighting |

## Usage Examples

### Button

```html
<el-dm-button variant="primary">Primary</el-dm-button>
<el-dm-button variant="secondary" size="lg">Large Secondary</el-dm-button>
<el-dm-button variant="success" loading>Loading...</el-dm-button>
```

### Input

```html
<el-dm-input
  label="Email"
  type="email"
  placeholder="you@example.com"
  required
></el-dm-input>
```

### Card

```html
<el-dm-card>
  <h3 slot="header">Card Title</h3>
  <p>Card content goes here.</p>
  <div slot="footer">
    <el-dm-button size="sm">Action</el-dm-button>
  </div>
</el-dm-card>
```

### Dialog

```html
<el-dm-dialog id="myDialog">
  <h2 slot="header">Confirm Action</h2>
  <p>Are you sure you want to continue?</p>
  <div slot="footer">
    <el-dm-button variant="ghost">Cancel</el-dm-button>
    <el-dm-button variant="primary">Confirm</el-dm-button>
  </div>
</el-dm-dialog>

<script>
  document.querySelector('#myDialog').open = true;
</script>
```

### Tabs

```html
<el-dm-tabs>
  <el-dm-tab label="Tab 1">Content for tab 1</el-dm-tab>
  <el-dm-tab label="Tab 2">Content for tab 2</el-dm-tab>
  <el-dm-tab label="Tab 3">Content for tab 3</el-dm-tab>
</el-dm-tabs>
```

## Theming

DuskMoon Elements includes two built-in themes:

- **Moonlight** (dark theme)
- **Sunshine** (light theme)

Set the theme on the root element:

```html
<html data-theme="moonlight">
  <!-- or data-theme="sunshine" -->
</html>
```

### Custom Theming

Override CSS custom properties to customize the look:

```css
:root {
  /* Primary colors */
  --color-primary: oklch(65% 0.15 250);
  --color-primary-content: oklch(98% 0.01 250);

  /* Surface colors */
  --color-surface: oklch(98% 0.01 260);
  --color-on-surface: oklch(20% 0.02 260);

  /* Semantic colors */
  --color-success: oklch(70% 0.15 150);
  --color-warning: oklch(80% 0.15 85);
  --color-error: oklch(65% 0.2 25);
  --color-info: oklch(70% 0.12 240);
}
```

See the [theming documentation](./packages/core/README.md) for all available CSS custom properties.

## Development

### Prerequisites

- [Bun](https://bun.sh/) v1.0 or higher

### Setup

```bash
# Install dependencies
bun install

# Build all packages
bun run build:all

# Run tests
bun run test

# Type check
bun run typecheck

# Start playground
bun run playground

# Start docs
bun run docs
```

### Project Structure

```
duskmoon-elements/
├── elements/               # Individual element packages
│   ├── accordion/          # @duskmoon-dev/el-accordion
│   ├── alert/              # @duskmoon-dev/el-alert
│   ├── button/             # @duskmoon-dev/el-button
│   └── ...                 # 30 element packages total
├── packages/
│   ├── core/               # @duskmoon-dev/el-core
│   ├── elements/           # @duskmoon-dev/elements (bundle)
│   └── docs/               # Documentation site
├── playground/             # Interactive demo
└── package.json            # Root workspace config
```

### Creating a New Element

```typescript
import { BaseElement, css } from '@duskmoon-dev/el-core';

const styles = css`
  :host {
    display: block;
  }
`;

export class ElDmMyElement extends BaseElement {
  static properties = {
    value: { type: String, reflect: true, default: '' }
  };

  declare value: string;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  render() {
    return `<div>${this.value}</div>`;
  }
}

export function register() {
  if (!customElements.get('el-dm-my-element')) {
    customElements.define('el-dm-my-element', ElDmMyElement);
  }
}
```

## Browser Support

DuskMoon Elements use modern web standards:

- Custom Elements v1
- Shadow DOM v1
- Constructable Stylesheets
- ES2022+
- CSS `oklch()` color format

Supported browsers:

- Chrome/Edge 111+
- Firefox 113+
- Safari 16.4+

## Documentation

Visit the [documentation site](https://duskmoon-dev.github.io/duskmoon-elements/) for interactive examples and API reference.

## License

MIT

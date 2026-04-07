# DuskMoon Elements

[![CI](https://github.com/duskmoon-dev/duskmoon-elements/actions/workflows/ci.yml/badge.svg)](https://github.com/duskmoon-dev/duskmoon-elements/actions/workflows/ci.yml)
[![Release](https://github.com/duskmoon-dev/duskmoon-elements/actions/workflows/release.yml/badge.svg)](https://github.com/duskmoon-dev/duskmoon-elements/actions/workflows/release.yml)
[![@duskmoon-dev/elements](https://img.shields.io/npm/v/@duskmoon-dev/elements?label=%40duskmoon-dev%2Felements)](https://www.npmjs.com/package/@duskmoon-dev/elements)
[![@duskmoon-dev/art-elements](https://img.shields.io/npm/v/@duskmoon-dev/art-elements?label=%40duskmoon-dev%2Fart-elements)](https://www.npmjs.com/package/@duskmoon-dev/art-elements)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A comprehensive collection of customizable web components built with vanilla TypeScript and Shadow DOM.

## Features

- **Lightweight**: No framework dependencies, pure web components
- **Customizable**: CSS custom properties for easy theming
- **Accessible**: Built with accessibility in mind
- **TypeScript**: Full TypeScript support with type definitions
- **Tree-shakable**: Import only what you need
- **5 Built-in Themes**: sunshine, moonlight, ocean, forest, rose

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

| Package | Version | Description |
|---------|---------|-------------|
| [@duskmoon-dev/el-base](./packages/base) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-base)](https://www.npmjs.com/package/@duskmoon-dev/el-base) | Base element class, CSS utilities, and theming |
| [@duskmoon-dev/elements](./packages/elements) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/elements)](https://www.npmjs.com/package/@duskmoon-dev/elements) | All elements bundled together |
| [@duskmoon-dev/art-elements](./packages/art-elements) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/art-elements)](https://www.npmjs.com/package/@duskmoon-dev/art-elements) | All pure CSS art elements bundled together |

### Input Components

| Package | Version | Element | Description |
|---------|---------|---------|-------------|
| [@duskmoon-dev/el-button](./elements/button) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-button)](https://www.npmjs.com/package/@duskmoon-dev/el-button) | `<el-dm-button>` | Customizable button with variants and loading state |
| [@duskmoon-dev/el-input](./elements/input) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-input)](https://www.npmjs.com/package/@duskmoon-dev/el-input) | `<el-dm-input>` | Text input with validation and helper text |
| [@duskmoon-dev/el-switch](./elements/switch) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-switch)](https://www.npmjs.com/package/@duskmoon-dev/el-switch) | `<el-dm-switch>` | Toggle switch with labels |
| [@duskmoon-dev/el-slider](./elements/slider) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-slider)](https://www.npmjs.com/package/@duskmoon-dev/el-slider) | `<el-dm-slider>` | Range slider with value display |
| [@duskmoon-dev/el-select](./elements/select) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-select)](https://www.npmjs.com/package/@duskmoon-dev/el-select) | `<el-dm-select>` | Dropdown select with search |
| [@duskmoon-dev/el-cascader](./elements/cascader) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-cascader)](https://www.npmjs.com/package/@duskmoon-dev/el-cascader) | `<el-dm-cascader>` | Multi-level cascading selector |
| [@duskmoon-dev/el-autocomplete](./elements/autocomplete) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-autocomplete)](https://www.npmjs.com/package/@duskmoon-dev/el-autocomplete) | `<el-dm-autocomplete>` | Input with suggestions |
| [@duskmoon-dev/el-datepicker](./elements/datepicker) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-datepicker)](https://www.npmjs.com/package/@duskmoon-dev/el-datepicker) | `<el-dm-datepicker>` | Date picker with calendar |
| [@duskmoon-dev/el-file-upload](./elements/file-upload) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-file-upload)](https://www.npmjs.com/package/@duskmoon-dev/el-file-upload) | `<el-dm-file-upload>` | File upload with drag and drop |
| [@duskmoon-dev/el-form](./elements/form) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-form)](https://www.npmjs.com/package/@duskmoon-dev/el-form) | `<el-dm-form>` | Form container with validation |
| [@duskmoon-dev/el-otp-input](./elements/otp-input) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-otp-input)](https://www.npmjs.com/package/@duskmoon-dev/el-otp-input) | `<el-dm-otp-input>` | OTP verification code input |
| [@duskmoon-dev/el-pin-input](./elements/pin-input) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-pin-input)](https://www.npmjs.com/package/@duskmoon-dev/el-pin-input) | `<el-dm-pin-input>` | Secure PIN entry |
| [@duskmoon-dev/el-time-input](./elements/time-input) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-time-input)](https://www.npmjs.com/package/@duskmoon-dev/el-time-input) | `<el-dm-time-input>` | Time selection input |
| [@duskmoon-dev/el-form-group](./elements/form-group) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-form-group)](https://www.npmjs.com/package/@duskmoon-dev/el-form-group) | `<el-dm-form-group>` | Form field layout group |

### Feedback Components

| Package | Version | Element | Description |
|---------|---------|---------|-------------|
| [@duskmoon-dev/el-alert](./elements/alert) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-alert)](https://www.npmjs.com/package/@duskmoon-dev/el-alert) | `<el-dm-alert>` | Alert messages with variants |
| [@duskmoon-dev/el-dialog](./elements/dialog) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-dialog)](https://www.npmjs.com/package/@duskmoon-dev/el-dialog) | `<el-dm-dialog>` | Modal dialog |
| [@duskmoon-dev/el-badge](./elements/badge) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-badge)](https://www.npmjs.com/package/@duskmoon-dev/el-badge) | `<el-dm-badge>` | Status badges and counters |
| [@duskmoon-dev/el-chip](./elements/chip) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-chip)](https://www.npmjs.com/package/@duskmoon-dev/el-chip) | `<el-dm-chip>` | Tags and chips |
| [@duskmoon-dev/el-tooltip](./elements/tooltip) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-tooltip)](https://www.npmjs.com/package/@duskmoon-dev/el-tooltip) | `<el-dm-tooltip>` | Hover tooltips |
| [@duskmoon-dev/el-progress](./elements/progress) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-progress)](https://www.npmjs.com/package/@duskmoon-dev/el-progress) | `<el-dm-progress>` | Progress bars and spinners |

### Navigation Components

| Package | Version | Element | Description |
|---------|---------|---------|-------------|
| [@duskmoon-dev/el-tabs](./elements/tabs) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-tabs)](https://www.npmjs.com/package/@duskmoon-dev/el-tabs) | `<el-dm-tabs>` | Tabbed interface |
| [@duskmoon-dev/el-menu](./elements/menu) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-menu)](https://www.npmjs.com/package/@duskmoon-dev/el-menu) | `<el-dm-menu>` | Dropdown and context menus |
| [@duskmoon-dev/el-navbar](./elements/navbar) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-navbar)](https://www.npmjs.com/package/@duskmoon-dev/el-navbar) | `<el-dm-navbar>` | Navigation bar |
| [@duskmoon-dev/el-drawer](./elements/drawer) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-drawer)](https://www.npmjs.com/package/@duskmoon-dev/el-drawer) | `<el-dm-drawer>` | Slide-out drawer |
| [@duskmoon-dev/el-breadcrumbs](./elements/breadcrumbs) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-breadcrumbs)](https://www.npmjs.com/package/@duskmoon-dev/el-breadcrumbs) | `<el-dm-breadcrumbs>` | Breadcrumb navigation |
| [@duskmoon-dev/el-pagination](./elements/pagination) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-pagination)](https://www.npmjs.com/package/@duskmoon-dev/el-pagination) | `<el-dm-pagination>` | Page navigation |
| [@duskmoon-dev/el-stepper](./elements/stepper) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-stepper)](https://www.npmjs.com/package/@duskmoon-dev/el-stepper) | `<el-dm-stepper>` | Step indicator |
| [@duskmoon-dev/el-bottom-navigation](./elements/bottom-navigation) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-bottom-navigation)](https://www.npmjs.com/package/@duskmoon-dev/el-bottom-navigation) | `<el-dm-bottom-navigation>` | Mobile bottom nav |
| [@duskmoon-dev/el-navigation](./elements/navigation) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-navigation)](https://www.npmjs.com/package/@duskmoon-dev/el-navigation) | `<el-dm-navigation>` | Navigation layout container |
| [@duskmoon-dev/el-nested-menu](./elements/nested-menu) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-nested-menu)](https://www.npmjs.com/package/@duskmoon-dev/el-nested-menu) | `<el-dm-nested-menu>` | Sidebar menu with collapsible levels |
| [@duskmoon-dev/el-circle-menu](./elements/circle-menu) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-circle-menu)](https://www.npmjs.com/package/@duskmoon-dev/el-circle-menu) | `<el-dm-circle-menu>` | Radial circular navigation menu |
| [@duskmoon-dev/el-segment-control](./elements/segment-control) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-segment-control)](https://www.npmjs.com/package/@duskmoon-dev/el-segment-control) | `<el-dm-segment-control>` | Segmented toggle group |

### Surface Components

| Package | Version | Element | Description |
|---------|---------|---------|-------------|
| [@duskmoon-dev/el-card](./elements/card) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-card)](https://www.npmjs.com/package/@duskmoon-dev/el-card) | `<el-dm-card>` | Content card with slots |
| [@duskmoon-dev/el-accordion](./elements/accordion) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-accordion)](https://www.npmjs.com/package/@duskmoon-dev/el-accordion) | `<el-dm-accordion>` | Collapsible sections |
| [@duskmoon-dev/el-popover](./elements/popover) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-popover)](https://www.npmjs.com/package/@duskmoon-dev/el-popover) | `<el-dm-popover>` | Floating content |
| [@duskmoon-dev/el-bottom-sheet](./elements/bottom-sheet) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-bottom-sheet)](https://www.npmjs.com/package/@duskmoon-dev/el-bottom-sheet) | `<el-dm-bottom-sheet>` | Mobile bottom sheet |
| [@duskmoon-dev/el-theme-controller](./elements/theme-controller) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-theme-controller)](https://www.npmjs.com/package/@duskmoon-dev/el-theme-controller) | `<el-dm-theme-controller>` | CSS-based theme switcher |

### Data Display Components

| Package | Version | Element | Description |
|---------|---------|---------|-------------|
| [@duskmoon-dev/el-table](./elements/table) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-table)](https://www.npmjs.com/package/@duskmoon-dev/el-table) | `<el-dm-table>` | Data table with sorting |
| [@duskmoon-dev/el-markdown](./elements/markdown) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-markdown)](https://www.npmjs.com/package/@duskmoon-dev/el-markdown) | `<el-dm-markdown>` | Markdown renderer with syntax highlighting |
| [@duskmoon-dev/el-markdown-input](./elements/markdown-input) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-markdown-input)](https://www.npmjs.com/package/@duskmoon-dev/el-markdown-input) | `<el-dm-markdown-input>` | Markdown editor with live preview |
| [@duskmoon-dev/el-pro-data-grid](./elements/pro-data-grid) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-pro-data-grid)](https://www.npmjs.com/package/@duskmoon-dev/el-pro-data-grid) | `<el-dm-pro-data-grid>` | Advanced data grid with sorting, filtering, and grouping |
| [@duskmoon-dev/el-code-block](./elements/code-block) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-code-block)](https://www.npmjs.com/package/@duskmoon-dev/el-code-block) | `<el-dm-code-block>` | Code block with language badge, title, and copy button |
| [@duskmoon-dev/el-code-engine](./elements/code-engine) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-code-engine)](https://www.npmjs.com/package/@duskmoon-dev/el-code-engine) | `<el-dm-code-engine>` | Lightweight code editor |

### CSS Art Components

| Package | Version | Element | Description |
|---------|---------|---------|-------------|
| [@duskmoon-dev/el-art-atom](./art-elements/atom) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-art-atom)](https://www.npmjs.com/package/@duskmoon-dev/el-art-atom) | `<el-dm-art-atom>` | Animated atom model |
| [@duskmoon-dev/el-art-cat-stargazer](./art-elements/cat-stargazer) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-art-cat-stargazer)](https://www.npmjs.com/package/@duskmoon-dev/el-art-cat-stargazer) | `<el-dm-art-cat-stargazer>` | Cat gazing at stars |
| [@duskmoon-dev/el-art-circular-gallery](./art-elements/circular-gallery) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-art-circular-gallery)](https://www.npmjs.com/package/@duskmoon-dev/el-art-circular-gallery) | `<el-dm-art-circular-gallery>` | Circular image gallery |
| [@duskmoon-dev/el-art-color-spin](./art-elements/color-spin) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-art-color-spin)](https://www.npmjs.com/package/@duskmoon-dev/el-art-color-spin) | `<el-dm-art-color-spin>` | Spinning color wheel |
| [@duskmoon-dev/el-art-csswitch](./art-elements/csswitch) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-art-csswitch)](https://www.npmjs.com/package/@duskmoon-dev/el-art-csswitch) | `<el-dm-art-csswitch>` | CSS-style game controller switch |
| [@duskmoon-dev/el-art-eclipse](./art-elements/eclipse) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-art-eclipse)](https://www.npmjs.com/package/@duskmoon-dev/el-art-eclipse) | `<el-dm-art-eclipse>` | Solar eclipse animation |
| [@duskmoon-dev/el-art-flower-animation](./art-elements/flower-animation) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-art-flower-animation)](https://www.npmjs.com/package/@duskmoon-dev/el-art-flower-animation) | `<el-dm-art-flower-animation>` | Animated flower bloom |
| [@duskmoon-dev/el-art-gemini-input](./art-elements/gemini-input) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-art-gemini-input)](https://www.npmjs.com/package/@duskmoon-dev/el-art-gemini-input) | `<el-dm-art-gemini-input>` | Gemini-style animated gradient input |
| [@duskmoon-dev/el-art-moon](./art-elements/moon) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-art-moon)](https://www.npmjs.com/package/@duskmoon-dev/el-art-moon) | `<el-dm-art-moon>` | Moon phase art |
| [@duskmoon-dev/el-art-mountain](./art-elements/mountain) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-art-mountain)](https://www.npmjs.com/package/@duskmoon-dev/el-art-mountain) | `<el-dm-art-mountain>` | Mountain landscape with aurora |
| [@duskmoon-dev/el-art-plasma-ball](./art-elements/plasma-ball) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-art-plasma-ball)](https://www.npmjs.com/package/@duskmoon-dev/el-art-plasma-ball) | `<el-dm-art-plasma-ball>` | Plasma ball effect |
| [@duskmoon-dev/el-art-snow](./art-elements/snow) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-art-snow)](https://www.npmjs.com/package/@duskmoon-dev/el-art-snow) | `<el-dm-art-snow>` | Snow animation |
| [@duskmoon-dev/el-art-snowball-preloader](./art-elements/snowball-preloader) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-art-snowball-preloader)](https://www.npmjs.com/package/@duskmoon-dev/el-art-snowball-preloader) | `<el-dm-art-snowball-preloader>` | Animated snowball loading indicator |
| [@duskmoon-dev/el-art-sun](./art-elements/sun) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-art-sun)](https://www.npmjs.com/package/@duskmoon-dev/el-art-sun) | `<el-dm-art-sun>` | Sun art |
| [@duskmoon-dev/el-art-synthwave-starfield](./art-elements/synthwave-starfield) | [![npm](https://img.shields.io/npm/v/@duskmoon-dev/el-art-synthwave-starfield)](https://www.npmjs.com/package/@duskmoon-dev/el-art-synthwave-starfield) | `<el-dm-art-synthwave-starfield>` | Synthwave starfield |

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

DuskMoon Elements includes five built-in themes:

- **Sunshine** (light theme)
- **Moonlight** (dark theme)
- **Ocean** (blue/teal palette)
- **Forest** (earthy greens)
- **Rose** (soft pinks)

Set the theme on the root element:

```html
<html data-theme="moonlight">
  <!-- sunshine | moonlight | ocean | forest | rose -->
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

See the [theming documentation](./packages/base/README.md) for all available CSS custom properties.

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
│   └── ...                 # 43 element packages total
├── art-elements/               # Pure CSS art element packages
│   ├── atom/               # @duskmoon-dev/el-art-atom
│   ├── moon/               # @duskmoon-dev/el-art-moon
│   └── ...                 # 15 css art packages total
├── packages/
│   ├── base/               # @duskmoon-dev/el-base
│   ├── elements/           # @duskmoon-dev/elements (bundle)
│   ├── art-elements/       # @duskmoon-dev/art-elements (bundle)
│   └── docs/               # Documentation site
├── playground/             # Interactive demo
└── package.json            # Root workspace config
```

### Creating a New Element

```typescript
import { BaseElement, css } from '@duskmoon-dev/el-base';

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

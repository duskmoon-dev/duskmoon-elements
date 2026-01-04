# @duskmoon-dev/elements

All DuskMoon custom elements in one package.

## Installation

```bash
bun add @duskmoon-dev/elements
```

## Usage

### Auto-Register via CDN (Recommended)

The simplest way to use all elements - just add a script tag:

```html
<!-- Via CDN - registers all elements automatically -->
<script type="module" src="https://esm.sh/@duskmoon-dev/elements/register"></script>

<!-- Now all elements are available -->
<el-dm-button variant="primary">Click me</el-dm-button>
<el-dm-card>
  <h2>Card Title</h2>
  <p>Card content</p>
</el-dm-card>
<el-dm-input label="Name" placeholder="Enter your name"></el-dm-input>
<el-dm-markdown>## Hello **Markdown**</el-dm-markdown>
```

### Auto-Register with Bundler

```ts
// Just import to register all elements
import '@duskmoon-dev/elements/register';
```

### Manual Registration

```ts
import { registerAll } from '@duskmoon-dev/elements';

// Register all elements
registerAll();
```

Or register individual elements:

```ts
import { registerButton, registerCard } from '@duskmoon-dev/elements';

registerButton();
registerCard();
```

### Using Element Classes

```ts
import { ElDmButton, ElDmCard, ElDmInput, ElDmMarkdown } from '@duskmoon-dev/elements';

// Access element classes directly
const button = document.querySelector('el-dm-button') as ElDmButton;
button.variant = 'primary';
```

## Included Elements

| Element  | Tag                | Description                                                |
| -------- | ------------------ | ---------------------------------------------------------- |
| Button   | `<el-dm-button>`   | Customizable button with variants, sizes, loading state    |
| Card     | `<el-dm-card>`     | Flexible card container with header, body, footer sections |
| Input    | `<el-dm-input>`    | Form input with validation, labels, helper text            |
| Markdown | `<el-dm-markdown>` | Markdown renderer with syntax highlighting, streaming mode |

## Re-exported Utilities

This package also re-exports utilities from `@duskmoon-dev/el-core`:

```ts
import {
  BaseElement,
  css,
  combineStyles,
  cssVars,
  defaultTheme,
  resetStyles,
} from '@duskmoon-dev/elements';
```

## Individual Packages

If you only need specific elements, install them individually for smaller bundle size:

| Package                     | CDN URL                                             |
| --------------------------- | --------------------------------------------------- |
| `@duskmoon-dev/el-button`   | `https://esm.sh/@duskmoon-dev/el-button/register`   |
| `@duskmoon-dev/el-card`     | `https://esm.sh/@duskmoon-dev/el-card/register`     |
| `@duskmoon-dev/el-input`    | `https://esm.sh/@duskmoon-dev/el-input/register`    |
| `@duskmoon-dev/el-markdown` | `https://esm.sh/@duskmoon-dev/el-markdown/register` |

Example using individual packages:

```html
<!-- Only load the button element -->
<script type="module" src="https://esm.sh/@duskmoon-dev/el-button/register"></script>

<el-dm-button>Click me</el-dm-button>
```

Or with a bundler:

```ts
import '@duskmoon-dev/el-button/register';
```

## License

MIT

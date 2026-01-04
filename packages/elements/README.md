# @duskmoon-dev/elements

All DuskMoon custom elements in one package.

## Installation

```bash
bun add @duskmoon-dev/elements
```

## Usage

### Auto-register All Elements

The easiest way to use all elements is to import the register path:

```ts
// Just import to register all elements
import '@duskmoon-dev/elements/register';
```

```html
<!-- Now all elements are available -->
<el-dm-button variant="primary">Click me</el-dm-button>
<el-dm-card>
  <h2>Card Title</h2>
  <p>Card content</p>
</el-dm-card>
<el-dm-input label="Name" placeholder="Enter your name"></el-dm-input>
<el-dm-markdown>## Hello **Markdown**</el-dm-markdown>
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

If you only need specific elements, install them individually:

- `@duskmoon-dev/el-button`
- `@duskmoon-dev/el-card`
- `@duskmoon-dev/el-input`
- `@duskmoon-dev/el-markdown`

Each package also supports auto-registration:

```ts
import '@duskmoon-dev/el-button/register';
```

## License

MIT

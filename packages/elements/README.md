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
import { registerButton, registerCard, registerTable } from '@duskmoon-dev/elements';

registerButton();
registerCard();
registerTable();
```

### Using Element Classes

```ts
import { ElDmButton, ElDmTable, ElDmTabs } from '@duskmoon-dev/elements';

// Access element classes directly
const button = document.querySelector('el-dm-button') as ElDmButton;
button.variant = 'primary';
```

## Included Elements

### Basic Components

| Element | Tag              | Description                                |
| ------- | ---------------- | ------------------------------------------ |
| Button  | `<el-dm-button>` | Button with variants, sizes, loading state |
| Card    | `<el-dm-card>`   | Container with header, body, footer slots  |

### Form Elements

| Element      | Tag                    | Description                           |
| ------------ | ---------------------- | ------------------------------------- |
| Input        | `<el-dm-input>`        | Text input with validation states     |
| Switch       | `<el-dm-switch>`       | Toggle switch control                 |
| Slider       | `<el-dm-slider>`       | Range slider with optional range mode |
| Autocomplete | `<el-dm-autocomplete>` | Input with suggestion dropdown        |
| Datepicker   | `<el-dm-datepicker>`   | Date picker with calendar popup       |
| FileUpload   | `<el-dm-file-upload>`  | File upload with drag-and-drop        |
| Form         | `<el-dm-form>`         | Form container with validation        |

### Feedback & Display

| Element  | Tag                | Description                                |
| -------- | ------------------ | ------------------------------------------ |
| Alert    | `<el-dm-alert>`    | Alert messages with severity variants      |
| Dialog   | `<el-dm-dialog>`   | Modal dialog with backdrop                 |
| Badge    | `<el-dm-badge>`    | Status badges and counters                 |
| Chip     | `<el-dm-chip>`     | Tags and chips with optional delete        |
| Tooltip  | `<el-dm-tooltip>`  | Hover tooltips                             |
| Progress | `<el-dm-progress>` | Progress bars and indeterminate spinners   |
| Markdown | `<el-dm-markdown>` | Markdown renderer with syntax highlighting |

### Navigation

| Element          | Tag                         | Description                |
| ---------------- | --------------------------- | -------------------------- |
| Tabs             | `<el-dm-tabs>`              | Tabbed interface           |
| Menu             | `<el-dm-menu>`              | Dropdown and context menus |
| Navbar           | `<el-dm-navbar>`            | Navigation bar             |
| Drawer           | `<el-dm-drawer>`            | Slide-out drawer panel     |
| Breadcrumbs      | `<el-dm-breadcrumbs>`       | Breadcrumb navigation      |
| Pagination       | `<el-dm-pagination>`        | Page navigation controls   |
| Stepper          | `<el-dm-stepper>`           | Step indicator for wizards |
| BottomNavigation | `<el-dm-bottom-navigation>` | Mobile bottom navigation   |

### Surfaces & Containers

| Element     | Tag                    | Description                  |
| ----------- | ---------------------- | ---------------------------- |
| Accordion   | `<el-dm-accordion>`    | Collapsible content sections |
| Popover     | `<el-dm-popover>`      | Floating content popup       |
| BottomSheet | `<el-dm-bottom-sheet>` | Mobile bottom sheet          |

### Data Display

| Element | Tag             | Description                                    |
| ------- | --------------- | ---------------------------------------------- |
| Table   | `<el-dm-table>` | Data table with sorting, pagination, selection |

## Re-exported Utilities

This package also re-exports utilities from `@duskmoon-dev/el-base`:

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
| `@duskmoon-dev/el-table`    | `https://esm.sh/@duskmoon-dev/el-table/register`    |
| `@duskmoon-dev/el-tabs`     | `https://esm.sh/@duskmoon-dev/el-tabs/register`     |
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
import '@duskmoon-dev/el-table/register';
```

## TypeScript Support

All element types and interfaces are exported:

```ts
import type {
  // Property types from core
  Size,
  Variant,
  ValidationState,

  // Element-specific types
  TableColumn,
  TableRow,
  AutocompleteOption,
  BreadcrumbItem,
  PopoverPlacement,
  TabsVariant,
} from '@duskmoon-dev/elements';
```

## License

MIT

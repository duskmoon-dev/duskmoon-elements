# @duskmoon-dev/el-chip

An accessible chip/tag custom element with display, link, action, selection, and removal
modes.

## Installation

```bash
bun add @duskmoon-dev/el-chip
```

## Usage

### Auto-Register

```typescript
import '@duskmoon-dev/el-chip/register';
```

```html
<el-dm-chip>Label</el-dm-chip>
```

### Manual Registration

```typescript
import { ElDmChip, register } from '@duskmoon-dev/el-chip';

// Register with default tag name
register();

// Or register with custom tag name
customElements.define('my-chip', ElDmChip);
```

## Modes

| Mode       | Enable with       | Rendered semantics                                   | Use for                |
| ---------- | ----------------- | ---------------------------------------------------- | ---------------------- |
| Display    | No mode attribute | Non-focusable `<span>`                               | Static labels and tags |
| Link       | `href`            | Native `<a>`                                         | Navigation             |
| Clickable  | `clickable`       | Native `<button type="button">`                      | One-off actions        |
| Selectable | `selectable`      | Native toggle button with `aria-pressed`             | Filters and choices    |
| Deletable  | `deletable`       | Noninteractive container with a native delete button | Removable tags         |

When multiple mode attributes are present, the mode precedence is `deletable` → `href` →
`selectable` → `clickable` → display. This prevents nested interactive controls. Use one mode
attribute per chip unless you intentionally rely on this precedence.

## Variants

| Variant    | Description                 |
| ---------- | --------------------------- |
| `filled`   | Filled background (default) |
| `outlined` | Outlined style              |
| `soft`     | Soft/subtle background      |

## Sizes

| Size | Description           |
| ---- | --------------------- |
| `sm` | Small chip            |
| `md` | Medium chip (default) |
| `lg` | Large chip            |

## Attributes

| Attribute      | Type      | Default         | Description                                                    |
| -------------- | --------- | --------------- | -------------------------------------------------------------- |
| `variant`      | `string`  | `'filled'`      | Style variant                                                  |
| `color`        | `string`  | `'primary'`     | Color variant                                                  |
| `size`         | `string`  | `'md'`          | Size: `sm`, `md`, `lg`                                         |
| `href`         | `string`  | -               | Enables link mode and sets the link destination                |
| `target`       | `string`  | -               | Link browsing context; used only with `href`                   |
| `rel`          | `string`  | -               | Link relationship; used only with `href`                       |
| `clickable`    | `boolean` | `false`         | Enables action-button mode                                     |
| `selectable`   | `boolean` | `false`         | Enables toggle-button mode                                     |
| `deletable`    | `boolean` | `false`         | Show delete button                                             |
| `delete-label` | `string`  | `'Remove chip'` | Accessible name for the delete button (`deleteLabel` property) |
| `selected`     | `boolean` | `false`         | Selected state; toggled automatically in selectable mode       |
| `disabled`     | `boolean` | `false`         | Disabled state                                                 |

## Slots

| Slot      | Description       |
| --------- | ----------------- |
| (default) | Chip label        |
| `icon`    | Icon before label |

## CSS Parts

| Part     | Description        |
| -------- | ------------------ |
| `chip`   | The chip element   |
| `icon`   | The icon container |
| `delete` | The delete button  |

## Events

| Event       | Detail                  | Description                                      |
| ----------- | ----------------------- | ------------------------------------------------ |
| `dm-click`  | -                       | Fired when a link or clickable chip is activated |
| `dm-change` | `{ selected: boolean }` | Fired after a selectable chip toggles            |
| `dm-delete` | -                       | Fired when the delete button is activated        |
| `delete`    | -                       | Deprecated alias emitted with `dm-delete`        |

The custom events bubble, cross the shadow boundary, and are cancelable. Canceling `dm-click`
prevents link navigation. Native `click` events from the rendered anchor or button are also
available.

## Examples

### Basic

```html
<el-dm-chip>Default</el-dm-chip>
```

### Semantic Modes

```html
<!-- Display -->
<el-dm-chip>Release 1.8</el-dm-chip>

<!-- Link -->
<el-dm-chip href="/releases" target="_blank" rel="noopener">Releases</el-dm-chip>

<!-- Action -->
<el-dm-chip clickable>Refresh</el-dm-chip>

<!-- Selection -->
<el-dm-chip selectable selected>TypeScript</el-dm-chip>

<!-- Removal -->
<el-dm-chip deletable delete-label="Remove TypeScript filter">TypeScript</el-dm-chip>
```

### Variants

```html
<el-dm-chip variant="filled">Filled</el-dm-chip>
<el-dm-chip variant="outlined">Outlined</el-dm-chip>
<el-dm-chip variant="soft">Soft</el-dm-chip>
```

### Colors

```html
<el-dm-chip color="primary">Primary</el-dm-chip>
<el-dm-chip color="success">Success</el-dm-chip>
<el-dm-chip color="warning">Warning</el-dm-chip>
<el-dm-chip color="error">Error</el-dm-chip>
```

### Sizes

```html
<el-dm-chip size="sm">Small</el-dm-chip>
<el-dm-chip size="md">Medium</el-dm-chip>
<el-dm-chip size="lg">Large</el-dm-chip>
```

### Deletable

```html
<el-dm-chip deletable delete-label="Remove Web Components tag">Web Components</el-dm-chip>
```

### Selectable

```html
<el-dm-chip selectable>Unselected</el-dm-chip> <el-dm-chip selectable selected>Selected</el-dm-chip>
```

### Disabled

```html
<el-dm-chip href="/releases" disabled>Unavailable link</el-dm-chip>
<el-dm-chip clickable disabled>Unavailable action</el-dm-chip>
<el-dm-chip selectable disabled>Unavailable choice</el-dm-chip>
<el-dm-chip deletable disabled>Protected tag</el-dm-chip>
```

### With Icon

```html
<el-dm-chip>
  <span slot="icon">⭐</span>
  Featured
</el-dm-chip>
```

### Handling Delete

```javascript
const chip = document.querySelector('el-dm-chip');
const filterInput = document.querySelector('#filter-input');
chip.addEventListener('dm-delete', () => {
  chip.remove();
  filterInput?.focus();
});
```

The component emits the removal request but never removes itself. If the application removes the
focused chip, it must move focus to the next logical chip, the previous chip, or the owning input.

The legacy `delete` event remains available as a deprecated alias. New integrations should use
`dm-delete`.

## Accessibility

- Display chips are plain, non-focusable text containers.
- Link, clickable, and selectable modes use native anchor and button semantics, including their
  built-in keyboard behavior.
- Selectable chips expose their state with `aria-pressed` and retain focus after toggling.
- Deletable chips expose a focusable native button. Set `delete-label` when the default
  `Remove chip` name is not specific enough; the delete icon is hidden from assistive technology.
- Disabled buttons use the native `disabled` state. A disabled link renders as a noninteractive
  span with `aria-disabled="true"`, and disabled deletable chips disable their delete button.

## License

MIT

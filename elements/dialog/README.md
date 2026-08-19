# @duskmoon-dev/el-dialog

A modal dialog custom element built on the native HTML `<dialog>` element, styled with `@duskmoon-dev/core`.

## Installation

```bash
bun add @duskmoon-dev/el-dialog
```

## Usage

### Auto-Register

```typescript
import '@duskmoon-dev/el-dialog/register';
```

```html
<button command="show-modal" commandfor="myDialog">Open Dialog</button>

<el-dm-dialog id="myDialog">
  <span slot="header">Dialog Title</span>
  <p>Dialog content goes here.</p>
  <div slot="footer">
    <el-dm-button variant="ghost">Cancel</el-dm-button>
    <el-dm-button variant="primary">Confirm</el-dm-button>
  </div>
</el-dm-dialog>
```

### Manual Registration

```typescript
import { ElDmDialog, register } from '@duskmoon-dev/el-dialog';

// Register with default tag name
register();

// Or register with custom tag name
customElements.define('my-dialog', ElDmDialog);
```

## Sizes

| Size | Description |
|------|-------------|
| `sm` | Small dialog |
| `md` | Medium dialog (default) |
| `lg` | Large dialog |
| `xl` | Extra large dialog |
| `full` | Full-screen dialog |

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `open` | `boolean` | `false` | Whether the dialog is open |
| `size` | `string` | `'md'` | Size: `sm`, `md`, `lg`, `xl`, `full` |
| `dismissible` | `boolean` | `true` | Allow closing via backdrop/Escape |
| `no-dismiss` | `boolean` | `false` | Prevent closing via backdrop or Escape |
| `no-backdrop` | `boolean` | `false` | Open as non-modal (`show()` instead of `showModal()`) |

## Methods

| Method | Description |
|--------|-------------|
| `show()` | Opens the dialog as a modal |
| `showModal()` | Alias for `show()` |
| `close()` | Closes the dialog |
| `toggle()` | Toggles the dialog state |

## Slots

| Slot | Description |
|------|-------------|
| (default) | Dialog body content |
| `header` | Dialog header/title |
| `footer` | Dialog footer with actions |

## CSS Parts

| Part | Description |
|------|-------------|
| `dialog` | The native `<dialog>` element |
| `box` | Inner `dialog-box` container |
| `header` | The header section |
| `title` | The title wrapper |
| `body` | The body section |
| `footer` | The footer section |
| `close` | The close button |

The backdrop is the native `::backdrop` pseudo-element. Tune it with `--color-scrim`.

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `open` | - | Fired when dialog opens |
| `close` | - | Fired when dialog closes |

## Examples

### Basic Dialog

```html
<el-dm-button onclick="document.querySelector('#dialog').show()">
  Open Dialog
</el-dm-button>

<el-dm-dialog id="dialog">
  <span slot="header">Confirmation</span>
  <p>Are you sure you want to proceed?</p>
  <div slot="footer">
    <el-dm-button variant="ghost" onclick="this.closest('el-dm-dialog').close()">
      Cancel
    </el-dm-button>
    <el-dm-button variant="primary">
      Confirm
    </el-dm-button>
  </div>
</el-dm-dialog>
```

### Sizes

```html
<el-dm-dialog size="sm">Small dialog</el-dm-dialog>
<el-dm-dialog size="md">Medium dialog</el-dm-dialog>
<el-dm-dialog size="lg">Large dialog</el-dm-dialog>
<el-dm-dialog size="xl">Extra large dialog</el-dm-dialog>
<el-dm-dialog size="full">Full-screen dialog</el-dm-dialog>
```

### Non-Dismissible

```html
<el-dm-dialog no-dismiss>
  <span slot="header">Required Action</span>
  <p>You must complete this action.</p>
  <div slot="footer">
    <el-dm-button variant="primary">Continue</el-dm-button>
  </div>
</el-dm-dialog>
```

### Programmatic Control

```javascript
const dialog = document.querySelector('el-dm-dialog');

dialog.show();
dialog.close();

dialog.addEventListener('close', () => {
  console.log('Dialog closed');
});
```

## License

MIT

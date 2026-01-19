# @duskmoon-dev/el-dialog

A modal dialog component built with Web Components.

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
| `full` | Full-screen dialog |

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `open` | `boolean` | `false` | Whether the dialog is open |
| `size` | `string` | `'md'` | Size: `sm`, `md`, `lg`, `full` |
| `dismissible` | `boolean` | `true` | Allow closing via backdrop/escape |
| `no-backdrop` | `boolean` | `false` | Hide the backdrop |

## Slots

| Slot | Description |
|------|-------------|
| (default) | Dialog body content |
| `header` | Dialog header/title |
| `footer` | Dialog footer with actions |

## CSS Parts

| Part | Description |
|------|-------------|
| `dialog` | The dialog element |
| `backdrop` | The backdrop overlay |
| `content` | The content wrapper |
| `header` | The header section |
| `body` | The body section |
| `footer` | The footer section |
| `close` | The close button |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `open` | - | Fired when dialog opens |
| `close` | - | Fired when dialog closes |

## Examples

### Basic Dialog

```html
<el-dm-button onclick="document.querySelector('#dialog').open = true">
  Open Dialog
</el-dm-button>

<el-dm-dialog id="dialog">
  <span slot="header">Confirmation</span>
  <p>Are you sure you want to proceed?</p>
  <div slot="footer">
    <el-dm-button variant="ghost" onclick="this.closest('el-dm-dialog').open = false">
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
<el-dm-dialog size="full">Full-screen dialog</el-dm-dialog>
```

### Non-Dismissible

```html
<el-dm-dialog dismissible="false">
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

// Open
dialog.open = true;

// Close
dialog.open = false;

// Listen for events
dialog.addEventListener('close', () => {
  console.log('Dialog closed');
});
```

## License

MIT

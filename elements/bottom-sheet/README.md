# @duskmoon-dev/el-bottom-sheet

A mobile bottom sheet component built with Web Components.

## Installation

```bash
bun add @duskmoon-dev/el-bottom-sheet
```

## Usage

### Auto-Register

```typescript
import '@duskmoon-dev/el-bottom-sheet/register';
```

```html
<el-dm-bottom-sheet id="sheet">
  <span slot="header">Sheet Title</span>
  <p>Sheet content goes here.</p>
</el-dm-bottom-sheet>
```

### Manual Registration

```typescript
import { ElDmBottomSheet, register } from '@duskmoon-dev/el-bottom-sheet';

// Register with default tag name
register();

// Or register with custom tag name
customElements.define('my-bottom-sheet', ElDmBottomSheet);
```

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `open` | `boolean` | `false` | Whether the sheet is open |
| `modal` | `boolean` | `true` | Show backdrop overlay |
| `persistent` | `boolean` | `false` | Prevent closing on backdrop click |
| `snap-points` | `string` | - | Snap points (e.g., "25,50,100") |

## Slots

| Slot | Description |
|------|-------------|
| (default) | Sheet content |
| `header` | Sheet header |

## CSS Parts

| Part | Description |
|------|-------------|
| `sheet` | The sheet container |
| `backdrop` | The backdrop overlay |
| `handle` | The drag handle |
| `content` | The content wrapper |
| `header` | The header section |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `open` | - | Fired when sheet opens |
| `close` | - | Fired when sheet closes |
| `snap` | `{ point }` | Fired when sheet snaps to point |

## Examples

### Basic

```html
<el-dm-button onclick="document.querySelector('#sheet').open = true">
  Open Sheet
</el-dm-button>

<el-dm-bottom-sheet id="sheet">
  <span slot="header">Options</span>
  <ul>
    <li>Option 1</li>
    <li>Option 2</li>
    <li>Option 3</li>
  </ul>
</el-dm-bottom-sheet>
```

### With Snap Points

```html
<el-dm-bottom-sheet snap-points="25,50,100">
  <span slot="header">Draggable Sheet</span>
  <p>Drag up or down to snap to different heights.</p>
</el-dm-bottom-sheet>
```

### Persistent (Non-Dismissible)

```html
<el-dm-bottom-sheet persistent>
  <span slot="header">Required Action</span>
  <p>You must complete this action.</p>
  <el-dm-button onclick="this.closest('el-dm-bottom-sheet').open = false">
    Done
  </el-dm-button>
</el-dm-bottom-sheet>
```

### Without Backdrop

```html
<el-dm-bottom-sheet modal="false">
  Content without backdrop
</el-dm-bottom-sheet>
```

### Action Sheet Pattern

```html
<el-dm-bottom-sheet id="actions">
  <span slot="header">Share</span>
  <div class="action-list">
    <button>Copy Link</button>
    <button>Email</button>
    <button>Twitter</button>
    <button>Facebook</button>
  </div>
</el-dm-bottom-sheet>
```

### Programmatic Control

```javascript
const sheet = document.querySelector('el-dm-bottom-sheet');

// Open
sheet.open = true;

// Close
sheet.open = false;

// Listen for events
sheet.addEventListener('close', () => {
  console.log('Sheet closed');
});

sheet.addEventListener('snap', (e) => {
  console.log('Snapped to:', e.detail.point + '%');
});
```

## License

MIT

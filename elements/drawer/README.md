# @duskmoon-dev/el-drawer

A slide-out drawer component built with Web Components.

## Installation

```bash
bun add @duskmoon-dev/el-drawer
```

## Usage

### Auto-Register

```typescript
import '@duskmoon-dev/el-drawer/register';
```

```html
<el-dm-drawer id="myDrawer">
  <span slot="header">Drawer Title</span>
  <p>Drawer content goes here.</p>
</el-dm-drawer>
```

### Manual Registration

```typescript
import { ElDmDrawer, register } from '@duskmoon-dev/el-drawer';

// Register with default tag name
register();

// Or register with custom tag name
customElements.define('my-drawer', ElDmDrawer);
```

## Positions

| Position | Description |
|----------|-------------|
| `left` | Slide from left (default) |
| `right` | Slide from right |
| `top` | Slide from top |
| `bottom` | Slide from bottom |

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `open` | `boolean` | `false` | Whether the drawer is open |
| `position` | `string` | `'left'` | Position: `left`, `right`, `top`, `bottom` |
| `modal` | `boolean` | `true` | Show backdrop overlay |
| `width` | `string` | `'300px'` | Drawer width (for left/right) |

## Slots

| Slot | Description |
|------|-------------|
| (default) | Drawer body content |
| `header` | Drawer header |
| `footer` | Drawer footer |

## CSS Parts

| Part | Description |
|------|-------------|
| `drawer` | The drawer element |
| `backdrop` | The backdrop overlay |
| `content` | The content wrapper |
| `header` | The header section |
| `body` | The body section |
| `footer` | The footer section |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `open` | - | Fired when drawer opens |
| `close` | - | Fired when drawer closes |

## Examples

### Basic

```html
<el-dm-button onclick="document.querySelector('#drawer').open = true">
  Open Drawer
</el-dm-button>

<el-dm-drawer id="drawer">
  <span slot="header">Menu</span>
  <nav>
    <a href="#">Home</a>
    <a href="#">About</a>
    <a href="#">Contact</a>
  </nav>
</el-dm-drawer>
```

### Positions

```html
<el-dm-drawer position="left">Left drawer</el-dm-drawer>
<el-dm-drawer position="right">Right drawer</el-dm-drawer>
<el-dm-drawer position="top">Top drawer</el-dm-drawer>
<el-dm-drawer position="bottom">Bottom drawer</el-dm-drawer>
```

### Custom Width

```html
<el-dm-drawer width="400px">
  Wider drawer
</el-dm-drawer>
```

### Without Backdrop

```html
<el-dm-drawer modal="false">
  No backdrop
</el-dm-drawer>
```

### With Footer

```html
<el-dm-drawer>
  <span slot="header">Settings</span>
  <p>Drawer content</p>
  <div slot="footer">
    <el-dm-button variant="ghost">Cancel</el-dm-button>
    <el-dm-button variant="primary">Save</el-dm-button>
  </div>
</el-dm-drawer>
```

### Programmatic Control

```javascript
const drawer = document.querySelector('el-dm-drawer');

// Open
drawer.open = true;

// Close
drawer.open = false;

// Listen for events
drawer.addEventListener('close', () => {
  console.log('Drawer closed');
});
```

## License

MIT

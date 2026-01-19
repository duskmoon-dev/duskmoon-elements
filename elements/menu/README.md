# @duskmoon-dev/el-menu

A dropdown and context menu component built with Web Components.

## Installation

```bash
bun add @duskmoon-dev/el-menu
```

## Usage

### Auto-Register

```typescript
import '@duskmoon-dev/el-menu/register';
```

```html
<el-dm-menu>
  <el-dm-menu-item>Option 1</el-dm-menu-item>
  <el-dm-menu-item>Option 2</el-dm-menu-item>
  <el-dm-menu-divider></el-dm-menu-divider>
  <el-dm-menu-item>Option 3</el-dm-menu-item>
</el-dm-menu>
```

### Manual Registration

```typescript
import { ElDmMenu, ElDmMenuItem, register } from '@duskmoon-dev/el-menu';

// Register with default tag names
register();

// Or register with custom tag names
customElements.define('my-menu', ElDmMenu);
customElements.define('my-menu-item', ElDmMenuItem);
```

## Placements

| Placement | Description |
|-----------|-------------|
| `bottom-start` | Below, aligned to start (default) |
| `bottom-end` | Below, aligned to end |
| `top-start` | Above, aligned to start |
| `top-end` | Above, aligned to end |
| `left` | To the left |
| `right` | To the right |

## Attributes (el-dm-menu)

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `open` | `boolean` | `false` | Whether the menu is open |
| `anchor` | `string` | - | Selector for anchor element |
| `placement` | `string` | `'bottom-start'` | Menu placement |

## Attributes (el-dm-menu-item)

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `value` | `string` | - | Item value |
| `disabled` | `boolean` | `false` | Disable the item |

## CSS Parts (el-dm-menu)

| Part | Description |
|------|-------------|
| `menu` | The menu container |
| `items` | The items wrapper |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `open` | - | Fired when menu opens |
| `close` | - | Fired when menu closes |
| `select` | `{ value }` | Fired when item is selected |

## Examples

### Basic Dropdown

```html
<el-dm-button id="menuTrigger">Options</el-dm-button>
<el-dm-menu anchor="#menuTrigger">
  <el-dm-menu-item value="edit">Edit</el-dm-menu-item>
  <el-dm-menu-item value="duplicate">Duplicate</el-dm-menu-item>
  <el-dm-menu-divider></el-dm-menu-divider>
  <el-dm-menu-item value="delete">Delete</el-dm-menu-item>
</el-dm-menu>
```

### With Disabled Item

```html
<el-dm-menu>
  <el-dm-menu-item>Available</el-dm-menu-item>
  <el-dm-menu-item disabled>Disabled</el-dm-menu-item>
</el-dm-menu>
```

### Different Placements

```html
<el-dm-menu placement="bottom-end">...</el-dm-menu>
<el-dm-menu placement="top-start">...</el-dm-menu>
<el-dm-menu placement="right">...</el-dm-menu>
```

### Handling Selection

```javascript
const menu = document.querySelector('el-dm-menu');
menu.addEventListener('select', (e) => {
  console.log('Selected:', e.detail.value);
});
```

### Context Menu

```javascript
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const menu = document.querySelector('el-dm-menu');
  menu.style.left = `${e.clientX}px`;
  menu.style.top = `${e.clientY}px`;
  menu.open = true;
});
```

## License

MIT

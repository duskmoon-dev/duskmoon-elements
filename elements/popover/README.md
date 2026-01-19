# @duskmoon-dev/el-popover

A floating content popover component built with Web Components.

## Installation

```bash
bun add @duskmoon-dev/el-popover
```

## Usage

### Auto-Register

```typescript
import '@duskmoon-dev/el-popover/register';
```

```html
<el-dm-popover>
  <button slot="trigger">Click me</button>
  <div>Popover content goes here</div>
</el-dm-popover>
```

### Manual Registration

```typescript
import { ElDmPopover, register } from '@duskmoon-dev/el-popover';

// Register with default tag name
register();

// Or register with custom tag name
customElements.define('my-popover', ElDmPopover);
```

## Placements

| Placement | Description |
|-----------|-------------|
| `top` | Above the trigger |
| `bottom` | Below the trigger (default) |
| `left` | Left of the trigger |
| `right` | Right of the trigger |
| `top-start` | Above, aligned to start |
| `top-end` | Above, aligned to end |
| `bottom-start` | Below, aligned to start |
| `bottom-end` | Below, aligned to end |

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `open` | `boolean` | `false` | Whether the popover is open |
| `trigger` | `string` | `'click'` | Trigger: `click`, `hover`, `focus` |
| `placement` | `string` | `'bottom'` | Popover placement |
| `offset` | `number` | `8` | Distance from trigger |
| `arrow` | `boolean` | `true` | Show arrow |

## Slots

| Slot | Description |
|------|-------------|
| `trigger` | The trigger element |
| (default) | Popover content |

## CSS Parts

| Part | Description |
|------|-------------|
| `popover` | The popover container |
| `content` | The content wrapper |
| `arrow` | The arrow element |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `open` | - | Fired when popover opens |
| `close` | - | Fired when popover closes |

## Examples

### Basic

```html
<el-dm-popover>
  <button slot="trigger">Open Popover</button>
  <div>
    <h4>Popover Title</h4>
    <p>Some popover content here.</p>
  </div>
</el-dm-popover>
```

### Placements

```html
<el-dm-popover placement="top">
  <button slot="trigger">Top</button>
  <div>Top popover</div>
</el-dm-popover>

<el-dm-popover placement="right">
  <button slot="trigger">Right</button>
  <div>Right popover</div>
</el-dm-popover>
```

### Hover Trigger

```html
<el-dm-popover trigger="hover">
  <span slot="trigger">Hover me</span>
  <div>This appears on hover</div>
</el-dm-popover>
```

### Focus Trigger

```html
<el-dm-popover trigger="focus">
  <input slot="trigger" placeholder="Focus me" />
  <div>Help text appears on focus</div>
</el-dm-popover>
```

### No Arrow

```html
<el-dm-popover arrow="false">
  <button slot="trigger">No arrow</button>
  <div>Popover without arrow</div>
</el-dm-popover>
```

### Programmatic Control

```javascript
const popover = document.querySelector('el-dm-popover');

// Open
popover.open = true;

// Close
popover.open = false;
```

## License

MIT

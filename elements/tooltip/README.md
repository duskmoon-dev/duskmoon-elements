# @duskmoon-dev/el-tooltip

A hover tooltip component built with Web Components.

## Installation

```bash
bun add @duskmoon-dev/el-tooltip
```

## Usage

### Auto-Register

```typescript
import '@duskmoon-dev/el-tooltip/register';
```

```html
<el-dm-tooltip content="Helpful information">
  <button>Hover me</button>
</el-dm-tooltip>
```

### Manual Registration

```typescript
import { ElDmTooltip, register } from '@duskmoon-dev/el-tooltip';

// Register with default tag name
register();

// Or register with custom tag name
customElements.define('my-tooltip', ElDmTooltip);
```

## Positions

| Position | Description |
|----------|-------------|
| `top` | Above the element (default) |
| `bottom` | Below the element |
| `left` | Left of the element |
| `right` | Right of the element |

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `content` | `string` | `''` | Tooltip text |
| `position` | `string` | `'top'` | Position: `top`, `bottom`, `left`, `right` |
| `trigger` | `string` | `'hover'` | Trigger: `hover`, `click`, `focus` |
| `delay` | `number` | `0` | Show delay in ms |
| `arrow` | `boolean` | `true` | Show arrow |
| `disabled` | `boolean` | `false` | Disable the tooltip |

## CSS Parts

| Part | Description |
|------|-------------|
| `tooltip` | The tooltip container |
| `content` | The tooltip content |
| `arrow` | The arrow element |

## Examples

### Basic

```html
<el-dm-tooltip content="This is a tooltip">
  <button>Hover me</button>
</el-dm-tooltip>
```

### Positions

```html
<el-dm-tooltip content="Top tooltip" position="top">
  <button>Top</button>
</el-dm-tooltip>

<el-dm-tooltip content="Bottom tooltip" position="bottom">
  <button>Bottom</button>
</el-dm-tooltip>

<el-dm-tooltip content="Left tooltip" position="left">
  <button>Left</button>
</el-dm-tooltip>

<el-dm-tooltip content="Right tooltip" position="right">
  <button>Right</button>
</el-dm-tooltip>
```

### With Delay

```html
<el-dm-tooltip content="Delayed tooltip" delay="500">
  <button>Hover (500ms delay)</button>
</el-dm-tooltip>
```

### Click Trigger

```html
<el-dm-tooltip content="Click triggered" trigger="click">
  <button>Click me</button>
</el-dm-tooltip>
```

### No Arrow

```html
<el-dm-tooltip content="No arrow" arrow="false">
  <button>No arrow</button>
</el-dm-tooltip>
```

### On Icons

```html
<el-dm-tooltip content="Edit item">
  <button>✏️</button>
</el-dm-tooltip>

<el-dm-tooltip content="Delete item">
  <button>🗑️</button>
</el-dm-tooltip>
```

## License

MIT

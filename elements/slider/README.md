# @duskmoon-dev/el-slider

A customizable range slider component built with Web Components.

## Installation

```bash
bun add @duskmoon-dev/el-slider
```

## Usage

### Auto-Register

```typescript
import '@duskmoon-dev/el-slider/register';
```

```html
<el-dm-slider value="50" min="0" max="100"></el-dm-slider>
```

### Manual Registration

```typescript
import { ElDmSlider, register } from '@duskmoon-dev/el-slider';

// Register with default tag name
register();

// Or register with custom tag name
customElements.define('my-slider', ElDmSlider);
```

## Sizes

| Size | Description |
|------|-------------|
| `sm` | Small slider |
| `md` | Medium slider (default) |
| `lg` | Large slider |

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `value` | `number` | `0` | Current value |
| `min` | `number` | `0` | Minimum value |
| `max` | `number` | `100` | Maximum value |
| `step` | `number` | `1` | Step increment |
| `disabled` | `boolean` | `false` | Disable the slider |
| `size` | `string` | `'md'` | Size variant: `sm`, `md`, `lg` |
| `color` | `string` | `'primary'` | Color variant |
| `show-value` | `boolean` | `false` | Show current value |

## CSS Parts

| Part | Description |
|------|-------------|
| `slider` | The main slider container |
| `track` | The track/rail |
| `thumb` | The draggable thumb |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `change` | `{ value: number }` | Fired when value changes (on release) |
| `input` | `{ value: number }` | Fired during dragging |

## Examples

### Basic

```html
<el-dm-slider></el-dm-slider>
```

### With Range

```html
<el-dm-slider min="0" max="100" value="25"></el-dm-slider>
```

### With Step

```html
<el-dm-slider min="0" max="100" step="10"></el-dm-slider>
```

### Show Value

```html
<el-dm-slider show-value></el-dm-slider>
```

### Sizes

```html
<el-dm-slider size="sm"></el-dm-slider>
<el-dm-slider size="md"></el-dm-slider>
<el-dm-slider size="lg"></el-dm-slider>
```

### Disabled

```html
<el-dm-slider disabled value="50"></el-dm-slider>
```

## License

MIT

# @duskmoon-dev/el-progress

A progress bar component with various styles built with Web Components.

## Installation

```bash
bun add @duskmoon-dev/el-progress
```

## Usage

### Auto-Register

```typescript
import '@duskmoon-dev/el-progress/register';
```

```html
<el-dm-progress value="50"></el-dm-progress>
```

### Manual Registration

```typescript
import { ElDmProgress, register } from '@duskmoon-dev/el-progress';

// Register with default tag name
register();

// Or register with custom tag name
customElements.define('my-progress', ElDmProgress);
```

## Sizes

| Size | Description |
|------|-------------|
| `sm` | Small/thin progress bar |
| `md` | Medium progress bar (default) |
| `lg` | Large/thick progress bar |

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `value` | `number` | `0` | Current value |
| `max` | `number` | `100` | Maximum value |
| `color` | `string` | `'primary'` | Color variant |
| `size` | `string` | `'md'` | Size: `sm`, `md`, `lg` |
| `indeterminate` | `boolean` | `false` | Show indeterminate state |
| `striped` | `boolean` | `false` | Show striped pattern |
| `animated` | `boolean` | `false` | Animate the stripes |
| `show-value` | `boolean` | `false` | Show value text |

## CSS Parts

| Part | Description |
|------|-------------|
| `progress` | The progress container |
| `bar` | The progress bar fill |
| `value` | The value text |

## Examples

### Basic

```html
<el-dm-progress value="50"></el-dm-progress>
```

### With Value Display

```html
<el-dm-progress value="75" show-value></el-dm-progress>
```

### Colors

```html
<el-dm-progress value="50" color="primary"></el-dm-progress>
<el-dm-progress value="50" color="success"></el-dm-progress>
<el-dm-progress value="50" color="warning"></el-dm-progress>
<el-dm-progress value="50" color="error"></el-dm-progress>
```

### Sizes

```html
<el-dm-progress value="50" size="sm"></el-dm-progress>
<el-dm-progress value="50" size="md"></el-dm-progress>
<el-dm-progress value="50" size="lg"></el-dm-progress>
```

### Indeterminate

```html
<el-dm-progress indeterminate></el-dm-progress>
```

### Striped

```html
<el-dm-progress value="50" striped></el-dm-progress>
```

### Animated Stripes

```html
<el-dm-progress value="50" striped animated></el-dm-progress>
```

### Dynamic Update

```javascript
const progress = document.querySelector('el-dm-progress');
let value = 0;
const interval = setInterval(() => {
  value += 10;
  progress.value = value;
  if (value >= 100) clearInterval(interval);
}, 500);
```

## License

MIT

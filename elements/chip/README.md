# @duskmoon-dev/el-chip

A chip/tag component built with Web Components.

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

## Variants

| Variant | Description |
|---------|-------------|
| `filled` | Filled background (default) |
| `outlined` | Outlined style |
| `soft` | Soft/subtle background |

## Sizes

| Size | Description |
|------|-------------|
| `sm` | Small chip |
| `md` | Medium chip (default) |
| `lg` | Large chip |

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `variant` | `string` | `'filled'` | Style variant |
| `color` | `string` | `'primary'` | Color variant |
| `size` | `string` | `'md'` | Size: `sm`, `md`, `lg` |
| `deletable` | `boolean` | `false` | Show delete button |
| `selected` | `boolean` | `false` | Selected state |
| `disabled` | `boolean` | `false` | Disabled state |

## Slots

| Slot | Description |
|------|-------------|
| (default) | Chip label |
| `icon` | Icon before label |

## CSS Parts

| Part | Description |
|------|-------------|
| `chip` | The chip element |
| `icon` | The icon container |
| `delete` | The delete button |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `delete` | - | Fired when delete button is clicked |
| `click` | - | Fired when chip is clicked |

## Examples

### Basic

```html
<el-dm-chip>Default</el-dm-chip>
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
<el-dm-chip deletable>Removable</el-dm-chip>
```

### Selected

```html
<el-dm-chip selected>Selected</el-dm-chip>
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
chip.addEventListener('delete', () => {
  chip.remove();
});
```

## License

MIT

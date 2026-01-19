# @duskmoon-dev/el-badge

A badge component for status indicators and counters built with Web Components.

## Installation

```bash
bun add @duskmoon-dev/el-badge
```

## Usage

### Auto-Register

```typescript
import '@duskmoon-dev/el-badge/register';
```

```html
<el-dm-badge variant="success">Active</el-dm-badge>
```

### Manual Registration

```typescript
import { ElDmBadge, register } from '@duskmoon-dev/el-badge';

// Register with default tag name
register();

// Or register with custom tag name
customElements.define('my-badge', ElDmBadge);
```

## Variants

| Variant | Description |
|---------|-------------|
| `primary` | Primary color (default) |
| `secondary` | Secondary color |
| `success` | Success/green |
| `warning` | Warning/yellow |
| `error` | Error/red |
| `info` | Info/blue |

## Sizes

| Size | Description |
|------|-------------|
| `sm` | Small badge |
| `md` | Medium badge (default) |
| `lg` | Large badge |

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `variant` | `string` | `'primary'` | Color variant |
| `color` | `string` | - | Custom color |
| `size` | `string` | `'md'` | Size: `sm`, `md`, `lg` |
| `pill` | `boolean` | `false` | Fully rounded pill shape |
| `dot` | `boolean` | `false` | Display as dot indicator |

## CSS Parts

| Part | Description |
|------|-------------|
| `badge` | The badge element |

## Examples

### Basic Variants

```html
<el-dm-badge variant="primary">Primary</el-dm-badge>
<el-dm-badge variant="secondary">Secondary</el-dm-badge>
<el-dm-badge variant="success">Success</el-dm-badge>
<el-dm-badge variant="warning">Warning</el-dm-badge>
<el-dm-badge variant="error">Error</el-dm-badge>
<el-dm-badge variant="info">Info</el-dm-badge>
```

### Sizes

```html
<el-dm-badge size="sm">Small</el-dm-badge>
<el-dm-badge size="md">Medium</el-dm-badge>
<el-dm-badge size="lg">Large</el-dm-badge>
```

### Pill Shape

```html
<el-dm-badge pill>Pill Badge</el-dm-badge>
```

### Dot Indicator

```html
<el-dm-badge dot variant="success"></el-dm-badge>
<el-dm-badge dot variant="error"></el-dm-badge>
```

### With Numbers

```html
<el-dm-badge variant="error">5</el-dm-badge>
<el-dm-badge variant="primary">99+</el-dm-badge>
```

### Status Indicators

```html
<span>Online <el-dm-badge dot variant="success"></el-dm-badge></span>
<span>Offline <el-dm-badge dot variant="error"></el-dm-badge></span>
<span>Away <el-dm-badge dot variant="warning"></el-dm-badge></span>
```

## License

MIT

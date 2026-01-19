# @duskmoon-dev/el-alert

A customizable alert component for displaying messages built with Web Components.

## Installation

```bash
bun add @duskmoon-dev/el-alert
```

## Usage

### Auto-Register

```typescript
import '@duskmoon-dev/el-alert/register';
```

```html
<el-dm-alert type="success">Operation completed successfully!</el-dm-alert>
```

### Manual Registration

```typescript
import { ElDmAlert, register } from '@duskmoon-dev/el-alert';

// Register with default tag name
register();

// Or register with custom tag name
customElements.define('my-alert', ElDmAlert);
```

## Types

| Type | Description |
|------|-------------|
| `info` | Informational message (default) |
| `success` | Success message |
| `warning` | Warning message |
| `error` | Error message |

## Variants

| Variant | Description |
|---------|-------------|
| `filled` | Filled background (default) |
| `outlined` | Outlined style |
| `soft` | Soft/subtle background |

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | `string` | `'info'` | Alert type: `info`, `success`, `warning`, `error` |
| `variant` | `string` | `'filled'` | Style variant: `filled`, `outlined`, `soft` |
| `dismissible` | `boolean` | `false` | Show dismiss button |
| `compact` | `boolean` | `false` | Compact display mode |
| `title` | `string` | `''` | Alert title |

## Slots

| Slot | Description |
|------|-------------|
| (default) | Alert content |
| `icon` | Custom icon |
| `actions` | Action buttons |

## CSS Parts

| Part | Description |
|------|-------------|
| `alert` | The main alert container |
| `icon` | The icon container |
| `content` | The content wrapper |
| `title` | The title element |
| `close` | The close button |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `dismiss` | - | Fired when alert is dismissed |

## Examples

### Basic Types

```html
<el-dm-alert type="info">This is an info alert.</el-dm-alert>
<el-dm-alert type="success">This is a success alert.</el-dm-alert>
<el-dm-alert type="warning">This is a warning alert.</el-dm-alert>
<el-dm-alert type="error">This is an error alert.</el-dm-alert>
```

### With Title

```html
<el-dm-alert type="success" title="Success!">
  Your changes have been saved.
</el-dm-alert>
```

### Dismissible

```html
<el-dm-alert type="info" dismissible>
  Click the X to dismiss this alert.
</el-dm-alert>
```

### Variants

```html
<el-dm-alert type="info" variant="filled">Filled</el-dm-alert>
<el-dm-alert type="info" variant="outlined">Outlined</el-dm-alert>
<el-dm-alert type="info" variant="soft">Soft</el-dm-alert>
```

### Compact

```html
<el-dm-alert type="info" compact>Compact alert</el-dm-alert>
```

### With Actions

```html
<el-dm-alert type="warning" dismissible>
  Your session is about to expire.
  <div slot="actions">
    <el-dm-button size="sm">Extend</el-dm-button>
  </div>
</el-dm-alert>
```

## License

MIT

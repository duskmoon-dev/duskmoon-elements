# @duskmoon-dev/el-switch

A customizable toggle switch component built with Web Components.

## Installation

```bash
bun add @duskmoon-dev/el-switch
```

## Usage

### Auto-Register

```typescript
import '@duskmoon-dev/el-switch/register';
```

```html
<el-dm-switch label="Enable notifications"></el-dm-switch>
```

### Manual Registration

```typescript
import { ElDmSwitch, register } from '@duskmoon-dev/el-switch';

// Register with default tag name
register();

// Or register with custom tag name
customElements.define('my-switch', ElDmSwitch);
```

## Sizes

| Size | Description |
|------|-------------|
| `sm` | Small switch |
| `md` | Medium switch (default) |
| `lg` | Large switch |

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `value` | `boolean` | `false` | Whether the switch is on |
| `disabled` | `boolean` | `false` | Disable the switch |
| `size` | `string` | `'md'` | Size variant: `sm`, `md`, `lg` |
| `color` | `string` | `'primary'` | Color variant |
| `label` | `string` | `''` | Label text |
| `label-position` | `string` | `'end'` | Label position: `start`, `end` |
| `name` | `string` | `''` | Form field name |

## CSS Parts

| Part | Description |
|------|-------------|
| `switch` | The main switch container |
| `track` | The track/background |
| `thumb` | The thumb/knob |
| `label` | The label element |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `change` | `{ value: boolean }` | Fired when value changes |
| `input` | `{ value: boolean }` | Fired during interaction |

## Examples

### Basic

```html
<el-dm-switch></el-dm-switch>
```

### With Label

```html
<el-dm-switch label="Dark mode"></el-dm-switch>
<el-dm-switch label="Notifications" label-position="start"></el-dm-switch>
```

### Sizes

```html
<el-dm-switch size="sm"></el-dm-switch>
<el-dm-switch size="md"></el-dm-switch>
<el-dm-switch size="lg"></el-dm-switch>
```

### Disabled

```html
<el-dm-switch disabled></el-dm-switch>
<el-dm-switch disabled value></el-dm-switch>
```

## License

MIT

# @duskmoon-dev/el-datepicker

A date picker component with calendar popup built with Web Components.

## Installation

```bash
bun add @duskmoon-dev/el-datepicker
```

## Usage

### Auto-Register

```typescript
import '@duskmoon-dev/el-datepicker/register';
```

```html
<el-dm-datepicker placeholder="Select date"></el-dm-datepicker>
```

### Manual Registration

```typescript
import { ElDmDatepicker, register } from '@duskmoon-dev/el-datepicker';

// Register with default tag name
register();

// Or register with custom tag name
customElements.define('my-datepicker', ElDmDatepicker);
```

## Sizes

| Size | Description |
|------|-------------|
| `sm` | Small datepicker |
| `md` | Medium datepicker (default) |
| `lg` | Large datepicker |

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `value` | `string` | `''` | Selected date (ISO format) |
| `placeholder` | `string` | `''` | Placeholder text |
| `disabled` | `boolean` | `false` | Disable the picker |
| `format` | `string` | `'YYYY-MM-DD'` | Display format |
| `min-date` | `string` | - | Minimum selectable date |
| `max-date` | `string` | - | Maximum selectable date |
| `range` | `boolean` | `false` | Enable date range selection |
| `show-time` | `boolean` | `false` | Include time selection |
| `size` | `string` | `'md'` | Size variant: `sm`, `md`, `lg` |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `change` | `{ value }` | Fired when date changes |
| `open` | - | Fired when calendar opens |
| `close` | - | Fired when calendar closes |

## Examples

### Basic

```html
<el-dm-datepicker></el-dm-datepicker>
```

### With Placeholder

```html
<el-dm-datepicker placeholder="Select a date"></el-dm-datepicker>
```

### Date Range

```html
<el-dm-datepicker range placeholder="Select date range"></el-dm-datepicker>
```

### With Time

```html
<el-dm-datepicker show-time></el-dm-datepicker>
```

### Min/Max Dates

```html
<el-dm-datepicker min-date="2024-01-01" max-date="2024-12-31"></el-dm-datepicker>
```

### Custom Format

```html
<el-dm-datepicker format="MM/DD/YYYY"></el-dm-datepicker>
```

### Sizes

```html
<el-dm-datepicker size="sm"></el-dm-datepicker>
<el-dm-datepicker size="md"></el-dm-datepicker>
<el-dm-datepicker size="lg"></el-dm-datepicker>
```

## License

MIT

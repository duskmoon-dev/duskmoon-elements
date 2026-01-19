# @duskmoon-dev/el-autocomplete

An input component with autocomplete suggestions built with Web Components.

## Installation

```bash
bun add @duskmoon-dev/el-autocomplete
```

## Usage

### Auto-Register

```typescript
import '@duskmoon-dev/el-autocomplete/register';
```

```html
<el-dm-autocomplete placeholder="Search..."></el-dm-autocomplete>
```

### Manual Registration

```typescript
import { ElDmAutocomplete, register } from '@duskmoon-dev/el-autocomplete';

// Register with default tag name
register();

// Or register with custom tag name
customElements.define('my-autocomplete', ElDmAutocomplete);
```

### Setting Options via JavaScript

```javascript
const autocomplete = document.querySelector('el-dm-autocomplete');
autocomplete.options = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];
```

## Sizes

| Size | Description |
|------|-------------|
| `sm` | Small input |
| `md` | Medium input (default) |
| `lg` | Large input |

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `value` | `string` | `''` | Current value |
| `placeholder` | `string` | `''` | Placeholder text |
| `disabled` | `boolean` | `false` | Disable the input |
| `multiple` | `boolean` | `false` | Allow multiple selections |
| `clearable` | `boolean` | `false` | Show clear button |
| `size` | `string` | `'md'` | Size variant: `sm`, `md`, `lg` |
| `loading` | `boolean` | `false` | Show loading state |
| `no-results-text` | `string` | `'No results'` | Text when no results |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `change` | `{ value }` | Fired when value changes |
| `input` | `{ value }` | Fired during typing |
| `clear` | - | Fired when cleared |

## Examples

### Basic

```html
<el-dm-autocomplete placeholder="Search fruits..."></el-dm-autocomplete>
<script>
  const ac = document.querySelector('el-dm-autocomplete');
  ac.options = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
  ];
</script>
```

### Clearable

```html
<el-dm-autocomplete clearable></el-dm-autocomplete>
```

### Multiple Selection

```html
<el-dm-autocomplete multiple></el-dm-autocomplete>
```

### Custom No Results Text

```html
<el-dm-autocomplete no-results-text="Nothing found"></el-dm-autocomplete>
```

### With Loading State

```javascript
const ac = document.querySelector('el-dm-autocomplete');
ac.addEventListener('input', async (e) => {
  ac.loading = true;
  const results = await fetchSuggestions(e.detail.value);
  ac.options = results;
  ac.loading = false;
});
```

## License

MIT

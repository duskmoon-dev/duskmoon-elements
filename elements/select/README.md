# @duskmoon-dev/el-select

A unified select component with single, multi-select, and tree-select modes.

## Installation

```bash
npm install @duskmoon-dev/el-select
```

## Usage

```javascript
// Auto-register the element
import '@duskmoon-dev/el-select/register';

// Or manually register
import { register } from '@duskmoon-dev/el-select';
register();
```

```html
<el-dm-select placeholder="Select a fruit..."></el-dm-select>
```

## Features

- **Single Select**: Basic dropdown selection
- **Multi-Select**: Tag-based multiple selection
- **Tree Select**: Hierarchical data selection with expand/collapse
- **Searchable**: Filter options by typing
- **Clearable**: Clear selection with a button
- **Cascade Mode**: Auto-select children when parent selected
- **Keyboard Navigation**: Full keyboard support

## Setting Options

```javascript
const select = document.querySelector('el-dm-select');

// Flat options
select.setOptions([
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' }
]);

// Grouped options
select.setOptions([
  { value: 'js', label: 'JavaScript', group: 'Frontend' },
  { value: 'py', label: 'Python', group: 'Backend' }
]);

// Tree options
select.setTreeOptions([
  {
    value: 'frontend',
    label: 'Frontend',
    children: [
      { value: 'react', label: 'React' },
      { value: 'vue', label: 'Vue' }
    ]
  }
]);
```

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | `string` | `''` | Selected value(s) |
| `placeholder` | `string` | `''` | Placeholder text |
| `disabled` | `boolean` | `false` | Disable the select |
| `multiple` | `boolean` | `false` | Enable multi-select |
| `tree-data` | `boolean` | `false` | Enable tree mode |
| `searchable` | `boolean` | `false` | Enable search |
| `clearable` | `boolean` | `false` | Show clear button |
| `cascade` | `boolean` | `false` | Cascade selection (tree mode) |
| `check-strictly` | `boolean` | `false` | Independent selection (tree mode) |
| `max-tag-count` | `number` | `-1` | Max visible tags |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `change` | `{ value, selectedOptions }` | Selection changed |
| `search` | `{ searchValue }` | Search text changed |
| `clear` | `{ previousValue }` | Selection cleared |
| `expand` | `{ node, expanded }` | Tree node toggled |

## License

MIT

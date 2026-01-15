# @duskmoon-dev/el-cascader

A multi-panel cascading selection component for hierarchical data.

## Installation

```bash
npm install @duskmoon-dev/el-cascader
```

## Usage

```javascript
// Auto-register the element
import '@duskmoon-dev/el-cascader/register';

// Or manually register
import { register } from '@duskmoon-dev/el-cascader';
register();
```

```html
<el-dm-cascader placeholder="Select location..."></el-dm-cascader>
```

## Features

- **Multi-Panel Layout**: Visual hierarchy with side-by-side panels
- **Click or Hover Expand**: Choose how panels expand
- **Multiple Selection**: Select multiple paths
- **Searchable**: Filter through all levels
- **Async Loading**: Load children on demand
- **Clearable**: Clear selection with a button
- **Keyboard Navigation**: Full keyboard support

## Setting Options

```javascript
const cascader = document.querySelector('el-dm-cascader');

cascader.setOptions([
  {
    value: 'usa',
    label: 'United States',
    children: [
      {
        value: 'california',
        label: 'California',
        children: [
          { value: 'sf', label: 'San Francisco' },
          { value: 'la', label: 'Los Angeles' }
        ]
      }
    ]
  }
]);
```

## Async Loading

```javascript
// Set initial options with leaf: false
cascader.setOptions([
  { value: 'category1', label: 'Category 1', leaf: false }
]);

// Set async loader
cascader.setLoadData(async (option) => {
  const response = await fetch(`/api/children/${option.value}`);
  return response.json();
});
```

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | `string` | `''` | Selected path (JSON array) |
| `placeholder` | `string` | `''` | Placeholder text |
| `disabled` | `boolean` | `false` | Disable the cascader |
| `multiple` | `boolean` | `false` | Enable multi-select |
| `searchable` | `boolean` | `false` | Enable search |
| `clearable` | `boolean` | `false` | Show clear button |
| `change-on-select` | `boolean` | `false` | Allow non-leaf selection |
| `expand-trigger` | `'click' \| 'hover'` | `'click'` | Panel expand trigger |
| `separator` | `string` | `' / '` | Display path separator |
| `show-all-levels` | `boolean` | `true` | Show full path or leaf only |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `change` | `{ value, selectedOptions, path }` | Selection changed |
| `expand` | `{ option, level }` | Panel expanded |
| `search` | `{ searchValue }` | Search text changed |

## License

MIT

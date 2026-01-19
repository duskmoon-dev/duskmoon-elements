# @duskmoon-dev/el-pagination

A pagination component built with Web Components.

## Installation

```bash
bun add @duskmoon-dev/el-pagination
```

## Usage

### Auto-Register

```typescript
import '@duskmoon-dev/el-pagination/register';
```

```html
<el-dm-pagination total="100" current="1"></el-dm-pagination>
```

### Manual Registration

```typescript
import { ElDmPagination, register } from '@duskmoon-dev/el-pagination';

// Register with default tag name
register();

// Or register with custom tag name
customElements.define('my-pagination', ElDmPagination);
```

## Sizes

| Size | Description |
|------|-------------|
| `sm` | Small pagination |
| `md` | Medium pagination (default) |
| `lg` | Large pagination |

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `total` | `number` | `0` | Total number of pages |
| `current` | `number` | `1` | Current page number |
| `siblings` | `number` | `1` | Pages shown on each side of current |
| `boundaries` | `number` | `1` | Pages shown at start/end |
| `size` | `string` | `'md'` | Size: `sm`, `md`, `lg` |
| `color` | `string` | `'primary'` | Color variant |

## CSS Parts

| Part | Description |
|------|-------------|
| `container` | The pagination container |
| `button` | All page buttons |
| `page` | Page number buttons |
| `ellipsis` | The ellipsis element |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `change` | `{ page }` | Fired when page changes |

## Examples

### Basic

```html
<el-dm-pagination total="10" current="1"></el-dm-pagination>
```

### Many Pages

```html
<el-dm-pagination total="100" current="50"></el-dm-pagination>
```

### Custom Siblings

```html
<el-dm-pagination total="20" siblings="2"></el-dm-pagination>
```

### Custom Boundaries

```html
<el-dm-pagination total="20" boundaries="2"></el-dm-pagination>
```

### Sizes

```html
<el-dm-pagination total="10" size="sm"></el-dm-pagination>
<el-dm-pagination total="10" size="md"></el-dm-pagination>
<el-dm-pagination total="10" size="lg"></el-dm-pagination>
```

### Handling Page Change

```javascript
const pagination = document.querySelector('el-dm-pagination');
pagination.addEventListener('change', (e) => {
  console.log('Page changed to:', e.detail.page);
  // Fetch data for the new page
  fetchData(e.detail.page);
});
```

### With Data Table

```html
<el-dm-table id="table"></el-dm-table>
<el-dm-pagination id="pagination" total="10"></el-dm-pagination>

<script>
  const table = document.querySelector('#table');
  const pagination = document.querySelector('#pagination');

  pagination.addEventListener('change', async (e) => {
    const data = await fetchPageData(e.detail.page);
    table.data = data;
  });
</script>
```

## License

MIT

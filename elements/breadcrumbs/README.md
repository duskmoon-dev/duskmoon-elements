# @duskmoon-dev/el-breadcrumbs

A breadcrumb navigation component built with Web Components.

## Installation

```bash
bun add @duskmoon-dev/el-breadcrumbs
```

## Usage

### Auto-Register

```typescript
import '@duskmoon-dev/el-breadcrumbs/register';
```

```html
<el-dm-breadcrumbs></el-dm-breadcrumbs>
```

### Manual Registration

```typescript
import { ElDmBreadcrumbs, register } from '@duskmoon-dev/el-breadcrumbs';

// Register with default tag name
register();

// Or register with custom tag name
customElements.define('my-breadcrumbs', ElDmBreadcrumbs);
```

### Setting Items via JavaScript

```javascript
const breadcrumbs = document.querySelector('el-dm-breadcrumbs');
breadcrumbs.items = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Category', href: '/products/category' },
  { label: 'Current Page' }, // No href = current page
];
```

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `separator` | `string` | `'/'` | Separator character |

## Slots

| Slot | Description |
|------|-------------|
| `separator` | Custom separator element |

## CSS Parts

| Part | Description |
|------|-------------|
| `nav` | The nav element |
| `list` | The ordered list |
| `item` | Each breadcrumb item |
| `link` | The link elements |
| `current` | The current (last) item |
| `separator` | The separator elements |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `navigate` | `{ item, index }` | Fired when a breadcrumb is clicked |

## Examples

### Basic

```html
<el-dm-breadcrumbs id="crumbs"></el-dm-breadcrumbs>
<script>
  document.querySelector('#crumbs').items = [
    { label: 'Home', href: '/' },
    { label: 'Library', href: '/library' },
    { label: 'Data' },
  ];
</script>
```

### Custom Separator

```html
<el-dm-breadcrumbs separator=">"></el-dm-breadcrumbs>
<el-dm-breadcrumbs separator="→"></el-dm-breadcrumbs>
<el-dm-breadcrumbs separator="|"></el-dm-breadcrumbs>
```

### Custom Separator Element

```html
<el-dm-breadcrumbs>
  <span slot="separator">›</span>
</el-dm-breadcrumbs>
```

### Handling Navigation

```javascript
const breadcrumbs = document.querySelector('el-dm-breadcrumbs');
breadcrumbs.addEventListener('navigate', (e) => {
  e.preventDefault();
  console.log('Navigate to:', e.detail.item.href);
  // Handle navigation (e.g., with router)
});
```

### Dynamic Updates

```javascript
// Update breadcrumbs based on route
function updateBreadcrumbs(path) {
  const parts = path.split('/').filter(Boolean);
  const items = [{ label: 'Home', href: '/' }];

  let href = '';
  parts.forEach((part, index) => {
    href += `/${part}`;
    items.push({
      label: part.charAt(0).toUpperCase() + part.slice(1),
      href: index === parts.length - 1 ? undefined : href,
    });
  });

  document.querySelector('el-dm-breadcrumbs').items = items;
}
```

## License

MIT

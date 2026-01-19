# @duskmoon-dev/el-bottom-navigation

A mobile bottom navigation component built with Web Components.

## Installation

```bash
bun add @duskmoon-dev/el-bottom-navigation
```

## Usage

### Auto-Register

```typescript
import '@duskmoon-dev/el-bottom-navigation/register';
```

```html
<el-dm-bottom-navigation value="home"></el-dm-bottom-navigation>
```

### Manual Registration

```typescript
import { ElDmBottomNavigation, register } from '@duskmoon-dev/el-bottom-navigation';

// Register with default tag name
register();

// Or register with custom tag name
customElements.define('my-bottom-nav', ElDmBottomNavigation);
```

### Setting Items via JavaScript

```javascript
const nav = document.querySelector('el-dm-bottom-navigation');
nav.items = [
  { value: 'home', label: 'Home', icon: '🏠' },
  { value: 'search', label: 'Search', icon: '🔍' },
  { value: 'favorites', label: 'Favorites', icon: '⭐' },
  { value: 'profile', label: 'Profile', icon: '👤' },
];
```

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `value` | `string` | - | Currently selected item value |
| `color` | `string` | `'primary'` | Color variant |

## CSS Parts

| Part | Description |
|------|-------------|
| `container` | The navigation container |
| `item` | Each navigation item |
| `icon` | The item icon |
| `label` | The item label |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `change` | `{ value, item }` | Fired when selection changes |

## Examples

### Basic

```html
<el-dm-bottom-navigation id="nav" value="home"></el-dm-bottom-navigation>
<script>
  document.querySelector('#nav').items = [
    { value: 'home', label: 'Home', icon: '🏠' },
    { value: 'explore', label: 'Explore', icon: '🧭' },
    { value: 'cart', label: 'Cart', icon: '🛒' },
    { value: 'account', label: 'Account', icon: '👤' },
  ];
</script>
```

### With SVG Icons

```javascript
nav.items = [
  {
    value: 'home',
    label: 'Home',
    icon: '<svg>...</svg>'
  },
  // ...
];
```

### Handling Selection

```javascript
const nav = document.querySelector('el-dm-bottom-navigation');
nav.addEventListener('change', (e) => {
  console.log('Selected:', e.detail.value);
  // Navigate to the selected section
  navigateTo(e.detail.value);
});
```

### With Badge

```javascript
nav.items = [
  { value: 'home', label: 'Home', icon: '🏠' },
  { value: 'notifications', label: 'Notifications', icon: '🔔', badge: 5 },
  { value: 'messages', label: 'Messages', icon: '💬', badge: 'new' },
];
```

### Fixed to Bottom

```css
el-dm-bottom-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
}
```

## License

MIT

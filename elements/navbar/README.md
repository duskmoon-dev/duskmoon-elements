# @duskmoon-dev/el-navbar

A navigation bar component built with Web Components.

## Installation

```bash
bun add @duskmoon-dev/el-navbar
```

## Usage

### Auto-Register

```typescript
import '@duskmoon-dev/el-navbar/register';
```

```html
<el-dm-navbar>
  <a slot="start" href="/">Logo</a>
  <nav>
    <a href="/about">About</a>
    <a href="/contact">Contact</a>
  </nav>
  <div slot="end">
    <el-dm-button>Sign In</el-dm-button>
  </div>
</el-dm-navbar>
```

### Manual Registration

```typescript
import { ElDmNavbar, register } from '@duskmoon-dev/el-navbar';

// Register with default tag name
register();

// Or register with custom tag name
customElements.define('my-navbar', ElDmNavbar);
```

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `fixed` | `boolean` | `false` | Fix navbar to top of viewport |
| `elevated` | `boolean` | `false` | Add shadow/elevation |
| `color` | `string` | - | Background color variant |

## Slots

| Slot | Description |
|------|-------------|
| `start` | Left side content (logo) |
| (default) | Center content (navigation) |
| `end` | Right side content (actions) |

## CSS Parts

| Part | Description |
|------|-------------|
| `navbar` | The navbar container |
| `content` | The content wrapper |
| `start` | The start section |
| `center` | The center section |
| `end` | The end section |
| `hamburger` | The mobile menu button |
| `mobile-menu` | The mobile menu container |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `menu-toggle` | `{ open }` | Fired when mobile menu toggles |

## Examples

### Basic

```html
<el-dm-navbar>
  <a slot="start" href="/">Brand</a>
  <nav>
    <a href="/home">Home</a>
    <a href="/about">About</a>
    <a href="/services">Services</a>
  </nav>
  <div slot="end">
    <el-dm-button variant="primary">Get Started</el-dm-button>
  </div>
</el-dm-navbar>
```

### Fixed Position

```html
<el-dm-navbar fixed elevated>
  ...
</el-dm-navbar>
```

### With Elevation

```html
<el-dm-navbar elevated>
  ...
</el-dm-navbar>
```

### Custom Color

```html
<el-dm-navbar color="primary">
  ...
</el-dm-navbar>
```

### Responsive Navigation

```html
<el-dm-navbar>
  <a slot="start" href="/">Logo</a>
  <nav>
    <a href="/home">Home</a>
    <a href="/about">About</a>
  </nav>
  <div slot="end">
    <el-dm-button>Login</el-dm-button>
  </div>
</el-dm-navbar>

<script>
  const navbar = document.querySelector('el-dm-navbar');
  navbar.addEventListener('menu-toggle', (e) => {
    console.log('Menu open:', e.detail.open);
  });
</script>
```

## License

MIT

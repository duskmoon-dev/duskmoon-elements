# @duskmoon-dev/el-tabs

A tabbed interface component built with Web Components.

## Installation

```bash
bun add @duskmoon-dev/el-tabs
```

## Usage

### Auto-Register

```typescript
import '@duskmoon-dev/el-tabs/register';
```

```html
<el-dm-tabs>
  <el-dm-tab label="Tab 1">Content for tab 1</el-dm-tab>
  <el-dm-tab label="Tab 2">Content for tab 2</el-dm-tab>
  <el-dm-tab label="Tab 3">Content for tab 3</el-dm-tab>
</el-dm-tabs>
```

### Manual Registration

```typescript
import { ElDmTabs, ElDmTab, register } from '@duskmoon-dev/el-tabs';

// Register with default tag names
register();

// Or register with custom tag names
customElements.define('my-tabs', ElDmTabs);
customElements.define('my-tab', ElDmTab);
```

## Variants

| Variant | Description |
|---------|-------------|
| `default` | Default style |
| `pills` | Pill-shaped tabs |
| `underline` | Underlined tabs |

## Orientations

| Orientation | Description |
|-------------|-------------|
| `horizontal` | Horizontal tabs (default) |
| `vertical` | Vertical tabs |

## Attributes (el-dm-tabs)

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `value` | `string` | - | Active tab value |
| `variant` | `string` | `'default'` | Style variant |
| `color` | `string` | `'primary'` | Color variant |
| `orientation` | `string` | `'horizontal'` | Tab orientation |

## Attributes (el-dm-tab)

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `label` | `string` | `''` | Tab label |
| `value` | `string` | - | Tab value (auto-generated if not set) |
| `disabled` | `boolean` | `false` | Disable the tab |

## CSS Parts (el-dm-tabs)

| Part | Description |
|------|-------------|
| `tablist` | The tab list container |
| `indicator` | The active tab indicator |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `change` | `{ value, index }` | Fired when active tab changes |

## Examples

### Basic

```html
<el-dm-tabs>
  <el-dm-tab label="Overview">Overview content</el-dm-tab>
  <el-dm-tab label="Details">Details content</el-dm-tab>
  <el-dm-tab label="Settings">Settings content</el-dm-tab>
</el-dm-tabs>
```

### Pills Variant

```html
<el-dm-tabs variant="pills">
  <el-dm-tab label="Tab 1">Content 1</el-dm-tab>
  <el-dm-tab label="Tab 2">Content 2</el-dm-tab>
</el-dm-tabs>
```

### Underline Variant

```html
<el-dm-tabs variant="underline">
  <el-dm-tab label="Tab 1">Content 1</el-dm-tab>
  <el-dm-tab label="Tab 2">Content 2</el-dm-tab>
</el-dm-tabs>
```

### Vertical Orientation

```html
<el-dm-tabs orientation="vertical">
  <el-dm-tab label="Tab 1">Content 1</el-dm-tab>
  <el-dm-tab label="Tab 2">Content 2</el-dm-tab>
  <el-dm-tab label="Tab 3">Content 3</el-dm-tab>
</el-dm-tabs>
```

### Disabled Tab

```html
<el-dm-tabs>
  <el-dm-tab label="Active">Active content</el-dm-tab>
  <el-dm-tab label="Disabled" disabled>Disabled content</el-dm-tab>
</el-dm-tabs>
```

### Controlled Value

```html
<el-dm-tabs value="settings">
  <el-dm-tab label="Home" value="home">Home content</el-dm-tab>
  <el-dm-tab label="Settings" value="settings">Settings content</el-dm-tab>
</el-dm-tabs>
```

## License

MIT

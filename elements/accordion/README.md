# @duskmoon-dev/el-accordion

A collapsible accordion component built with Web Components.

## Installation

```bash
bun add @duskmoon-dev/el-accordion
```

## Usage

### Auto-Register

```typescript
import '@duskmoon-dev/el-accordion/register';
```

```html
<el-dm-accordion>
  <el-dm-accordion-item label="Section 1">
    Content for section 1
  </el-dm-accordion-item>
  <el-dm-accordion-item label="Section 2">
    Content for section 2
  </el-dm-accordion-item>
</el-dm-accordion>
```

### Manual Registration

```typescript
import { ElDmAccordion, ElDmAccordionItem, register } from '@duskmoon-dev/el-accordion';

// Register with default tag names
register();

// Or register with custom tag names
customElements.define('my-accordion', ElDmAccordion);
customElements.define('my-accordion-item', ElDmAccordionItem);
```

## Attributes (el-dm-accordion)

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `multiple` | `boolean` | `false` | Allow multiple items open |
| `value` | `string` | - | Currently open item(s) |

## Attributes (el-dm-accordion-item)

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `label` | `string` | `''` | Item header label |
| `value` | `string` | - | Item value (auto-generated if not set) |
| `disabled` | `boolean` | `false` | Disable the item |
| `open` | `boolean` | `false` | Whether the item is open |

## CSS Parts (el-dm-accordion)

| Part | Description |
|------|-------------|
| `container` | The accordion container |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `change` | `{ value, openItems }` | Fired when open items change |

## Examples

### Basic

```html
<el-dm-accordion>
  <el-dm-accordion-item label="What is this?">
    This is an accordion component.
  </el-dm-accordion-item>
  <el-dm-accordion-item label="How does it work?">
    Click on the headers to expand/collapse.
  </el-dm-accordion-item>
</el-dm-accordion>
```

### Multiple Open

```html
<el-dm-accordion multiple>
  <el-dm-accordion-item label="Section 1">Content 1</el-dm-accordion-item>
  <el-dm-accordion-item label="Section 2">Content 2</el-dm-accordion-item>
  <el-dm-accordion-item label="Section 3">Content 3</el-dm-accordion-item>
</el-dm-accordion>
```

### Default Open

```html
<el-dm-accordion>
  <el-dm-accordion-item label="Open by default" open>
    This section is open by default.
  </el-dm-accordion-item>
  <el-dm-accordion-item label="Closed">
    This section is closed.
  </el-dm-accordion-item>
</el-dm-accordion>
```

### Disabled Item

```html
<el-dm-accordion>
  <el-dm-accordion-item label="Normal">Content</el-dm-accordion-item>
  <el-dm-accordion-item label="Disabled" disabled>
    Can't open this
  </el-dm-accordion-item>
</el-dm-accordion>
```

### FAQ Example

```html
<el-dm-accordion>
  <el-dm-accordion-item label="How do I get started?">
    Install the package and import the component.
  </el-dm-accordion-item>
  <el-dm-accordion-item label="Is it accessible?">
    Yes, it follows ARIA accordion patterns.
  </el-dm-accordion-item>
  <el-dm-accordion-item label="Can I style it?">
    Yes, use CSS custom properties and parts.
  </el-dm-accordion-item>
</el-dm-accordion>
```

## License

MIT

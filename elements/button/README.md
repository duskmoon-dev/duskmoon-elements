# @duskmoon-dev/el-button

A customizable button component for DuskMoon Elements.
ok,

## Installation

```bash
bun add @duskmoon-dev/el-button
```

## Usage

### Auto-Register (Recommended)

The simplest way to use the component - just import and it's ready:

```html
<!-- Via CDN -->
<script type="module" src="https://esm.sh/@duskmoon-dev/el-button/register"></script>

<!-- Now use the element -->
<el-dm-button>Click me</el-dm-button>
<el-dm-button variant="secondary">Secondary</el-dm-button>
<el-dm-button variant="outline" size="lg">Large Outline</el-dm-button>
```

Or with a bundler:

```ts
import '@duskmoon-dev/el-button/register';
```

### Manual Registration

```html
<script type="module">
  import { register } from '@duskmoon-dev/el-button';
  register();
</script>

<el-dm-button>Click me</el-dm-button>
```

## Variants

| Variant     | Description                     |
| ----------- | ------------------------------- |
| `primary`   | Primary action button (default) |
| `secondary` | Secondary action button         |
| `tertiary`  | Tertiary/subtle button          |
| `ghost`     | Transparent background button   |
| `outline`   | Border-only button              |

## Sizes

| Size | Description      |
| ---- | ---------------- |
| `xs` | Extra small      |
| `sm` | Small            |
| `md` | Medium (default) |
| `lg` | Large            |
| `xl` | Extra large      |

## Attributes

| Attribute         | Type    | Default   | Description                                  |
| ----------------- | ------- | --------- | -------------------------------------------- |
| `variant`         | string  | `primary` | Button variant                               |
| `size`            | string  | `md`      | Button size                                  |
| `disabled`        | boolean | `false`   | Disable the button                           |
| `type`            | string  | `button`  | Button type (button, submit, reset)          |
| `loading`         | boolean | `false`   | Show loading spinner                         |
| `aria-label`      | string  | —         | Accessible name for an icon-only button      |
| `aria-labelledby` | string  | —         | IDs of label elements in the host's DOM tree |

## Slots

| Slot      | Description              |
| --------- | ------------------------ |
| (default) | Button content           |
| `prefix`  | Content before main text |
| `suffix`  | Content after main text  |

## CSS Parts

| Part      | Description               |
| --------- | ------------------------- |
| `button`  | The native button element |
| `content` | Content wrapper           |
| `prefix`  | Prefix slot wrapper       |
| `suffix`  | Suffix slot wrapper       |
| `spinner` | Loading spinner           |

## CSS Custom Properties

| Property                    | Description        |
| --------------------------- | ------------------ |
| `--dm-button-padding-x`     | Horizontal padding |
| `--dm-button-padding-y`     | Vertical padding   |
| `--dm-button-font-size`     | Font size          |
| `--dm-button-border-radius` | Border radius      |

## Examples

### With Icons

```html
<el-dm-button>
  <span slot="prefix">🚀</span>
  Launch
</el-dm-button>
```

### Loading State

```html
<el-dm-button loading>Submitting...</el-dm-button>
```

### Accessible Icon Buttons

Set `aria-label` on an icon-only button. The label is synchronized with the native button,
including changes made after rendering.

```html
<el-dm-button aria-label="Remove email">
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <path d="M5 5L19 19M19 5L5 19" />
  </svg>
</el-dm-button>

<span id="remove-email-label">Remove email</span>
<el-dm-button aria-labelledby="remove-email-label">×</el-dm-button>
```

`aria-labelledby` resolves IDs in the host's document or containing shadow root and takes
precedence over `aria-label` when a target exists. Browsers supporting ARIA element references
use the referenced elements directly; older browsers use their text content or `aria-label`.
Label text changes and replacement label elements are synchronized. Without either attribute,
the slotted content provides the accessible name.

### Form Submit

```html
<form>
  <el-dm-button type="submit">Submit Form</el-dm-button>
</form>
```

## License

MIT

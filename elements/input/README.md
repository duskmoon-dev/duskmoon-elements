# @duskmoon-dev/el-input

A text input component with label and validation states.

## Installation

```bash
bun add @duskmoon-dev/el-input
```

## Usage

### Auto-Register (Recommended)

The simplest way to use the component - just import and it's ready:

```html
<!-- Via CDN -->
<script type="module" src="https://esm.sh/@duskmoon-dev/el-input/register"></script>

<!-- Now use the element -->
<el-dm-input label="Username" placeholder="Enter username"></el-dm-input>
<el-dm-input label="Email" type="email" required></el-dm-input>
<el-dm-input
  label="Password"
  type="password"
  validation-state="invalid"
  error-message="Password is required"
></el-dm-input>
```

Or with a bundler:

```ts
import '@duskmoon-dev/el-input/register';
```

### Manual Registration

```html
<script type="module">
  import { register } from '@duskmoon-dev/el-input';
  register();
</script>

<el-dm-input label="Username" placeholder="Enter username"></el-dm-input>
```

## Input Types

| Type       | Description                   |
| ---------- | ----------------------------- |
| `text`     | Standard text input (default) |
| `password` | Password input                |
| `email`    | Email input                   |
| `number`   | Number input                  |
| `tel`      | Telephone input               |
| `url`      | URL input                     |
| `search`   | Search input                  |

## Sizes

| Size | Description      |
| ---- | ---------------- |
| `sm` | Small            |
| `md` | Medium (default) |
| `lg` | Large            |

## Validation States

| State     | Description                                |
| --------- | ------------------------------------------ |
| `valid`   | Input is valid (green border)              |
| `invalid` | Input is invalid (red border, shows error) |
| `pending` | Validation in progress (shows spinner)     |

## Attributes

| Attribute          | Type    | Default | Description      |
| ------------------ | ------- | ------- | ---------------- |
| `type`             | string  | `text`  | Input type       |
| `value`            | string  | `''`    | Current value    |
| `name`             | string  |         | Form field name  |
| `label`            | string  |         | Label text       |
| `placeholder`      | string  |         | Placeholder text |
| `disabled`         | boolean | `false` | Disable input    |
| `readonly`         | boolean | `false` | Make readonly    |
| `required`         | boolean | `false` | Mark as required |
| `size`             | string  | `md`    | Input size       |
| `validation-state` | string  |         | Validation state |
| `error-message`    | string  |         | Error message    |
| `helper-text`      | string  |         | Helper text      |

## Slots

| Slot     | Description          |
| -------- | -------------------- |
| `prefix` | Content before input |
| `suffix` | Content after input  |

## CSS Parts

| Part            | Description           |
| --------------- | --------------------- |
| `container`     | Outer container       |
| `label`         | Label element         |
| `input-wrapper` | Wrapper around input  |
| `input`         | Native input element  |
| `prefix`        | Prefix slot wrapper   |
| `suffix`        | Suffix slot wrapper   |
| `helper`        | Helper text element   |
| `error`         | Error message element |

## Events

| Event       | Detail              | Description     |
| ----------- | ------------------- | --------------- |
| `dm-input`  | `{ value: string }` | Fired on input  |
| `dm-change` | `{ value: string }` | Fired on change |
| `dm-focus`  |                     | Fired on focus  |
| `dm-blur`   |                     | Fired on blur   |

## CSS Custom Properties

| Property                        | Description        |
| ------------------------------- | ------------------ |
| `--dm-input-height`             | Input height       |
| `--dm-input-padding-x`          | Horizontal padding |
| `--dm-input-font-size`          | Font size          |
| `--dm-input-border-radius`      | Border radius      |
| `--dm-input-border-color`       | Border color       |
| `--dm-input-focus-border-color` | Focus border color |

## Examples

### With Icons

```html
<el-dm-input label="Search" type="search">
  <span slot="prefix">&#128269;</span>
</el-dm-input>
```

### With Validation

```html
<el-dm-input
  label="Email"
  type="email"
  validation-state="invalid"
  error-message="Please enter a valid email address"
></el-dm-input>
```

### With Helper Text

```html
<el-dm-input
  label="Password"
  type="password"
  helper-text="Must be at least 8 characters"
></el-dm-input>
```

## License

MIT

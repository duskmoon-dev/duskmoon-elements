# @duskmoon-dev/el-card

A container component with header, body, and footer sections.

## Installation

```bash
bun add @duskmoon-dev/el-card
```

## Usage

### Auto-Register (Recommended)

The simplest way to use the component - just import and it's ready:

```html
<!-- Via CDN -->
<script type="module" src="https://esm.sh/@duskmoon-dev/el-card/register"></script>

<!-- Now use the element -->
<el-dm-card>
  <h3 slot="header">Card Title</h3>
  <p>Card body content goes here.</p>
  <div slot="footer">
    <button>Action</button>
  </div>
</el-dm-card>
```

Or with a bundler:

```ts
import '@duskmoon-dev/el-card/register';
```

### Manual Registration

```html
<script type="module">
  import { register } from '@duskmoon-dev/el-card';
  register();
</script>

<el-dm-card>
  <h3 slot="header">Card Title</h3>
  <p>Card body content goes here.</p>
</el-dm-card>
```

## Variants

| Variant    | Description                       |
| ---------- | --------------------------------- |
| `elevated` | Raised card with shadow (default) |
| `outlined` | Card with border                  |
| `filled`   | Card with subtle background       |

## Padding

| Size   | Description              |
| ------ | ------------------------ |
| `none` | No padding               |
| `sm`   | Small padding            |
| `md`   | Medium padding (default) |
| `lg`   | Large padding            |

## Attributes

| Attribute     | Type    | Default    | Description         |
| ------------- | ------- | ---------- | ------------------- |
| `variant`     | string  | `elevated` | Card variant        |
| `interactive` | boolean | `false`    | Make card clickable |
| `padding`     | string  | `md`       | Padding size        |

## Slots

| Slot      | Description                        |
| --------- | ---------------------------------- |
| (default) | Card body content                  |
| `header`  | Header section                     |
| `footer`  | Footer section                     |
| `media`   | Media content (image/video) at top |

## CSS Parts

| Part     | Description         |
| -------- | ------------------- |
| `card`   | Main card container |
| `header` | Header section      |
| `body`   | Body section        |
| `footer` | Footer section      |
| `media`  | Media section       |

## CSS Custom Properties

| Property                  | Description      |
| ------------------------- | ---------------- |
| `--dm-card-padding`       | Card padding     |
| `--dm-card-border-radius` | Border radius    |
| `--dm-card-background`    | Background color |
| `--dm-card-border-color`  | Border color     |
| `--dm-card-shadow`        | Box shadow       |

## Examples

### With Media

```html
<el-dm-card>
  <img slot="media" src="image.jpg" alt="Card image" />
  <h3 slot="header">Image Card</h3>
  <p>Description of the image.</p>
</el-dm-card>
```

### Interactive Card

```html
<el-dm-card interactive onclick="handleClick()">
  <h3 slot="header">Clickable Card</h3>
  <p>Click me!</p>
</el-dm-card>
```

### Outlined Variant

```html
<el-dm-card variant="outlined">
  <p>Outlined card content.</p>
</el-dm-card>
```

## License

MIT

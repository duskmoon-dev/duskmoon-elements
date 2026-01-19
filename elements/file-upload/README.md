# @duskmoon-dev/el-file-upload

A file upload component with drag and drop support built with Web Components.

## Installation

```bash
bun add @duskmoon-dev/el-file-upload
```

## Usage

### Auto-Register

```typescript
import '@duskmoon-dev/el-file-upload/register';
```

```html
<el-dm-file-upload></el-dm-file-upload>
```

### Manual Registration

```typescript
import { ElDmFileUpload, register } from '@duskmoon-dev/el-file-upload';

// Register with default tag name
register();

// Or register with custom tag name
customElements.define('my-file-upload', ElDmFileUpload);
```

## Sizes

| Size | Description |
|------|-------------|
| `sm` | Small upload area |
| `md` | Medium upload area (default) |
| `lg` | Large upload area |

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `accept` | `string` | `''` | Accepted file types |
| `multiple` | `boolean` | `false` | Allow multiple files |
| `disabled` | `boolean` | `false` | Disable the upload |
| `max-size` | `number` | - | Max file size in bytes |
| `max-files` | `number` | - | Max number of files |
| `show-preview` | `boolean` | `false` | Show file previews |
| `compact` | `boolean` | `false` | Compact display mode |
| `size` | `string` | `'md'` | Size variant: `sm`, `md`, `lg` |

## CSS Parts

| Part | Description |
|------|-------------|
| `dropzone` | The drop zone area |
| `file-list` | The list of selected files |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `change` | `{ files }` | Fired when files are selected |
| `remove` | `{ file, index }` | Fired when a file is removed |

## Examples

### Basic

```html
<el-dm-file-upload></el-dm-file-upload>
```

### Accept Specific Types

```html
<el-dm-file-upload accept="image/*"></el-dm-file-upload>
<el-dm-file-upload accept=".pdf,.doc,.docx"></el-dm-file-upload>
```

### Multiple Files

```html
<el-dm-file-upload multiple></el-dm-file-upload>
```

### With Preview

```html
<el-dm-file-upload show-preview accept="image/*"></el-dm-file-upload>
```

### Size Limits

```html
<el-dm-file-upload max-size="5242880" max-files="5"></el-dm-file-upload>
```

### Compact Mode

```html
<el-dm-file-upload compact></el-dm-file-upload>
```

### Handling Files

```javascript
const upload = document.querySelector('el-dm-file-upload');
upload.addEventListener('change', (e) => {
  const files = e.detail.files;
  // Handle the files
});
```

## License

MIT

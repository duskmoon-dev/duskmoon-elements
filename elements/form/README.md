# @duskmoon-dev/el-form

A form container component with validation support built with Web Components.

## Installation

```bash
bun add @duskmoon-dev/el-form
```

## Usage

### Auto-Register

```typescript
import '@duskmoon-dev/el-form/register';
```

```html
<el-dm-form>
  <el-dm-input name="email" label="Email" required></el-dm-input>
  <el-dm-button type="submit">Submit</el-dm-button>
</el-dm-form>
```

### Manual Registration

```typescript
import { ElDmForm, register } from '@duskmoon-dev/el-form';

// Register with default tag name
register();

// Or register with custom tag name
customElements.define('my-form', ElDmForm);
```

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `validation-state` | `string` | - | Form validation state |
| `disabled` | `boolean` | `false` | Disable all form elements |

## CSS Parts

| Part | Description |
|------|-------------|
| `form` | The form element |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `submit` | `{ formData, values }` | Fired on form submit |
| `reset` | - | Fired on form reset |

## Examples

### Basic Form

```html
<el-dm-form>
  <el-dm-input name="username" label="Username" required></el-dm-input>
  <el-dm-input name="email" label="Email" type="email" required></el-dm-input>
  <el-dm-button type="submit">Submit</el-dm-button>
</el-dm-form>
```

### Handling Submit

```javascript
const form = document.querySelector('el-dm-form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const { formData, values } = e.detail;
  console.log('Form values:', values);
});
```

### Disabled Form

```html
<el-dm-form disabled>
  <el-dm-input name="field" label="Field"></el-dm-input>
</el-dm-form>
```

### With Validation

```html
<el-dm-form id="myForm">
  <el-dm-input
    name="email"
    label="Email"
    type="email"
    required
    validation-state="invalid"
    error-message="Please enter a valid email"
  ></el-dm-input>
</el-dm-form>
```

## License

MIT

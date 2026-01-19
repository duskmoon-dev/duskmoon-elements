# @duskmoon-dev/el-stepper

A step indicator component built with Web Components.

## Installation

```bash
bun add @duskmoon-dev/el-stepper
```

## Usage

### Auto-Register

```typescript
import '@duskmoon-dev/el-stepper/register';
```

```html
<el-dm-stepper current="1"></el-dm-stepper>
```

### Manual Registration

```typescript
import { ElDmStepper, register } from '@duskmoon-dev/el-stepper';

// Register with default tag name
register();

// Or register with custom tag name
customElements.define('my-stepper', ElDmStepper);
```

### Setting Steps via JavaScript

```javascript
const stepper = document.querySelector('el-dm-stepper');
stepper.steps = [
  { label: 'Account', description: 'Create your account' },
  { label: 'Profile', description: 'Add profile details' },
  { label: 'Review', description: 'Review and submit' },
];
```

## Orientations

| Orientation | Description |
|-------------|-------------|
| `horizontal` | Horizontal layout (default) |
| `vertical` | Vertical layout |

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `current` | `number` | `0` | Current step index (0-based) |
| `orientation` | `string` | `'horizontal'` | Layout orientation |
| `color` | `string` | `'primary'` | Color variant |
| `clickable` | `boolean` | `false` | Allow clicking to navigate |

## CSS Parts

| Part | Description |
|------|-------------|
| `stepper` | The stepper container |
| `step` | Each step element |
| `indicator` | The step number/icon |
| `content` | The step content wrapper |
| `label` | The step label |
| `description` | The step description |
| `connector` | The line between steps |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `change` | `{ step, index }` | Fired when step changes |

## Examples

### Basic

```html
<el-dm-stepper id="stepper" current="0"></el-dm-stepper>
<script>
  document.querySelector('#stepper').steps = [
    { label: 'Step 1' },
    { label: 'Step 2' },
    { label: 'Step 3' },
  ];
</script>
```

### With Descriptions

```javascript
stepper.steps = [
  { label: 'Details', description: 'Enter your information' },
  { label: 'Payment', description: 'Choose payment method' },
  { label: 'Confirm', description: 'Review your order' },
];
```

### Vertical Orientation

```html
<el-dm-stepper orientation="vertical"></el-dm-stepper>
```

### Clickable Steps

```html
<el-dm-stepper clickable></el-dm-stepper>
```

### With Navigation Buttons

```html
<el-dm-stepper id="stepper" current="0"></el-dm-stepper>
<div>
  <el-dm-button id="prev">Previous</el-dm-button>
  <el-dm-button id="next">Next</el-dm-button>
</div>

<script>
  const stepper = document.querySelector('#stepper');
  stepper.steps = [
    { label: 'Step 1' },
    { label: 'Step 2' },
    { label: 'Step 3' },
  ];

  document.querySelector('#prev').addEventListener('click', () => {
    if (stepper.current > 0) stepper.current--;
  });

  document.querySelector('#next').addEventListener('click', () => {
    if (stepper.current < stepper.steps.length - 1) stepper.current++;
  });
</script>
```

### Form Wizard

```html
<el-dm-stepper id="wizard" current="0"></el-dm-stepper>
<div id="step-content">
  <!-- Step content changes based on current step -->
</div>

<script>
  const stepper = document.querySelector('#wizard');
  const content = document.querySelector('#step-content');

  stepper.steps = [
    { label: 'Personal', description: 'Basic info' },
    { label: 'Contact', description: 'Contact details' },
    { label: 'Finish', description: 'Complete' },
  ];

  stepper.addEventListener('change', (e) => {
    // Update content based on step
    loadStepContent(e.detail.index);
  });
</script>
```

## License

MIT

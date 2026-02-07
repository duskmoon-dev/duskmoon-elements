import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmInput, register } from './index';

register();

function createInput(props: Partial<ElDmInput> = {}): ElDmInput {
  const el = document.createElement('el-dm-input') as ElDmInput;
  Object.assign(el, props);
  return el;
}

describe('ElDmInput', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  // --- Registration ---
  test('is defined', () => {
    expect(customElements.get('el-dm-input')).toBe(ElDmInput);
  });

  // --- Rendering ---
  test('creates a shadow root with container', () => {
    const el = createInput();
    container.appendChild(el);
    const cont = el.shadowRoot?.querySelector('.container');
    expect(cont).toBeDefined();
  });

  test('has input element', () => {
    const el = createInput();
    container.appendChild(el);
    const input = el.shadowRoot?.querySelector('input');
    expect(input).toBeDefined();
  });

  test('has input-wrapper', () => {
    const el = createInput();
    container.appendChild(el);
    const wrapper = el.shadowRoot?.querySelector('.input-wrapper');
    expect(wrapper).toBeDefined();
  });

  test('has prefix slot', () => {
    const el = createInput();
    container.appendChild(el);
    const slot = el.shadowRoot?.querySelector('slot[name="prefix"]');
    expect(slot).toBeDefined();
  });

  test('has suffix slot', () => {
    const el = createInput();
    container.appendChild(el);
    const slot = el.shadowRoot?.querySelector('slot[name="suffix"]');
    expect(slot).toBeDefined();
  });

  // --- Properties ---
  test('defaults type to text', () => {
    const el = createInput();
    container.appendChild(el);
    expect(el.type).toBe('text');
  });

  test('reflects type attribute', () => {
    const el = createInput({ type: 'password' } as Partial<ElDmInput>);
    container.appendChild(el);
    expect(el.getAttribute('type')).toBe('password');
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.getAttribute('type')).toBe('password');
  });

  test('reflects value attribute', () => {
    const el = createInput({ value: 'hello' });
    container.appendChild(el);
    expect(el.getAttribute('value')).toBe('hello');
  });

  test('input gets value', () => {
    const el = createInput({ value: 'hello' });
    container.appendChild(el);
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.getAttribute('value')).toBe('hello');
  });

  test('reflects name attribute', () => {
    const el = createInput({ name: 'username' });
    container.appendChild(el);
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.getAttribute('name')).toBe('username');
  });

  test('reflects placeholder attribute', () => {
    const el = createInput({ placeholder: 'Enter text' });
    container.appendChild(el);
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.getAttribute('placeholder')).toBe('Enter text');
  });

  test('reflects disabled attribute', () => {
    const el = createInput({ disabled: true });
    container.appendChild(el);
    expect(el.hasAttribute('disabled')).toBe(true);
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.hasAttribute('disabled')).toBe(true);
  });

  test('reflects readonly attribute', () => {
    const el = createInput({ readonly: true });
    container.appendChild(el);
    expect(el.hasAttribute('readonly')).toBe(true);
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.hasAttribute('readonly')).toBe(true);
  });

  test('reflects required attribute', () => {
    const el = createInput({ required: true });
    container.appendChild(el);
    expect(el.hasAttribute('required')).toBe(true);
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.hasAttribute('required')).toBe(true);
  });

  test('reflects size attribute', () => {
    const el = createInput({ size: 'lg' } as Partial<ElDmInput>);
    container.appendChild(el);
    expect(el.getAttribute('size')).toBe('lg');
  });

  // --- Label ---
  test('renders label when provided', () => {
    const el = createInput({ label: 'Username' });
    container.appendChild(el);
    const label = el.shadowRoot?.querySelector('label');
    expect(label?.textContent?.trim()).toBe('Username');
  });

  test('no label element when label not provided', () => {
    const el = createInput();
    container.appendChild(el);
    const label = el.shadowRoot?.querySelector('label');
    expect(label).toBeNull();
  });

  test('label has required class when required', () => {
    const el = createInput({ label: 'Email', required: true });
    container.appendChild(el);
    const label = el.shadowRoot?.querySelector('label.required');
    expect(label).toBeDefined();
  });

  // --- Validation states ---
  test('reflects validation-state attribute', () => {
    const el = createInput({ validationState: 'invalid' } as Partial<ElDmInput>);
    container.appendChild(el);
    expect(el.getAttribute('validation-state')).toBe('invalid');
  });

  test('input-wrapper has invalid class when invalid', () => {
    const el = createInput({ validationState: 'invalid' } as Partial<ElDmInput>);
    container.appendChild(el);
    const wrapper = el.shadowRoot?.querySelector('.input-wrapper');
    expect(wrapper?.classList.contains('invalid')).toBe(true);
  });

  test('input-wrapper has valid class when valid', () => {
    const el = createInput({ validationState: 'valid' } as Partial<ElDmInput>);
    container.appendChild(el);
    const wrapper = el.shadowRoot?.querySelector('.input-wrapper');
    expect(wrapper?.classList.contains('valid')).toBe(true);
  });

  test('input-wrapper has disabled class', () => {
    const el = createInput({ disabled: true });
    container.appendChild(el);
    const wrapper = el.shadowRoot?.querySelector('.input-wrapper');
    expect(wrapper?.classList.contains('disabled')).toBe(true);
  });

  // --- Error message ---
  test('shows error message when invalid', () => {
    const el = createInput({ validationState: 'invalid', errorMessage: 'Required field' } as Partial<ElDmInput>);
    container.appendChild(el);
    const error = el.shadowRoot?.querySelector('.error');
    expect(error?.textContent?.trim()).toBe('Required field');
  });

  test('error has role alert', () => {
    const el = createInput({ validationState: 'invalid', errorMessage: 'Error!' } as Partial<ElDmInput>);
    container.appendChild(el);
    const error = el.shadowRoot?.querySelector('[role="alert"]');
    expect(error).toBeDefined();
  });

  test('no error when not invalid', () => {
    const el = createInput({ errorMessage: 'Required field' });
    container.appendChild(el);
    const error = el.shadowRoot?.querySelector('.error');
    expect(error).toBeNull();
  });

  // --- Helper text ---
  test('shows helper text', () => {
    const el = createInput({ helperText: 'Enter your name' });
    container.appendChild(el);
    const helper = el.shadowRoot?.querySelector('.helper');
    expect(helper?.textContent?.trim()).toBe('Enter your name');
  });

  test('helper hidden when invalid', () => {
    const el = createInput({ helperText: 'Help', validationState: 'invalid', errorMessage: 'Err' } as Partial<ElDmInput>);
    container.appendChild(el);
    const helper = el.shadowRoot?.querySelector('.helper');
    expect(helper).toBeNull();
  });

  // --- Accessibility ---
  test('aria-invalid is true when invalid', () => {
    const el = createInput({ validationState: 'invalid' } as Partial<ElDmInput>);
    container.appendChild(el);
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.getAttribute('aria-invalid')).toBe('true');
  });

  test('aria-invalid is false when valid', () => {
    const el = createInput({ validationState: 'valid' } as Partial<ElDmInput>);
    container.appendChild(el);
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.getAttribute('aria-invalid')).toBe('false');
  });

  test('aria-describedby points to error when invalid', () => {
    const el = createInput({ validationState: 'invalid', errorMessage: 'Err' } as Partial<ElDmInput>);
    container.appendChild(el);
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.getAttribute('aria-describedby')).toBe('error');
  });

  test('aria-describedby points to helper when has helperText', () => {
    const el = createInput({ helperText: 'Help' });
    container.appendChild(el);
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.getAttribute('aria-describedby')).toBe('helper');
  });

  // --- Input classes ---
  test('input has input and input-bordered classes', () => {
    const el = createInput();
    container.appendChild(el);
    const input = el.shadowRoot?.querySelector('input.input');
    expect(input).toBeDefined();
    expect(input?.classList.contains('input-bordered')).toBe(true);
  });

  test('input has input-sm class for sm size', () => {
    const el = createInput({ size: 'sm' } as Partial<ElDmInput>);
    container.appendChild(el);
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.classList.contains('input-sm')).toBe(true);
  });

  test('input has input-lg class for lg size', () => {
    const el = createInput({ size: 'lg' } as Partial<ElDmInput>);
    container.appendChild(el);
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.classList.contains('input-lg')).toBe(true);
  });

  test('input has input-error class when invalid', () => {
    const el = createInput({ validationState: 'invalid' } as Partial<ElDmInput>);
    container.appendChild(el);
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.classList.contains('input-error')).toBe(true);
  });

  test('input has input-success class when valid', () => {
    const el = createInput({ validationState: 'valid' } as Partial<ElDmInput>);
    container.appendChild(el);
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.classList.contains('input-success')).toBe(true);
  });

  // --- Public methods ---
  test('has focus method', () => {
    const el = createInput();
    container.appendChild(el);
    expect(typeof el.focus).toBe('function');
  });

  test('has blur method', () => {
    const el = createInput();
    container.appendChild(el);
    expect(typeof el.blur).toBe('function');
  });

  test('has select method', () => {
    const el = createInput();
    container.appendChild(el);
    expect(typeof el.select).toBe('function');
  });

  // --- Events ---
  test('dm-input event fires on native input', () => {
    const el = createInput();
    container.appendChild(el);
    let detail: { value: string } | null = null;
    el.addEventListener('dm-input', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
    const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
    input.value = 'test';
    input.dispatchEvent(new Event('input'));
    expect(detail).toBeDefined();
  });

  test('dm-change event fires on native change', () => {
    const el = createInput();
    container.appendChild(el);
    let fired = false;
    el.addEventListener('dm-change', () => { fired = true; });
    const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new Event('change'));
    expect(fired).toBe(true);
  });

  test('dm-focus event fires on native focus', () => {
    const el = createInput();
    container.appendChild(el);
    let fired = false;
    el.addEventListener('dm-focus', () => { fired = true; });
    const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new Event('focus'));
    expect(fired).toBe(true);
  });

  test('dm-blur event fires on native blur', () => {
    const el = createInput();
    container.appendChild(el);
    let fired = false;
    el.addEventListener('dm-blur', () => { fired = true; });
    const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new Event('blur'));
    expect(fired).toBe(true);
  });

  // --- Pending indicator ---
  test('has pending indicator element', () => {
    const el = createInput();
    container.appendChild(el);
    const indicator = el.shadowRoot?.querySelector('.pending-indicator');
    expect(indicator).toBeDefined();
  });

  // --- Input types ---
  test('supports email type', () => {
    const el = createInput({ type: 'email' } as Partial<ElDmInput>);
    container.appendChild(el);
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.getAttribute('type')).toBe('email');
  });

  test('supports number type', () => {
    const el = createInput({ type: 'number' } as Partial<ElDmInput>);
    container.appendChild(el);
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.getAttribute('type')).toBe('number');
  });

  test('supports tel type', () => {
    const el = createInput({ type: 'tel' } as Partial<ElDmInput>);
    container.appendChild(el);
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.getAttribute('type')).toBe('tel');
  });

  test('supports search type', () => {
    const el = createInput({ type: 'search' } as Partial<ElDmInput>);
    container.appendChild(el);
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.getAttribute('type')).toBe('search');
  });

  // --- CSS Parts ---
  test('has container part', () => {
    const el = createInput();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="container"]')).toBeDefined();
  });

  test('has input-wrapper part', () => {
    const el = createInput();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="input-wrapper"]')).toBeDefined();
  });

  test('has input part', () => {
    const el = createInput();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="input"]')).toBeDefined();
  });

  test('has prefix part', () => {
    const el = createInput();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="prefix"]')).toBeDefined();
  });

  test('has suffix part', () => {
    const el = createInput();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="suffix"]')).toBeDefined();
  });

  test('has label part when label provided', () => {
    const el = createInput({ label: 'Name' });
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="label"]')).toBeDefined();
  });

  test('has error part when invalid', () => {
    const el = createInput({ validationState: 'invalid', errorMessage: 'Err' } as Partial<ElDmInput>);
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="error"]')).toBeDefined();
  });

  test('has helper part when has helperText', () => {
    const el = createInput({ helperText: 'Help' });
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="helper"]')).toBeDefined();
  });
});

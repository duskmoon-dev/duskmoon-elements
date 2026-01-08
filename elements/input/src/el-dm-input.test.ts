import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmInput, register } from './index';

// Register the element
register();

describe('ElDmInput', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('is defined', () => {
    expect(customElements.get('el-dm-input')).toBe(ElDmInput);
  });

  test('creates a shadow root with input', () => {
    const el = document.createElement('el-dm-input') as ElDmInput;
    container.appendChild(el);

    const input = el.shadowRoot?.querySelector('input');
    expect(input).toBeDefined();
  });

  test('renders label when provided', () => {
    const el = document.createElement('el-dm-input') as ElDmInput;
    el.label = 'Username';
    container.appendChild(el);

    const label = el.shadowRoot?.querySelector('.label');
    expect(label?.textContent).toContain('Username');
  });

  test('applies type attribute to native input', () => {
    const el = document.createElement('el-dm-input') as ElDmInput;
    el.type = 'email';
    container.appendChild(el);

    const input = el.shadowRoot?.querySelector('input');
    expect(input?.getAttribute('type')).toBe('email');
  });

  test('applies placeholder attribute', () => {
    const el = document.createElement('el-dm-input') as ElDmInput;
    el.placeholder = 'Enter text...';
    container.appendChild(el);

    const input = el.shadowRoot?.querySelector('input');
    expect(input?.getAttribute('placeholder')).toBe('Enter text...');
  });

  test('applies disabled attribute', () => {
    const el = document.createElement('el-dm-input') as ElDmInput;
    el.disabled = true;
    container.appendChild(el);

    const input = el.shadowRoot?.querySelector('input');
    expect(input?.hasAttribute('disabled')).toBe(true);
  });

  test('applies required attribute', () => {
    const el = document.createElement('el-dm-input') as ElDmInput;
    el.required = true;
    container.appendChild(el);

    const input = el.shadowRoot?.querySelector('input');
    expect(input?.hasAttribute('required')).toBe(true);

    const label = el.shadowRoot?.querySelector('.label');
    expect(label).toBeNull(); // No label set
  });

  test('shows error message when validation-state is invalid', () => {
    const el = document.createElement('el-dm-input') as ElDmInput;
    el.validationState = 'invalid';
    el.errorMessage = 'This field is required';
    container.appendChild(el);

    const error = el.shadowRoot?.querySelector('.error');
    expect(error?.textContent).toContain('This field is required');
  });

  test('shows helper text when provided', () => {
    const el = document.createElement('el-dm-input') as ElDmInput;
    el.helperText = 'Enter your email address';
    container.appendChild(el);

    const helper = el.shadowRoot?.querySelector('.helper');
    expect(helper?.textContent).toContain('Enter your email address');
  });

  test('hides helper text when validation-state is invalid', () => {
    const el = document.createElement('el-dm-input') as ElDmInput;
    el.helperText = 'Helper text';
    el.validationState = 'invalid';
    el.errorMessage = 'Error message';
    container.appendChild(el);

    const helper = el.shadowRoot?.querySelector('.helper');
    const error = el.shadowRoot?.querySelector('.error');

    expect(helper).toBeNull();
    expect(error).toBeDefined();
  });

  test('applies size attribute', () => {
    const el = document.createElement('el-dm-input') as ElDmInput;
    el.size = 'lg';
    container.appendChild(el);

    expect(el.getAttribute('size')).toBe('lg');
  });

  test('has prefix and suffix slots', () => {
    const el = document.createElement('el-dm-input') as ElDmInput;
    container.appendChild(el);

    const prefixSlot = el.shadowRoot?.querySelector('slot[name="prefix"]');
    const suffixSlot = el.shadowRoot?.querySelector('slot[name="suffix"]');

    expect(prefixSlot).toBeDefined();
    expect(suffixSlot).toBeDefined();
  });

  test('value property updates native input', () => {
    const el = document.createElement('el-dm-input') as ElDmInput;
    el.value = 'test value';
    container.appendChild(el);

    const input = el.shadowRoot?.querySelector('input');
    expect(input?.getAttribute('value')).toBe('test value');
  });
});

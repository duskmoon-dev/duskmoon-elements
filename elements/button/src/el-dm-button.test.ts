import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmButton, register } from './index';

// Register the element
register();

describe('ElDmButton', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('is defined', () => {
    expect(customElements.get('el-dm-button')).toBe(ElDmButton);
  });

  test('creates a shadow root with button', () => {
    const el = document.createElement('el-dm-button') as ElDmButton;
    container.appendChild(el);

    const button = el.shadowRoot?.querySelector('button');
    expect(button).toBeDefined();
  });

  test('renders slot content', () => {
    const el = document.createElement('el-dm-button') as ElDmButton;
    el.textContent = 'Click me';
    container.appendChild(el);

    const slot = el.shadowRoot?.querySelector('slot:not([name])');
    expect(slot).toBeDefined();
  });

  test('applies variant attribute', () => {
    const el = document.createElement('el-dm-button') as ElDmButton;
    el.variant = 'secondary';
    container.appendChild(el);

    expect(el.getAttribute('variant')).toBe('secondary');
  });

  test('applies size attribute', () => {
    const el = document.createElement('el-dm-button') as ElDmButton;
    el.size = 'lg';
    container.appendChild(el);

    expect(el.getAttribute('size')).toBe('lg');
  });

  test('applies disabled attribute to native button', () => {
    const el = document.createElement('el-dm-button') as ElDmButton;
    el.disabled = true;
    container.appendChild(el);

    const button = el.shadowRoot?.querySelector('button');
    expect(button?.hasAttribute('disabled')).toBe(true);
  });

  test('shows loading spinner when loading', () => {
    const el = document.createElement('el-dm-button') as ElDmButton;
    el.loading = true;
    container.appendChild(el);

    expect(el.hasAttribute('loading')).toBe(true);
  });

  test('default type is button', () => {
    const el = document.createElement('el-dm-button') as ElDmButton;
    container.appendChild(el);

    const button = el.shadowRoot?.querySelector('button');
    expect(button?.getAttribute('type')).toBe('button');
  });

  test('submits external form referenced by form attribute', () => {
    const form = document.createElement('form');
    form.id = 'external-form';
    let submitted = false;
    form.requestSubmit = () => {
      submitted = true;
    };
    container.appendChild(form);

    const el = document.createElement('el-dm-button') as ElDmButton;
    el.type = 'submit';
    el.setAttribute('form', 'external-form');
    container.appendChild(el);

    el.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

    expect(submitted).toBe(true);
  });

  test('supports prefix and suffix slots', () => {
    const el = document.createElement('el-dm-button') as ElDmButton;
    container.appendChild(el);

    const prefixSlot = el.shadowRoot?.querySelector('slot[name="prefix"]');
    const suffixSlot = el.shadowRoot?.querySelector('slot[name="suffix"]');

    expect(prefixSlot).toBeDefined();
    expect(suffixSlot).toBeDefined();
  });
});

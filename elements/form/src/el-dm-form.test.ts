import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmForm, register } from './index';

register();

describe('ElDmForm', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('is defined', () => {
    expect(customElements.get('el-dm-form')).toBe(ElDmForm);
  });

  test('creates a shadow root with form element', () => {
    const el = document.createElement('el-dm-form') as ElDmForm;
    container.appendChild(el);

    const form = el.shadowRoot?.querySelector('.form');
    expect(form).toBeDefined();
  });

  test('has default slot', () => {
    const el = document.createElement('el-dm-form') as ElDmForm;
    container.appendChild(el);

    const slot = el.shadowRoot?.querySelector('slot');
    expect(slot).toBeDefined();
  });

  test('reflects disabled attribute', () => {
    const el = document.createElement('el-dm-form') as ElDmForm;
    el.disabled = true;
    container.appendChild(el);

    expect(el.hasAttribute('disabled')).toBe(true);
  });

  test('reflects validation-state attribute', () => {
    const el = document.createElement('el-dm-form') as ElDmForm;
    el.validationState = 'error';
    container.appendChild(el);

    expect(el.getAttribute('validation-state')).toBe('error');
  });

  test('has public submit and reset methods', () => {
    const el = document.createElement('el-dm-form') as ElDmForm;
    container.appendChild(el);

    expect(typeof el.submit).toBe('function');
    expect(typeof el.reset).toBe('function');
  });
});

import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmSelect, register } from './index';

register();

describe('ElDmSelect', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('is defined', () => {
    expect(customElements.get('el-dm-select')).toBe(ElDmSelect);
  });

  test('creates a shadow root', () => {
    const el = document.createElement('el-dm-select') as ElDmSelect;
    container.appendChild(el);

    expect(el.shadowRoot).toBeDefined();
  });

  test('has combobox role', () => {
    const el = document.createElement('el-dm-select') as ElDmSelect;
    container.appendChild(el);

    const combobox = el.shadowRoot?.querySelector('[role="combobox"]');
    expect(combobox).toBeDefined();
  });

  test('reflects disabled attribute', () => {
    const el = document.createElement('el-dm-select') as ElDmSelect;
    el.disabled = true;
    container.appendChild(el);

    expect(el.hasAttribute('disabled')).toBe(true);
  });

  test('sets placeholder property', () => {
    const el = document.createElement('el-dm-select') as ElDmSelect;
    el.placeholder = 'Choose...';
    container.appendChild(el);

    expect(el.placeholder).toBe('Choose...');
  });

  test('reflects size attribute', () => {
    const el = document.createElement('el-dm-select') as ElDmSelect;
    el.size = 'lg';
    container.appendChild(el);

    expect(el.getAttribute('size')).toBe('lg');
  });

  test('reflects multiple attribute', () => {
    const el = document.createElement('el-dm-select') as ElDmSelect;
    el.multiple = true;
    container.appendChild(el);

    expect(el.hasAttribute('multiple')).toBe(true);
  });

  test('reflects clearable attribute', () => {
    const el = document.createElement('el-dm-select') as ElDmSelect;
    el.clearable = true;
    container.appendChild(el);

    expect(el.hasAttribute('clearable')).toBe(true);
  });
});

import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmDatepicker, register } from './index';

register();

describe('ElDmDatepicker', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('is defined', () => {
    expect(customElements.get('el-dm-datepicker')).toBe(ElDmDatepicker);
  });

  test('creates a shadow root', () => {
    const el = document.createElement('el-dm-datepicker') as ElDmDatepicker;
    container.appendChild(el);

    expect(el.shadowRoot).toBeDefined();
  });

  test('reflects disabled attribute', () => {
    const el = document.createElement('el-dm-datepicker') as ElDmDatepicker;
    el.disabled = true;
    container.appendChild(el);

    expect(el.hasAttribute('disabled')).toBe(true);
  });

  test('reflects placeholder attribute', () => {
    const el = document.createElement('el-dm-datepicker') as ElDmDatepicker;
    el.placeholder = 'Pick a date';
    container.appendChild(el);

    expect(el.getAttribute('placeholder')).toBe('Pick a date');
  });

  test('reflects size attribute', () => {
    const el = document.createElement('el-dm-datepicker') as ElDmDatepicker;
    el.size = 'lg';
    container.appendChild(el);

    expect(el.getAttribute('size')).toBe('lg');
  });

  test('reflects value attribute', () => {
    const el = document.createElement('el-dm-datepicker') as ElDmDatepicker;
    el.value = '2026-01-15';
    container.appendChild(el);

    expect(el.getAttribute('value')).toBe('2026-01-15');
  });
});

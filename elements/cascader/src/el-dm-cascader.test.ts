import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmCascader, register } from './index';

register();

describe('ElDmCascader', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('is defined', () => {
    expect(customElements.get('el-dm-cascader')).toBe(ElDmCascader);
  });

  test('creates a shadow root', () => {
    const el = document.createElement('el-dm-cascader') as ElDmCascader;
    container.appendChild(el);

    expect(el.shadowRoot).toBeDefined();
  });

  test('reflects disabled attribute', () => {
    const el = document.createElement('el-dm-cascader') as ElDmCascader;
    el.disabled = true;
    container.appendChild(el);

    expect(el.hasAttribute('disabled')).toBe(true);
  });

  test('sets placeholder property', () => {
    const el = document.createElement('el-dm-cascader') as ElDmCascader;
    el.placeholder = 'Select...';
    container.appendChild(el);

    expect(el.placeholder).toBe('Select...');
  });

  test('reflects size attribute', () => {
    const el = document.createElement('el-dm-cascader') as ElDmCascader;
    el.size = 'sm';
    container.appendChild(el);

    expect(el.getAttribute('size')).toBe('sm');
  });

  test('reflects clearable attribute', () => {
    const el = document.createElement('el-dm-cascader') as ElDmCascader;
    el.clearable = true;
    container.appendChild(el);

    expect(el.hasAttribute('clearable')).toBe(true);
  });
});

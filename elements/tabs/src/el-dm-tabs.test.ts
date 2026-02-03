import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmTabs, register } from './index';

register();

describe('ElDmTabs', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('is defined', () => {
    expect(customElements.get('el-dm-tabs')).toBe(ElDmTabs);
  });

  test('creates a shadow root with tablist', () => {
    const el = document.createElement('el-dm-tabs') as ElDmTabs;
    container.appendChild(el);

    const tablist = el.shadowRoot?.querySelector('[role="tablist"]');
    expect(tablist).toBeDefined();
  });

  test('has tab and default slots', () => {
    const el = document.createElement('el-dm-tabs') as ElDmTabs;
    container.appendChild(el);

    const tabSlot = el.shadowRoot?.querySelector('slot[name="tab"]');
    const defaultSlot = el.shadowRoot?.querySelector('slot:not([name])');
    expect(tabSlot).toBeDefined();
    expect(defaultSlot).toBeDefined();
  });

  test('reflects value attribute', () => {
    const el = document.createElement('el-dm-tabs') as ElDmTabs;
    el.value = 'tab-1';
    container.appendChild(el);

    expect(el.getAttribute('value')).toBe('tab-1');
  });

  test('reflects variant attribute', () => {
    const el = document.createElement('el-dm-tabs') as ElDmTabs;
    el.variant = 'pills';
    container.appendChild(el);

    expect(el.getAttribute('variant')).toBe('pills');
  });

  test('reflects orientation attribute', () => {
    const el = document.createElement('el-dm-tabs') as ElDmTabs;
    el.orientation = 'vertical';
    container.appendChild(el);

    expect(el.getAttribute('orientation')).toBe('vertical');
  });
});

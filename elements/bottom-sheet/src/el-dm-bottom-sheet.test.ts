import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmBottomSheet, register } from './index';

register();

describe('ElDmBottomSheet', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('is defined', () => {
    expect(customElements.get('el-dm-bottom-sheet')).toBe(ElDmBottomSheet);
  });

  test('creates a shadow root with bottom sheet', () => {
    const el = document.createElement('el-dm-bottom-sheet') as ElDmBottomSheet;
    container.appendChild(el);

    const sheet = el.shadowRoot?.querySelector('.bottom-sheet');
    expect(sheet).toBeDefined();
  });

  test('has dialog role', () => {
    const el = document.createElement('el-dm-bottom-sheet') as ElDmBottomSheet;
    container.appendChild(el);

    const dialog = el.shadowRoot?.querySelector('[role="dialog"]');
    expect(dialog).toBeDefined();
  });

  test('has drag handle', () => {
    const el = document.createElement('el-dm-bottom-sheet') as ElDmBottomSheet;
    container.appendChild(el);

    const handle = el.shadowRoot?.querySelector('.bottom-sheet-handle');
    expect(handle).toBeDefined();
  });

  test('has header slot and default slot', () => {
    const el = document.createElement('el-dm-bottom-sheet') as ElDmBottomSheet;
    container.appendChild(el);

    const headerSlot = el.shadowRoot?.querySelector('slot[name="header"]');
    const defaultSlot = el.shadowRoot?.querySelector('slot:not([name])');
    expect(headerSlot).toBeDefined();
    expect(defaultSlot).toBeDefined();
  });

  test('reflects open attribute', () => {
    const el = document.createElement('el-dm-bottom-sheet') as ElDmBottomSheet;
    el.open = true;
    container.appendChild(el);

    expect(el.hasAttribute('open')).toBe(true);
  });

  test('has public show/hide methods', () => {
    const el = document.createElement('el-dm-bottom-sheet') as ElDmBottomSheet;
    container.appendChild(el);

    expect(typeof el.show).toBe('function');
    expect(typeof el.hide).toBe('function');
  });

  test('wrapper has open class when open', () => {
    const el = document.createElement('el-dm-bottom-sheet') as ElDmBottomSheet;
    el.open = true;
    container.appendChild(el);

    const wrapper = el.shadowRoot?.querySelector('.bottom-sheet-wrapper');
    expect(wrapper?.classList.contains('open')).toBe(true);
  });
});

import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmDrawer, register } from './index';

register();

describe('ElDmDrawer', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('is defined', () => {
    expect(customElements.get('el-dm-drawer')).toBe(ElDmDrawer);
  });

  test('creates a shadow root with dialog role', () => {
    const el = document.createElement('el-dm-drawer') as ElDmDrawer;
    container.appendChild(el);

    const dialog = el.shadowRoot?.querySelector('[role="dialog"]');
    expect(dialog).toBeDefined();
  });

  test('has header, default, and footer slots', () => {
    const el = document.createElement('el-dm-drawer') as ElDmDrawer;
    container.appendChild(el);

    const headerSlot = el.shadowRoot?.querySelector('slot[name="header"]');
    const defaultSlot = el.shadowRoot?.querySelector('slot:not([name])');
    const footerSlot = el.shadowRoot?.querySelector('slot[name="footer"]');

    expect(headerSlot).toBeDefined();
    expect(defaultSlot).toBeDefined();
    expect(footerSlot).toBeDefined();
  });

  test('default position is left', () => {
    const el = document.createElement('el-dm-drawer') as ElDmDrawer;
    container.appendChild(el);

    const drawer = el.shadowRoot?.querySelector('.drawer');
    expect(drawer?.classList.contains('drawer-left')).toBe(true);
  });

  test('applies position classes', () => {
    const el = document.createElement('el-dm-drawer') as ElDmDrawer;
    el.position = 'right';
    container.appendChild(el);

    const drawer = el.shadowRoot?.querySelector('.drawer');
    expect(drawer?.classList.contains('drawer-right')).toBe(true);
  });

  test('has public show/hide/toggle methods', () => {
    const el = document.createElement('el-dm-drawer') as ElDmDrawer;
    container.appendChild(el);

    expect(typeof el.show).toBe('function');
    expect(typeof el.hide).toBe('function');
    expect(typeof el.toggle).toBe('function');
  });

  test('reflects open attribute', () => {
    const el = document.createElement('el-dm-drawer') as ElDmDrawer;
    el.open = true;
    container.appendChild(el);

    expect(el.hasAttribute('open')).toBe(true);
  });

  test('has close button', () => {
    const el = document.createElement('el-dm-drawer') as ElDmDrawer;
    container.appendChild(el);

    const closeBtn = el.shadowRoot?.querySelector('.drawer-close');
    expect(closeBtn).toBeDefined();
  });
});

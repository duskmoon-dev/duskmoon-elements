import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmMenu, register } from './index';

register();

describe('ElDmMenu', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('is defined', () => {
    expect(customElements.get('el-dm-menu')).toBe(ElDmMenu);
  });

  test('creates a shadow root with menu container', () => {
    const el = document.createElement('el-dm-menu') as ElDmMenu;
    container.appendChild(el);

    const menu = el.shadowRoot?.querySelector('.menu-container');
    expect(menu).toBeDefined();
  });

  test('has menu role', () => {
    const el = document.createElement('el-dm-menu') as ElDmMenu;
    container.appendChild(el);

    const menu = el.shadowRoot?.querySelector('[role="menu"]');
    expect(menu).toBeDefined();
  });

  test('has trigger and default slots', () => {
    const el = document.createElement('el-dm-menu') as ElDmMenu;
    container.appendChild(el);

    const triggerSlot = el.shadowRoot?.querySelector('slot[name="trigger"]');
    const defaultSlot = el.shadowRoot?.querySelector('slot:not([name])');
    expect(triggerSlot).toBeDefined();
    expect(defaultSlot).toBeDefined();
  });

  test('has public show/hide/toggle methods', () => {
    const el = document.createElement('el-dm-menu') as ElDmMenu;
    container.appendChild(el);

    expect(typeof el.show).toBe('function');
    expect(typeof el.hide).toBe('function');
    expect(typeof el.toggle).toBe('function');
  });

  test('reflects open attribute', () => {
    const el = document.createElement('el-dm-menu') as ElDmMenu;
    el.open = true;
    container.appendChild(el);

    expect(el.hasAttribute('open')).toBe(true);
  });
});

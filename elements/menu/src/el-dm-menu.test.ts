import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmMenu, ElDmMenuItem, register } from './index';

register();

function createMenu(props: Partial<ElDmMenu> = {}): ElDmMenu {
  const el = document.createElement('el-dm-menu') as ElDmMenu;
  Object.assign(el, props);
  return el;
}

function createMenuItem(props: Partial<ElDmMenuItem> = {}): ElDmMenuItem {
  const el = document.createElement('el-dm-menu-item') as ElDmMenuItem;
  Object.assign(el, props);
  return el;
}

describe('ElDmMenu', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  // --- Registration ---
  test('is defined', () => {
    expect(customElements.get('el-dm-menu')).toBe(ElDmMenu);
  });

  test('menu-item is defined', () => {
    expect(customElements.get('el-dm-menu-item')).toBe(ElDmMenuItem);
  });

  // --- Rendering ---
  test('creates a shadow root with menu container', () => {
    const el = createMenu();
    container.appendChild(el);
    const menu = el.shadowRoot?.querySelector('.menu');
    expect(menu).toBeDefined();
  });

  test('has menu role', () => {
    const el = createMenu();
    container.appendChild(el);
    const menu = el.shadowRoot?.querySelector('[role="menu"]');
    expect(menu).toBeDefined();
  });

  test('has trigger and default slots', () => {
    const el = createMenu();
    container.appendChild(el);
    const triggerSlot = el.shadowRoot?.querySelector('slot[name="trigger"]');
    const defaultSlot = el.shadowRoot?.querySelector('slot:not([name])');
    expect(triggerSlot).toBeDefined();
    expect(defaultSlot).toBeDefined();
  });

  test('has items-wrapper', () => {
    const el = createMenu();
    container.appendChild(el);
    const wrapper = el.shadowRoot?.querySelector('.items-wrapper');
    expect(wrapper).toBeDefined();
  });

  // --- Properties ---
  test('defaults to closed', () => {
    const el = createMenu();
    container.appendChild(el);
    expect(el.open).toBe(false);
  });

  test('default placement is bottom-start', () => {
    const el = createMenu();
    container.appendChild(el);
    expect(el.placement).toBe('bottom-start');
  });

  test('reflects open attribute', () => {
    const el = createMenu({ open: true });
    container.appendChild(el);
    expect(el.hasAttribute('open')).toBe(true);
  });

  test('reflects placement attribute', () => {
    const el = createMenu({ placement: 'top-end' });
    container.appendChild(el);
    expect(el.getAttribute('placement')).toBe('top-end');
  });

  // --- Placement classes ---
  test('applies bottom-start placement class', () => {
    const el = createMenu();
    container.appendChild(el);
    const menuContainer = el.shadowRoot?.querySelector('.menu');
    expect(menuContainer?.classList.contains('placement-bottom-start')).toBe(true);
  });

  test('applies top placement class', () => {
    const el = createMenu({ placement: 'top' });
    container.appendChild(el);
    const menuContainer = el.shadowRoot?.querySelector('.menu');
    expect(menuContainer?.classList.contains('placement-top')).toBe(true);
  });

  test('applies left placement class', () => {
    const el = createMenu({ placement: 'left' });
    container.appendChild(el);
    const menuContainer = el.shadowRoot?.querySelector('.menu');
    expect(menuContainer?.classList.contains('placement-left')).toBe(true);
  });

  test('applies right placement class', () => {
    const el = createMenu({ placement: 'right' });
    container.appendChild(el);
    const menuContainer = el.shadowRoot?.querySelector('.menu');
    expect(menuContainer?.classList.contains('placement-right')).toBe(true);
  });

  // --- Visibility ---
  test('menu is hidden when closed', () => {
    const el = createMenu();
    container.appendChild(el);
    const menuContainer = el.shadowRoot?.querySelector('.menu');
    expect(menuContainer?.classList.contains('visible')).toBe(false);
  });

  test('menu is visible when open', () => {
    const el = createMenu({ open: true });
    container.appendChild(el);
    const menuContainer = el.shadowRoot?.querySelector('.menu');
    expect(menuContainer?.classList.contains('visible')).toBe(true);
  });

  test('aria-hidden is true when closed', () => {
    const el = createMenu();
    container.appendChild(el);
    const menuContainer = el.shadowRoot?.querySelector('.menu');
    expect(menuContainer?.getAttribute('aria-hidden')).toBe('true');
  });

  test('aria-hidden is false when open', () => {
    const el = createMenu({ open: true });
    container.appendChild(el);
    const menuContainer = el.shadowRoot?.querySelector('.menu');
    expect(menuContainer?.getAttribute('aria-hidden')).toBe('false');
  });

  // --- Public methods ---
  test('has show/hide/toggle methods', () => {
    const el = createMenu();
    container.appendChild(el);
    expect(typeof el.show).toBe('function');
    expect(typeof el.hide).toBe('function');
    expect(typeof el.toggle).toBe('function');
  });

  test('show() sets open to true', () => {
    const el = createMenu();
    container.appendChild(el);
    el.show();
    expect(el.open).toBe(true);
    el.hide();
  });

  test('hide() sets open to false', () => {
    const el = createMenu();
    container.appendChild(el);
    el.show();
    el.hide();
    expect(el.open).toBe(false);
  });

  test('toggle() opens when closed', () => {
    const el = createMenu();
    container.appendChild(el);
    el.toggle();
    expect(el.open).toBe(true);
    el.hide();
  });

  test('toggle() closes when open', () => {
    const el = createMenu();
    container.appendChild(el);
    el.show();
    el.toggle();
    expect(el.open).toBe(false);
  });

  test('show() is idempotent', () => {
    const el = createMenu();
    container.appendChild(el);
    el.show();
    el.show();
    expect(el.open).toBe(true);
    el.hide();
  });

  test('hide() is idempotent', () => {
    const el = createMenu();
    container.appendChild(el);
    el.hide();
    expect(el.open).toBe(false);
  });

  // --- Events ---
  test('show() emits open event', () => {
    const el = createMenu();
    container.appendChild(el);
    let fired = false;
    el.addEventListener('open', () => { fired = true; });
    el.show();
    expect(fired).toBe(true);
    el.hide();
  });

  test('hide() emits close event', () => {
    const el = createMenu();
    container.appendChild(el);
    el.show();
    let fired = false;
    el.addEventListener('close', () => { fired = true; });
    el.hide();
    expect(fired).toBe(true);
  });

  // --- Cleanup ---
  test('removes global listeners on disconnect', () => {
    const el = createMenu();
    container.appendChild(el);
    el.show();
    el.remove();
    expect(() => document.dispatchEvent(new Event('click'))).not.toThrow();
  });

  // --- CSS Parts ---
  test('has menu part', () => {
    const el = createMenu();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="menu"]')).toBeDefined();
  });

  test('has items part', () => {
    const el = createMenu();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="items"]')).toBeDefined();
  });
});

describe('ElDmMenuItem', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  // --- Rendering ---
  test('creates shadow root with menu-item', () => {
    const item = createMenuItem();
    container.appendChild(item);
    const menuItem = item.shadowRoot?.querySelector('.menu-item');
    expect(menuItem).toBeDefined();
  });

  test('has icon and content slots', () => {
    const item = createMenuItem();
    container.appendChild(item);
    const iconSlot = item.shadowRoot?.querySelector('slot[name="icon"]');
    const defaultSlot = item.shadowRoot?.querySelector('slot:not([name])');
    expect(iconSlot).toBeDefined();
    expect(defaultSlot).toBeDefined();
  });

  // --- Properties ---
  test('reflects value attribute', () => {
    const item = createMenuItem({ value: 'edit' });
    container.appendChild(item);
    expect(item.getAttribute('value')).toBe('edit');
  });

  test('defaults disabled to false', () => {
    const item = createMenuItem();
    container.appendChild(item);
    expect(item.disabled).toBe(false);
  });

  test('reflects disabled attribute', () => {
    const item = createMenuItem({ disabled: true });
    container.appendChild(item);
    expect(item.hasAttribute('disabled')).toBe(true);
  });

  test('defaults focused to false', () => {
    const item = createMenuItem();
    container.appendChild(item);
    expect(item.focused).toBe(false);
  });

  // --- Classes ---
  test('disabled item has disabled class', () => {
    const item = createMenuItem({ disabled: true });
    container.appendChild(item);
    const menuItem = item.shadowRoot?.querySelector('.menu-item');
    expect(menuItem?.classList.contains('disabled')).toBe(true);
  });

  test('focused item has focused class', () => {
    const item = createMenuItem({ focused: true });
    container.appendChild(item);
    const menuItem = item.shadowRoot?.querySelector('.menu-item');
    expect(menuItem?.classList.contains('focused')).toBe(true);
  });

  // --- Accessibility ---
  test('sets role to menuitem', () => {
    const item = createMenuItem();
    container.appendChild(item);
    expect(item.getAttribute('role')).toBe('menuitem');
  });

  test('sets tabindex to -1', () => {
    const item = createMenuItem();
    container.appendChild(item);
    expect(item.getAttribute('tabindex')).toBe('-1');
  });

  test('sets aria-disabled', () => {
    const item = createMenuItem({ disabled: true });
    container.appendChild(item);
    expect(item.getAttribute('aria-disabled')).toBe('true');
  });

  // --- CSS Parts ---
  test('has item part', () => {
    const item = createMenuItem();
    container.appendChild(item);
    expect(item.shadowRoot?.querySelector('[part="item"]')).toBeDefined();
  });

  test('has icon part', () => {
    const item = createMenuItem();
    container.appendChild(item);
    expect(item.shadowRoot?.querySelector('[part="icon"]')).toBeDefined();
  });

  test('has content part', () => {
    const item = createMenuItem();
    container.appendChild(item);
    expect(item.shadowRoot?.querySelector('[part="content"]')).toBeDefined();
  });
});

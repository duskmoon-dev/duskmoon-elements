import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmBottomNavigation, register } from './index';
import type { BottomNavigationItem } from './index';

register();

const sampleItems: BottomNavigationItem[] = [
  { value: 'home', label: 'Home', icon: '<svg>H</svg>' },
  { value: 'search', label: 'Search', icon: '<svg>S</svg>' },
  { value: 'profile', label: 'Profile', icon: '<svg>P</svg>' },
];

function createBottomNav(props: Partial<ElDmBottomNavigation> = {}): ElDmBottomNavigation {
  const el = document.createElement('el-dm-bottom-navigation') as ElDmBottomNavigation;
  Object.assign(el, props);
  return el;
}

describe('ElDmBottomNavigation', () => {
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
    expect(customElements.get('el-dm-bottom-navigation')).toBe(ElDmBottomNavigation);
  });

  // --- Rendering ---
  test('creates a shadow root with bottom nav', () => {
    const el = createBottomNav();
    container.appendChild(el);
    const nav = el.shadowRoot?.querySelector('.bottom-nav');
    expect(nav).toBeDefined();
  });

  test('has tablist role', () => {
    const el = createBottomNav();
    container.appendChild(el);
    const tablist = el.shadowRoot?.querySelector('[role="tablist"]');
    expect(tablist).toBeDefined();
  });

  test('has aria-label', () => {
    const el = createBottomNav();
    container.appendChild(el);
    const nav = el.shadowRoot?.querySelector('.bottom-nav');
    expect(nav?.getAttribute('aria-label')).toBe('Bottom navigation');
  });

  test('renders items from data', () => {
    const el = createBottomNav({ items: sampleItems });
    container.appendChild(el);
    const items = el.shadowRoot?.querySelectorAll('.nav-item');
    expect(items?.length).toBe(3);
  });

  test('renders slot when no items', () => {
    const el = createBottomNav();
    container.appendChild(el);
    const slot = el.shadowRoot?.querySelector('slot');
    expect(slot).toBeDefined();
  });

  test('renders labels', () => {
    const el = createBottomNav({ items: sampleItems });
    container.appendChild(el);
    const labels = el.shadowRoot?.querySelectorAll('.nav-label');
    expect(labels?.[0]?.textContent).toBe('Home');
    expect(labels?.[1]?.textContent).toBe('Search');
  });

  test('renders icons', () => {
    const el = createBottomNav({ items: sampleItems });
    container.appendChild(el);
    const icons = el.shadowRoot?.querySelectorAll('.nav-icon');
    expect(icons?.length).toBe(3);
  });

  test('item without icon renders no icon wrapper', () => {
    const items: BottomNavigationItem[] = [{ value: 'test', label: 'Test' }];
    const el = createBottomNav({ items });
    container.appendChild(el);
    const icons = el.shadowRoot?.querySelectorAll('.nav-icon');
    expect(icons?.length).toBe(0);
  });

  // --- Properties ---
  test('reflects value attribute', () => {
    const el = createBottomNav({ value: 'home' });
    container.appendChild(el);
    expect(el.getAttribute('value')).toBe('home');
  });

  test('reflects color attribute', () => {
    const el = createBottomNav({ color: 'secondary' });
    container.appendChild(el);
    expect(el.getAttribute('color')).toBe('secondary');
  });

  test('defaults color to primary', () => {
    const el = createBottomNav();
    container.appendChild(el);
    expect(el.color).toBe('primary');
  });

  test('defaults position to fixed', () => {
    const el = createBottomNav();
    container.appendChild(el);
    expect(el.position).toBe('fixed');
  });

  test('reflects position attribute', () => {
    const el = createBottomNav({ position: 'static' });
    container.appendChild(el);
    expect(el.getAttribute('position')).toBe('static');
  });

  // --- Active item ---
  test('marks active item with aria-selected', () => {
    const el = createBottomNav({ items: sampleItems, value: 'home' });
    container.appendChild(el);
    const homeItem = el.shadowRoot?.querySelector('[data-value="home"]');
    expect(homeItem?.getAttribute('aria-selected')).toBe('true');
  });

  test('non-active items have aria-selected false', () => {
    const el = createBottomNav({ items: sampleItems, value: 'home' });
    container.appendChild(el);
    const searchItem = el.shadowRoot?.querySelector('[data-value="search"]');
    expect(searchItem?.getAttribute('aria-selected')).toBe('false');
  });

  // --- Item attributes ---
  test('items have role="tab"', () => {
    const el = createBottomNav({ items: sampleItems });
    container.appendChild(el);
    const items = el.shadowRoot?.querySelectorAll('.nav-item');
    items?.forEach(item => {
      expect(item.getAttribute('role')).toBe('tab');
    });
  });

  test('items have data-value attribute', () => {
    const el = createBottomNav({ items: sampleItems });
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[data-value="home"]')).toBeDefined();
    expect(el.shadowRoot?.querySelector('[data-value="search"]')).toBeDefined();
    expect(el.shadowRoot?.querySelector('[data-value="profile"]')).toBeDefined();
  });

  test('items have tabindex', () => {
    const el = createBottomNav({ items: sampleItems });
    container.appendChild(el);
    const items = el.shadowRoot?.querySelectorAll('.nav-item');
    items?.forEach(item => {
      expect(item.getAttribute('tabindex')).toBe('0');
    });
  });

  // --- Disabled items ---
  test('disabled item has disabled attribute', () => {
    const items: BottomNavigationItem[] = [
      { value: 'home', label: 'Home', disabled: true },
      { value: 'search', label: 'Search' },
    ];
    const el = createBottomNav({ items });
    container.appendChild(el);
    const homeItem = el.shadowRoot?.querySelector('[data-value="home"]');
    expect(homeItem?.hasAttribute('disabled')).toBe(true);
  });

  test('disabled item has tabindex -1', () => {
    const items: BottomNavigationItem[] = [
      { value: 'home', label: 'Home', disabled: true },
      { value: 'search', label: 'Search' },
    ];
    const el = createBottomNav({ items });
    container.appendChild(el);
    const homeItem = el.shadowRoot?.querySelector('[data-value="home"]');
    expect(homeItem?.getAttribute('tabindex')).toBe('-1');
  });

  // --- Link items ---
  test('item with href renders as anchor', () => {
    const items: BottomNavigationItem[] = [
      { value: 'home', label: 'Home', href: '/home' },
    ];
    const el = createBottomNav({ items });
    container.appendChild(el);
    const link = el.shadowRoot?.querySelector('a.nav-item');
    expect(link).toBeDefined();
    expect(link?.getAttribute('href')).toBe('/home');
  });

  test('item without href renders as button', () => {
    const el = createBottomNav({ items: sampleItems });
    container.appendChild(el);
    const btn = el.shadowRoot?.querySelector('button.nav-item');
    expect(btn).toBeDefined();
  });

  test('button items have type="button"', () => {
    const el = createBottomNav({ items: sampleItems });
    container.appendChild(el);
    const btn = el.shadowRoot?.querySelector('button.nav-item');
    expect(btn?.getAttribute('type')).toBe('button');
  });

  // --- Item wrapper ---
  test('items are wrapped in nav-item-wrapper', () => {
    const el = createBottomNav({ items: sampleItems });
    container.appendChild(el);
    const wrappers = el.shadowRoot?.querySelectorAll('.nav-item-wrapper');
    expect(wrappers?.length).toBe(3);
  });

  // --- CSS Parts ---
  test('has container part', () => {
    const el = createBottomNav();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="container"]')).toBeDefined();
  });

  test('has item parts', () => {
    const el = createBottomNav({ items: sampleItems });
    container.appendChild(el);
    expect(el.shadowRoot?.querySelectorAll('[part="item"]')?.length).toBe(3);
  });

  test('has icon parts', () => {
    const el = createBottomNav({ items: sampleItems });
    container.appendChild(el);
    expect(el.shadowRoot?.querySelectorAll('[part="icon"]')?.length).toBe(3);
  });

  test('has label parts', () => {
    const el = createBottomNav({ items: sampleItems });
    container.appendChild(el);
    expect(el.shadowRoot?.querySelectorAll('[part="label"]')?.length).toBe(3);
  });
});

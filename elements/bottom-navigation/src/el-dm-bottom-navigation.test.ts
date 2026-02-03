import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmBottomNavigation, register } from './index';

register();

describe('ElDmBottomNavigation', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('is defined', () => {
    expect(customElements.get('el-dm-bottom-navigation')).toBe(ElDmBottomNavigation);
  });

  test('creates a shadow root with bottom nav', () => {
    const el = document.createElement('el-dm-bottom-navigation') as ElDmBottomNavigation;
    container.appendChild(el);

    const nav = el.shadowRoot?.querySelector('.bottom-nav');
    expect(nav).toBeDefined();
  });

  test('has tablist role', () => {
    const el = document.createElement('el-dm-bottom-navigation') as ElDmBottomNavigation;
    container.appendChild(el);

    const tablist = el.shadowRoot?.querySelector('[role="tablist"]');
    expect(tablist).toBeDefined();
  });

  test('renders items from data', () => {
    const el = document.createElement('el-dm-bottom-navigation') as ElDmBottomNavigation;
    el.items = [
      { value: 'home', label: 'Home', icon: 'H' },
      { value: 'search', label: 'Search', icon: 'S' },
    ] as any;
    container.appendChild(el);

    const items = el.shadowRoot?.querySelectorAll('.nav-item');
    expect(items?.length).toBe(2);
  });

  test('marks active item', () => {
    const el = document.createElement('el-dm-bottom-navigation') as ElDmBottomNavigation;
    el.items = [
      { value: 'home', label: 'Home', icon: 'H' },
      { value: 'search', label: 'Search', icon: 'S' },
    ] as any;
    el.value = 'home';
    container.appendChild(el);

    const active = el.shadowRoot?.querySelector('.active');
    expect(active).toBeDefined();
  });

  test('reflects value attribute', () => {
    const el = document.createElement('el-dm-bottom-navigation') as ElDmBottomNavigation;
    el.value = 'home';
    container.appendChild(el);

    expect(el.getAttribute('value')).toBe('home');
  });

  test('has default slot', () => {
    const el = document.createElement('el-dm-bottom-navigation') as ElDmBottomNavigation;
    container.appendChild(el);

    const slot = el.shadowRoot?.querySelector('slot');
    expect(slot).toBeDefined();
  });
});

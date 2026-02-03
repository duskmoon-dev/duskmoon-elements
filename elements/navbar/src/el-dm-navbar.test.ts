import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmNavbar, register } from './index';

register();

describe('ElDmNavbar', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('is defined', () => {
    expect(customElements.get('el-dm-navbar')).toBe(ElDmNavbar);
  });

  test('creates a shadow root with navigation role', () => {
    const el = document.createElement('el-dm-navbar') as ElDmNavbar;
    container.appendChild(el);

    const nav = el.shadowRoot?.querySelector('[role="navigation"]');
    expect(nav).toBeDefined();
  });

  test('has start, default, end, and mobile slots', () => {
    const el = document.createElement('el-dm-navbar') as ElDmNavbar;
    container.appendChild(el);

    const startSlot = el.shadowRoot?.querySelector('slot[name="start"]');
    const defaultSlot = el.shadowRoot?.querySelector('slot:not([name])');
    const endSlot = el.shadowRoot?.querySelector('slot[name="end"]');
    const mobileSlot = el.shadowRoot?.querySelector('slot[name="mobile"]');

    expect(startSlot).toBeDefined();
    expect(defaultSlot).toBeDefined();
    expect(endSlot).toBeDefined();
    expect(mobileSlot).toBeDefined();
  });

  test('reflects fixed attribute', () => {
    const el = document.createElement('el-dm-navbar') as ElDmNavbar;
    el.fixed = true;
    container.appendChild(el);

    expect(el.hasAttribute('fixed')).toBe(true);
  });

  test('reflects elevated attribute', () => {
    const el = document.createElement('el-dm-navbar') as ElDmNavbar;
    el.elevated = true;
    container.appendChild(el);

    expect(el.hasAttribute('elevated')).toBe(true);
    const navbar = el.shadowRoot?.querySelector('.navbar');
    expect(navbar?.classList.contains('navbar-elevated')).toBe(true);
  });

  test('applies color classes', () => {
    const el = document.createElement('el-dm-navbar') as ElDmNavbar;
    el.color = 'primary';
    container.appendChild(el);

    const navbar = el.shadowRoot?.querySelector('.navbar');
    expect(navbar?.classList.contains('navbar-primary')).toBe(true);
  });

  test('has hamburger button for mobile', () => {
    const el = document.createElement('el-dm-navbar') as ElDmNavbar;
    container.appendChild(el);

    const hamburger = el.shadowRoot?.querySelector('.navbar-hamburger');
    expect(hamburger).toBeDefined();
  });
});

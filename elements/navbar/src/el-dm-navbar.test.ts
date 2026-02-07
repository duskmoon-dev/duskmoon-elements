import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmNavbar, register } from './index';

register();

function createNavbar(props: Partial<ElDmNavbar> = {}): ElDmNavbar {
  const el = document.createElement('el-dm-navbar') as ElDmNavbar;
  Object.assign(el, props);
  return el;
}

describe('ElDmNavbar', () => {
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
    expect(customElements.get('el-dm-navbar')).toBe(ElDmNavbar);
  });

  // --- Rendering ---
  test('creates a shadow root with navigation role', () => {
    const el = createNavbar();
    container.appendChild(el);
    const nav = el.shadowRoot?.querySelector('[role="navigation"]');
    expect(nav).toBeDefined();
  });

  test('has navbar element', () => {
    const el = createNavbar();
    container.appendChild(el);
    const navbar = el.shadowRoot?.querySelector('.navbar');
    expect(navbar).toBeDefined();
  });

  test('has navbar-content wrapper', () => {
    const el = createNavbar();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('.navbar-content')).toBeDefined();
  });

  // --- Slots ---
  test('has start slot', () => {
    const el = createNavbar();
    container.appendChild(el);
    const startSlot = el.shadowRoot?.querySelector('slot[name="start"]');
    expect(startSlot).toBeDefined();
  });

  test('has default slot', () => {
    const el = createNavbar();
    container.appendChild(el);
    const defaultSlot = el.shadowRoot?.querySelector('slot:not([name])');
    expect(defaultSlot).toBeDefined();
  });

  test('has end slot', () => {
    const el = createNavbar();
    container.appendChild(el);
    const endSlot = el.shadowRoot?.querySelector('slot[name="end"]');
    expect(endSlot).toBeDefined();
  });

  test('has mobile slot', () => {
    const el = createNavbar();
    container.appendChild(el);
    const mobileSlot = el.shadowRoot?.querySelector('slot[name="mobile"]');
    expect(mobileSlot).toBeDefined();
  });

  // --- Properties ---
  test('reflects fixed attribute', () => {
    const el = createNavbar({ fixed: true });
    container.appendChild(el);
    expect(el.hasAttribute('fixed')).toBe(true);
  });

  test('reflects elevated attribute', () => {
    const el = createNavbar({ elevated: true });
    container.appendChild(el);
    expect(el.hasAttribute('elevated')).toBe(true);
  });

  test('reflects color attribute', () => {
    const el = createNavbar({ color: 'primary' });
    container.appendChild(el);
    expect(el.getAttribute('color')).toBe('primary');
  });

  // --- Color classes ---
  test('applies primary color class', () => {
    const el = createNavbar({ color: 'primary' });
    container.appendChild(el);
    const navbar = el.shadowRoot?.querySelector('.navbar');
    expect(navbar?.classList.contains('navbar-primary')).toBe(true);
  });

  test('applies secondary color class', () => {
    const el = createNavbar({ color: 'secondary' });
    container.appendChild(el);
    const navbar = el.shadowRoot?.querySelector('.navbar');
    expect(navbar?.classList.contains('navbar-secondary')).toBe(true);
  });

  test('applies tertiary color class', () => {
    const el = createNavbar({ color: 'tertiary' });
    container.appendChild(el);
    const navbar = el.shadowRoot?.querySelector('.navbar');
    expect(navbar?.classList.contains('navbar-tertiary')).toBe(true);
  });

  test('surface color has no extra class', () => {
    const el = createNavbar({ color: 'surface' });
    container.appendChild(el);
    const navbar = el.shadowRoot?.querySelector('.navbar');
    expect(navbar?.classList.contains('navbar-surface')).toBe(false);
  });

  test('no color has no extra class', () => {
    const el = createNavbar();
    container.appendChild(el);
    const navbar = el.shadowRoot?.querySelector('.navbar');
    expect(navbar?.classList.contains('navbar-undefined')).toBe(false);
  });

  // --- Elevated ---
  test('applies elevated class', () => {
    const el = createNavbar({ elevated: true });
    container.appendChild(el);
    const navbar = el.shadowRoot?.querySelector('.navbar');
    expect(navbar?.classList.contains('navbar-elevated')).toBe(true);
  });

  test('no elevated class when not elevated', () => {
    const el = createNavbar();
    container.appendChild(el);
    const navbar = el.shadowRoot?.querySelector('.navbar');
    expect(navbar?.classList.contains('navbar-elevated')).toBe(false);
  });

  // --- Hamburger ---
  test('has hamburger button', () => {
    const el = createNavbar();
    container.appendChild(el);
    const hamburger = el.shadowRoot?.querySelector('.navbar-hamburger');
    expect(hamburger).toBeDefined();
  });

  test('hamburger has aria-label', () => {
    const el = createNavbar();
    container.appendChild(el);
    const hamburger = el.shadowRoot?.querySelector('.navbar-hamburger');
    expect(hamburger?.getAttribute('aria-label')).toBeDefined();
  });

  test('hamburger has aria-expanded', () => {
    const el = createNavbar();
    container.appendChild(el);
    const hamburger = el.shadowRoot?.querySelector('.navbar-hamburger');
    expect(hamburger?.getAttribute('aria-expanded')).toBe('false');
  });

  test('hamburger has aria-controls', () => {
    const el = createNavbar();
    container.appendChild(el);
    const hamburger = el.shadowRoot?.querySelector('.navbar-hamburger');
    expect(hamburger?.getAttribute('aria-controls')).toBe('mobile-menu');
  });

  test('hamburger has three lines', () => {
    const el = createNavbar();
    container.appendChild(el);
    const lines = el.shadowRoot?.querySelectorAll('.hamburger-line');
    expect(lines?.length).toBe(3);
  });

  // --- Mobile menu ---
  test('has mobile menu', () => {
    const el = createNavbar();
    container.appendChild(el);
    const mobileMenu = el.shadowRoot?.querySelector('.navbar-mobile-menu');
    expect(mobileMenu).toBeDefined();
  });

  test('mobile menu starts closed', () => {
    const el = createNavbar();
    container.appendChild(el);
    const mobileMenu = el.shadowRoot?.querySelector('.navbar-mobile-menu');
    expect(mobileMenu?.classList.contains('open')).toBe(false);
  });

  test('mobile menu has id for aria-controls', () => {
    const el = createNavbar();
    container.appendChild(el);
    const mobileMenu = el.shadowRoot?.querySelector('#mobile-menu');
    expect(mobileMenu).toBeDefined();
  });

  test('mobile menu has aria-hidden when closed', () => {
    const el = createNavbar();
    container.appendChild(el);
    const mobileMenu = el.shadowRoot?.querySelector('.navbar-mobile-menu');
    expect(mobileMenu?.getAttribute('aria-hidden')).toBe('true');
  });

  // --- Public methods ---
  test('has closeMobileMenu method', () => {
    const el = createNavbar();
    container.appendChild(el);
    expect(typeof el.closeMobileMenu).toBe('function');
  });

  test('has openMobileMenu method', () => {
    const el = createNavbar();
    container.appendChild(el);
    expect(typeof el.openMobileMenu).toBe('function');
  });

  test('openMobileMenu emits menu-toggle event', () => {
    const el = createNavbar();
    container.appendChild(el);
    let detail: { open: boolean } | null = null;
    el.addEventListener('menu-toggle', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
    el.openMobileMenu();
    expect(detail).toEqual({ open: true });
    el.closeMobileMenu();
  });

  test('closeMobileMenu emits menu-toggle event', () => {
    const el = createNavbar();
    container.appendChild(el);
    el.openMobileMenu();
    let detail: { open: boolean } | null = null;
    el.addEventListener('menu-toggle', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
    el.closeMobileMenu();
    expect(detail).toEqual({ open: false });
  });

  test('closeMobileMenu is no-op when already closed', () => {
    const el = createNavbar();
    container.appendChild(el);
    let fired = false;
    el.addEventListener('menu-toggle', () => { fired = true; });
    el.closeMobileMenu();
    expect(fired).toBe(false);
  });

  test('openMobileMenu is no-op when already open', () => {
    const el = createNavbar();
    container.appendChild(el);
    el.openMobileMenu();
    let fired = false;
    el.addEventListener('menu-toggle', () => { fired = true; });
    el.openMobileMenu();
    expect(fired).toBe(false);
    el.closeMobileMenu();
  });

  // --- Layout sections ---
  test('has start section', () => {
    const el = createNavbar();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('.navbar-start')).toBeDefined();
  });

  test('has center section', () => {
    const el = createNavbar();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('.navbar-center')).toBeDefined();
  });

  test('has end section', () => {
    const el = createNavbar();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('.navbar-end')).toBeDefined();
  });

  // --- CSS Parts ---
  test('has navbar part', () => {
    const el = createNavbar();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="navbar"]')).toBeDefined();
  });

  test('has content part', () => {
    const el = createNavbar();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="content"]')).toBeDefined();
  });

  test('has start part', () => {
    const el = createNavbar();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="start"]')).toBeDefined();
  });

  test('has center part', () => {
    const el = createNavbar();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="center"]')).toBeDefined();
  });

  test('has end part', () => {
    const el = createNavbar();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="end"]')).toBeDefined();
  });

  test('has hamburger part', () => {
    const el = createNavbar();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="hamburger"]')).toBeDefined();
  });

  test('has mobile-menu part', () => {
    const el = createNavbar();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="mobile-menu"]')).toBeDefined();
  });
});

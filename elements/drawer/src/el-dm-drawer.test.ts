import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmDrawer, register } from './index';

register();

function createDrawer(props: Partial<ElDmDrawer> = {}): ElDmDrawer {
  const el = document.createElement('el-dm-drawer') as ElDmDrawer;
  Object.assign(el, props);
  return el;
}

describe('ElDmDrawer', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    document.body.style.overflow = '';
  });

  // --- Registration ---
  test('is defined', () => {
    expect(customElements.get('el-dm-drawer')).toBe(ElDmDrawer);
  });

  // --- Rendering ---
  test('creates a shadow root with dialog role', () => {
    const el = createDrawer();
    container.appendChild(el);
    const dialog = el.shadowRoot?.querySelector('[role="dialog"]');
    expect(dialog).toBeDefined();
  });

  test('has header, default, and footer slots', () => {
    const el = createDrawer();
    container.appendChild(el);
    const headerSlot = el.shadowRoot?.querySelector('slot[name="header"]');
    const defaultSlot = el.shadowRoot?.querySelector('slot:not([name])');
    const footerSlot = el.shadowRoot?.querySelector('slot[name="footer"]');
    expect(headerSlot).toBeDefined();
    expect(defaultSlot).toBeDefined();
    expect(footerSlot).toBeDefined();
  });

  test('has close button', () => {
    const el = createDrawer();
    container.appendChild(el);
    const closeBtn = el.shadowRoot?.querySelector('.drawer-close');
    expect(closeBtn).toBeDefined();
  });

  test('close button has aria-label', () => {
    const el = createDrawer();
    container.appendChild(el);
    const closeBtn = el.shadowRoot?.querySelector('.drawer-close');
    expect(closeBtn?.getAttribute('aria-label')).toBe('Close drawer');
  });

  test('has drawer-wrapper', () => {
    const el = createDrawer();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('.drawer-wrapper')).toBeDefined();
  });

  // --- Position ---
  test('default position is left', () => {
    const el = createDrawer();
    container.appendChild(el);
    const drawer = el.shadowRoot?.querySelector('.drawer');
    expect(drawer?.classList.contains('drawer-left')).toBe(true);
  });

  test('applies right position class', () => {
    const el = createDrawer({ position: 'right' });
    container.appendChild(el);
    const drawer = el.shadowRoot?.querySelector('.drawer');
    expect(drawer?.classList.contains('drawer-right')).toBe(true);
  });

  test('reflects position attribute', () => {
    const el = createDrawer({ position: 'right' });
    container.appendChild(el);
    expect(el.getAttribute('position')).toBe('right');
  });

  // --- Open state ---
  test('defaults to closed', () => {
    const el = createDrawer();
    container.appendChild(el);
    expect(el.open).toBeFalsy();
  });

  test('reflects open attribute', () => {
    const el = createDrawer({ open: true });
    container.appendChild(el);
    expect(el.hasAttribute('open')).toBe(true);
  });

  test('wrapper has open class when initially open', () => {
    const el = createDrawer({ open: true });
    container.appendChild(el);
    const wrapper = el.shadowRoot?.querySelector('.drawer-wrapper');
    expect(wrapper?.classList.contains('open')).toBe(true);
  });

  test('wrapper does not have open class when closed', () => {
    const el = createDrawer();
    container.appendChild(el);
    const wrapper = el.shadowRoot?.querySelector('.drawer-wrapper');
    expect(wrapper?.classList.contains('open')).toBe(false);
  });

  // --- Public methods ---
  test('has show/hide/toggle methods', () => {
    const el = createDrawer();
    container.appendChild(el);
    expect(typeof el.show).toBe('function');
    expect(typeof el.hide).toBe('function');
    expect(typeof el.toggle).toBe('function');
  });

  test('show() sets open to true', () => {
    const el = createDrawer();
    container.appendChild(el);
    el.show();
    expect(el.open).toBe(true);
    el.hide();
  });

  test('hide() sets open to false', () => {
    const el = createDrawer();
    container.appendChild(el);
    el.show();
    el.hide();
    expect(el.open).toBe(false);
  });

  test('toggle() opens when closed', () => {
    const el = createDrawer();
    container.appendChild(el);
    el.toggle();
    expect(el.open).toBe(true);
    el.hide();
  });

  test('toggle() closes when open', () => {
    const el = createDrawer();
    container.appendChild(el);
    el.show();
    el.toggle();
    expect(el.open).toBe(false);
  });

  // --- Events ---
  test('show() emits open event', () => {
    const el = createDrawer();
    container.appendChild(el);
    let fired = false;
    el.addEventListener('open', () => { fired = true; });
    el.show();
    expect(fired).toBe(true);
    el.hide();
  });

  test('hide() emits close event', () => {
    const el = createDrawer();
    container.appendChild(el);
    el.show();
    let fired = false;
    el.addEventListener('close', () => { fired = true; });
    el.hide();
    expect(fired).toBe(true);
  });

  // --- Modal mode ---
  test('modal attribute is reflected', () => {
    const el = createDrawer({ modal: true });
    container.appendChild(el);
    expect(el.hasAttribute('modal')).toBe(true);
  });

  test('modal renders backdrop', () => {
    const el = createDrawer({ modal: true });
    container.appendChild(el);
    const backdrop = el.shadowRoot?.querySelector('.drawer-backdrop');
    expect(backdrop).toBeDefined();
  });

  test('non-modal has no backdrop', () => {
    const el = createDrawer();
    container.appendChild(el);
    const backdrop = el.shadowRoot?.querySelector('.drawer-backdrop');
    expect(backdrop).toBeNull();
  });

  test('modal show() sets body overflow hidden', () => {
    const el = createDrawer({ modal: true });
    container.appendChild(el);
    el.show();
    expect(document.body.style.overflow).toBe('hidden');
    el.hide();
  });

  test('modal hide() restores body overflow', () => {
    const el = createDrawer({ modal: true });
    container.appendChild(el);
    el.show();
    el.hide();
    expect(document.body.style.overflow).toBe('');
  });

  test('aria-modal is true for modal drawer', () => {
    const el = createDrawer({ modal: true });
    container.appendChild(el);
    const drawer = el.shadowRoot?.querySelector('.drawer');
    expect(drawer?.getAttribute('aria-modal')).toBe('true');
  });

  test('aria-modal is false for non-modal drawer', () => {
    const el = createDrawer();
    container.appendChild(el);
    const drawer = el.shadowRoot?.querySelector('.drawer');
    expect(drawer?.getAttribute('aria-modal')).toBe('false');
  });

  // --- Custom width ---
  test('applies custom width via CSS variable', () => {
    const el = createDrawer({ width: '400px' });
    container.appendChild(el);
    const drawer = el.shadowRoot?.querySelector('.drawer') as HTMLElement;
    expect(drawer?.getAttribute('style')).toContain('--drawer-width: 400px');
  });

  test('no width style when width not set', () => {
    const el = createDrawer();
    container.appendChild(el);
    const drawer = el.shadowRoot?.querySelector('.drawer') as HTMLElement;
    expect(drawer?.getAttribute('style')).toBe('');
  });

  // --- Disconnected cleanup ---
  test('disconnectedCallback restores body overflow', () => {
    const el = createDrawer({ modal: true });
    container.appendChild(el);
    el.show();
    el.remove();
    expect(document.body.style.overflow).toBe('');
  });

  // --- CSS Parts ---
  test('has drawer part', () => {
    const el = createDrawer();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="drawer"]')).toBeDefined();
  });

  test('has header part', () => {
    const el = createDrawer();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="header"]')).toBeDefined();
  });

  test('has body part', () => {
    const el = createDrawer();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="body"]')).toBeDefined();
  });

  test('has footer part', () => {
    const el = createDrawer();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="footer"]')).toBeDefined();
  });

  test('has close part', () => {
    const el = createDrawer();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="close"]')).toBeDefined();
  });

  test('has wrapper part', () => {
    const el = createDrawer();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="wrapper"]')).toBeDefined();
  });

  test('modal has backdrop part', () => {
    const el = createDrawer({ modal: true });
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="backdrop"]')).toBeDefined();
  });
});

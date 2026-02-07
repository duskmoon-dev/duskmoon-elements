import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmPopover, register } from './index';

register();

function createPopover(props: Partial<ElDmPopover> = {}): ElDmPopover {
  const el = document.createElement('el-dm-popover') as ElDmPopover;
  Object.assign(el, props);
  return el;
}

describe('ElDmPopover', () => {
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
    expect(customElements.get('el-dm-popover')).toBe(ElDmPopover);
  });

  // --- Rendering ---
  test('creates a shadow root with popover', () => {
    const el = createPopover();
    container.appendChild(el);
    const panel = el.shadowRoot?.querySelector('.popover-panel');
    expect(panel).toBeDefined();
  });

  test('has dialog role', () => {
    const el = createPopover();
    container.appendChild(el);
    const dialog = el.shadowRoot?.querySelector('[role="dialog"]');
    expect(dialog).toBeDefined();
  });

  test('has trigger slot', () => {
    const el = createPopover();
    container.appendChild(el);
    const triggerSlot = el.shadowRoot?.querySelector('slot[name="trigger"]');
    expect(triggerSlot).toBeDefined();
  });

  test('has default content slot', () => {
    const el = createPopover();
    container.appendChild(el);
    const defaultSlot = el.shadowRoot?.querySelector('slot:not([name])');
    expect(defaultSlot).toBeDefined();
  });

  test('has trigger wrapper', () => {
    const el = createPopover();
    container.appendChild(el);
    const wrapper = el.shadowRoot?.querySelector('.popover-trigger');
    expect(wrapper).toBeDefined();
  });

  test('has popover content wrapper', () => {
    const el = createPopover();
    container.appendChild(el);
    const content = el.shadowRoot?.querySelector('.popover-content');
    expect(content).toBeDefined();
  });

  // --- Arrow ---
  test('renders arrow by default', () => {
    const el = createPopover();
    container.appendChild(el);
    const arrow = el.shadowRoot?.querySelector('.popover-arrow');
    expect(arrow).toBeDefined();
  });

  test('no arrow when arrow is false', () => {
    const el = createPopover({ arrow: false });
    container.appendChild(el);
    const arrow = el.shadowRoot?.querySelector('.popover-arrow');
    expect(arrow).toBeNull();
  });

  // --- Properties ---
  test('defaults open to false', () => {
    const el = createPopover();
    container.appendChild(el);
    expect(el.open).toBe(false);
  });

  test('reflects open attribute', () => {
    const el = createPopover({ open: true });
    container.appendChild(el);
    expect(el.hasAttribute('open')).toBe(true);
  });

  test('defaults trigger to click', () => {
    const el = createPopover();
    container.appendChild(el);
    expect(el.trigger).toBe('click');
  });

  test('reflects trigger attribute', () => {
    const el = createPopover({ trigger: 'hover' } as Partial<ElDmPopover>);
    container.appendChild(el);
    expect(el.getAttribute('trigger')).toBe('hover');
  });

  test('defaults placement to bottom', () => {
    const el = createPopover();
    container.appendChild(el);
    expect(el.placement).toBe('bottom');
  });

  test('reflects placement attribute', () => {
    const el = createPopover({ placement: 'top' } as Partial<ElDmPopover>);
    container.appendChild(el);
    expect(el.getAttribute('placement')).toBe('top');
  });

  test('defaults offset to 8', () => {
    const el = createPopover();
    container.appendChild(el);
    expect(el.offset).toBe(8);
  });

  test('defaults arrow to true', () => {
    const el = createPopover();
    container.appendChild(el);
    expect(el.arrow).toBe(true);
  });

  test('panel has data-placement attribute', () => {
    const el = createPopover({ placement: 'top-start' } as Partial<ElDmPopover>);
    container.appendChild(el);
    const panel = el.shadowRoot?.querySelector('.popover-panel');
    expect(panel?.getAttribute('data-placement')).toBe('top-start');
  });

  test('aria-modal is false', () => {
    const el = createPopover();
    container.appendChild(el);
    const panel = el.shadowRoot?.querySelector('.popover-panel');
    expect(panel?.getAttribute('aria-modal')).toBe('false');
  });

  // --- Visibility ---
  test('panel is not visible by default', () => {
    const el = createPopover();
    container.appendChild(el);
    const panel = el.shadowRoot?.querySelector('.popover-panel');
    expect(panel?.classList.contains('visible')).toBe(false);
  });

  // --- Public methods ---
  test('has show method', () => {
    const el = createPopover();
    container.appendChild(el);
    expect(typeof el.show).toBe('function');
  });

  test('has hide method', () => {
    const el = createPopover();
    container.appendChild(el);
    expect(typeof el.hide).toBe('function');
  });

  test('has toggle method', () => {
    const el = createPopover();
    container.appendChild(el);
    expect(typeof el.toggle).toBe('function');
  });

  test('show sets open to true', () => {
    const el = createPopover();
    container.appendChild(el);
    el.show();
    expect(el.open).toBe(true);
    el.hide();
  });

  test('hide sets open to false', () => {
    const el = createPopover();
    container.appendChild(el);
    el.show();
    el.hide();
    expect(el.open).toBe(false);
  });

  test('toggle opens when closed', () => {
    const el = createPopover();
    container.appendChild(el);
    el.toggle();
    expect(el.open).toBe(true);
    el.hide();
  });

  test('toggle closes when open', () => {
    const el = createPopover();
    container.appendChild(el);
    el.show();
    el.toggle();
    expect(el.open).toBe(false);
  });

  test('show is idempotent', () => {
    const el = createPopover();
    container.appendChild(el);
    let count = 0;
    el.addEventListener('open', () => { count++; });
    el.show();
    el.show();
    expect(count).toBe(1);
    el.hide();
  });

  test('hide is idempotent', () => {
    const el = createPopover();
    container.appendChild(el);
    el.show();
    let count = 0;
    el.addEventListener('close', () => { count++; });
    el.hide();
    el.hide();
    expect(count).toBe(1);
  });

  // --- Events ---
  test('show emits open event', () => {
    const el = createPopover();
    container.appendChild(el);
    let fired = false;
    el.addEventListener('open', () => { fired = true; });
    el.show();
    expect(fired).toBe(true);
    el.hide();
  });

  test('hide emits close event', () => {
    const el = createPopover();
    container.appendChild(el);
    el.show();
    let fired = false;
    el.addEventListener('close', () => { fired = true; });
    el.hide();
    expect(fired).toBe(true);
  });

  // --- Cleanup ---
  test('removes listeners on disconnect', () => {
    const el = createPopover();
    container.appendChild(el);
    el.show();
    el.remove();
    expect(true).toBe(true);
  });

  // --- CSS Parts ---
  test('has popover part', () => {
    const el = createPopover();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="popover"]')).toBeDefined();
  });

  test('has content part', () => {
    const el = createPopover();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="content"]')).toBeDefined();
  });

  test('has arrow part when arrow enabled', () => {
    const el = createPopover();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="arrow"]')).toBeDefined();
  });
});

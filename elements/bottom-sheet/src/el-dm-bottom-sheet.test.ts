import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmBottomSheet, register } from './index';

register();

function createBottomSheet(props: Partial<ElDmBottomSheet> = {}): ElDmBottomSheet {
  const el = document.createElement('el-dm-bottom-sheet') as ElDmBottomSheet;
  Object.assign(el, props);
  return el;
}

describe('ElDmBottomSheet', () => {
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
    expect(customElements.get('el-dm-bottom-sheet')).toBe(ElDmBottomSheet);
  });

  // --- Rendering ---
  test('creates a shadow root with bottom sheet', () => {
    const el = createBottomSheet();
    container.appendChild(el);
    const sheet = el.shadowRoot?.querySelector('.bottom-sheet');
    expect(sheet).toBeDefined();
  });

  test('has dialog role', () => {
    const el = createBottomSheet();
    container.appendChild(el);
    const dialog = el.shadowRoot?.querySelector('[role="dialog"]');
    expect(dialog).toBeDefined();
  });

  test('has drag handle', () => {
    const el = createBottomSheet();
    container.appendChild(el);
    const handle = el.shadowRoot?.querySelector('.bottom-sheet-handle');
    expect(handle).toBeDefined();
  });

  test('has handle area', () => {
    const el = createBottomSheet();
    container.appendChild(el);
    const area = el.shadowRoot?.querySelector('.bottom-sheet-handle-area');
    expect(area).toBeDefined();
  });

  test('has header slot', () => {
    const el = createBottomSheet();
    container.appendChild(el);
    const headerSlot = el.shadowRoot?.querySelector('slot[name="header"]');
    expect(headerSlot).toBeDefined();
  });

  test('has default slot', () => {
    const el = createBottomSheet();
    container.appendChild(el);
    const defaultSlot = el.shadowRoot?.querySelector('slot:not([name])');
    expect(defaultSlot).toBeDefined();
  });

  test('has content area', () => {
    const el = createBottomSheet();
    container.appendChild(el);
    const content = el.shadowRoot?.querySelector('.bottom-sheet-content');
    expect(content).toBeDefined();
  });

  test('has header section', () => {
    const el = createBottomSheet();
    container.appendChild(el);
    const header = el.shadowRoot?.querySelector('.bottom-sheet-header');
    expect(header).toBeDefined();
  });

  test('has wrapper', () => {
    const el = createBottomSheet();
    container.appendChild(el);
    const wrapper = el.shadowRoot?.querySelector('.bottom-sheet-wrapper');
    expect(wrapper).toBeDefined();
  });

  // --- Properties ---
  test('reflects open attribute', () => {
    const el = createBottomSheet({ open: true });
    container.appendChild(el);
    expect(el.hasAttribute('open')).toBe(true);
  });

  test('reflects modal attribute', () => {
    const el = createBottomSheet({ modal: true });
    container.appendChild(el);
    expect(el.hasAttribute('modal')).toBe(true);
  });

  test('reflects persistent attribute', () => {
    const el = createBottomSheet({ persistent: true });
    container.appendChild(el);
    expect(el.hasAttribute('persistent')).toBe(true);
  });

  test('reflects snap-points attribute', () => {
    const el = createBottomSheet({ snapPoints: '25,50,100' });
    container.appendChild(el);
    expect(el.getAttribute('snap-points')).toBe('25,50,100');
  });

  // --- Open state ---
  test('wrapper has open class when open', () => {
    const el = createBottomSheet({ open: true });
    container.appendChild(el);
    const wrapper = el.shadowRoot?.querySelector('.bottom-sheet-wrapper');
    expect(wrapper?.classList.contains('open')).toBe(true);
  });

  test('wrapper does not have open class when closed', () => {
    const el = createBottomSheet();
    container.appendChild(el);
    const wrapper = el.shadowRoot?.querySelector('.bottom-sheet-wrapper');
    expect(wrapper?.classList.contains('open')).toBe(false);
  });

  // --- Modal ---
  test('renders backdrop in modal mode', () => {
    const el = createBottomSheet({ modal: true });
    container.appendChild(el);
    const backdrop = el.shadowRoot?.querySelector('.bottom-sheet-backdrop');
    expect(backdrop).toBeDefined();
  });

  test('no backdrop in non-modal mode', () => {
    const el = createBottomSheet();
    container.appendChild(el);
    const backdrop = el.shadowRoot?.querySelector('.bottom-sheet-backdrop');
    expect(backdrop).toBeNull();
  });

  test('aria-modal is true when modal', () => {
    const el = createBottomSheet({ modal: true });
    container.appendChild(el);
    const sheet = el.shadowRoot?.querySelector('.bottom-sheet');
    expect(sheet?.getAttribute('aria-modal')).toBe('true');
  });

  test('aria-modal is false when not modal', () => {
    const el = createBottomSheet();
    container.appendChild(el);
    const sheet = el.shadowRoot?.querySelector('.bottom-sheet');
    expect(sheet?.getAttribute('aria-modal')).toBe('false');
  });

  test('sheet has tabindex -1 for focus management', () => {
    const el = createBottomSheet();
    container.appendChild(el);
    const sheet = el.shadowRoot?.querySelector('.bottom-sheet');
    expect(sheet?.getAttribute('tabindex')).toBe('-1');
  });

  // --- Public methods ---
  test('has show method', () => {
    const el = createBottomSheet();
    container.appendChild(el);
    expect(typeof el.show).toBe('function');
  });

  test('has hide method', () => {
    const el = createBottomSheet();
    container.appendChild(el);
    expect(typeof el.hide).toBe('function');
  });

  test('show sets open to true', () => {
    const el = createBottomSheet();
    container.appendChild(el);
    el.show();
    expect(el.open).toBe(true);
    el.hide();
  });

  test('hide sets open to false', () => {
    const el = createBottomSheet();
    container.appendChild(el);
    el.show();
    el.hide();
    expect(el.open).toBe(false);
  });

  test('show sets body overflow hidden', () => {
    const el = createBottomSheet();
    container.appendChild(el);
    el.show();
    expect(document.body.style.overflow).toBe('hidden');
    el.hide();
  });

  test('hide restores body overflow', () => {
    const el = createBottomSheet();
    container.appendChild(el);
    el.show();
    el.hide();
    expect(document.body.style.overflow).toBe('');
  });

  // --- Events ---
  test('show emits open event', () => {
    const el = createBottomSheet();
    container.appendChild(el);
    let fired = false;
    el.addEventListener('open', () => { fired = true; });
    el.show();
    expect(fired).toBe(true);
    el.hide();
  });

  test('hide emits close event', () => {
    const el = createBottomSheet();
    container.appendChild(el);
    el.show();
    let fired = false;
    el.addEventListener('close', () => { fired = true; });
    el.hide();
    expect(fired).toBe(true);
  });

  // --- Cleanup ---
  test('disconnectedCallback cleans up body overflow', () => {
    const el = createBottomSheet();
    container.appendChild(el);
    el.show();
    el.remove();
    expect(document.body.style.overflow).toBe('');
  });

  // --- CSS Parts ---
  test('has wrapper part', () => {
    const el = createBottomSheet();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="wrapper"]')).toBeDefined();
  });

  test('has sheet part', () => {
    const el = createBottomSheet();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="sheet"]')).toBeDefined();
  });

  test('has handle-area part', () => {
    const el = createBottomSheet();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="handle-area"]')).toBeDefined();
  });

  test('has handle part', () => {
    const el = createBottomSheet();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="handle"]')).toBeDefined();
  });

  test('has header part', () => {
    const el = createBottomSheet();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="header"]')).toBeDefined();
  });

  test('has content part', () => {
    const el = createBottomSheet();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="content"]')).toBeDefined();
  });

  test('has backdrop part in modal mode', () => {
    const el = createBottomSheet({ modal: true });
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="backdrop"]')).toBeDefined();
  });
});

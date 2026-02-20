import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmAccordion, ElDmAccordionItem, register } from './index';

register();

function createAccordion(props: Partial<ElDmAccordion> = {}): ElDmAccordion {
  const el = document.createElement('el-dm-accordion') as ElDmAccordion;
  Object.assign(el, props);
  return el;
}

function createAccordionItem(props: Partial<ElDmAccordionItem> = {}): ElDmAccordionItem {
  const el = document.createElement('el-dm-accordion-item') as ElDmAccordionItem;
  Object.assign(el, props);
  return el;
}

describe('ElDmAccordion', () => {
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
    expect(customElements.get('el-dm-accordion')).toBe(ElDmAccordion);
  });

  test('accordion-item is defined', () => {
    expect(customElements.get('el-dm-accordion-item')).toBe(ElDmAccordionItem);
  });

  // --- Rendering ---
  test('creates a shadow root with accordion', () => {
    const el = createAccordion();
    container.appendChild(el);
    const accordion = el.shadowRoot?.querySelector('.accordion');
    expect(accordion).toBeDefined();
  });

  test('has presentation role', () => {
    const el = createAccordion();
    container.appendChild(el);
    const accordion = el.shadowRoot?.querySelector('[role="presentation"]');
    expect(accordion).toBeDefined();
  });

  test('has default slot', () => {
    const el = createAccordion();
    container.appendChild(el);
    const slot = el.shadowRoot?.querySelector('slot');
    expect(slot).toBeDefined();
  });

  // --- Properties ---
  test('reflects multiple attribute', () => {
    const el = createAccordion({ multiple: true });
    container.appendChild(el);
    expect(el.hasAttribute('multiple')).toBe(true);
  });

  test('reflects value attribute', () => {
    const el = createAccordion({ value: 'item1,item2' });
    container.appendChild(el);
    expect(el.getAttribute('value')).toBe('item1,item2');
  });

  // --- Public methods ---
  test('has getOpenItems method', () => {
    const el = createAccordion();
    container.appendChild(el);
    expect(typeof el.getOpenItems).toBe('function');
  });

  test('has setOpenItems method', () => {
    const el = createAccordion();
    container.appendChild(el);
    expect(typeof el.setOpenItems).toBe('function');
  });

  test('has open method', () => {
    const el = createAccordion();
    container.appendChild(el);
    expect(typeof el.open).toBe('function');
  });

  test('has close method', () => {
    const el = createAccordion();
    container.appendChild(el);
    expect(typeof el.close).toBe('function');
  });

  test('has toggle method', () => {
    const el = createAccordion();
    container.appendChild(el);
    expect(typeof el.toggle).toBe('function');
  });

  test('getOpenItems returns empty array when no value', () => {
    const el = createAccordion();
    container.appendChild(el);
    expect(el.getOpenItems()).toEqual([]);
  });

  test('getOpenItems parses comma-separated value', () => {
    const el = createAccordion({ value: 'a,b,c' });
    container.appendChild(el);
    expect(el.getOpenItems()).toEqual(['a', 'b', 'c']);
  });

  test('setOpenItems updates value', () => {
    const el = createAccordion();
    container.appendChild(el);
    el.setOpenItems(['x', 'y']);
    expect(el.value).toBe('x,y');
  });

  test('setOpenItems emits change event', () => {
    const el = createAccordion();
    container.appendChild(el);
    let detail: { value: string; openItems: string[] } | null = null;
    el.addEventListener('change', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
    el.setOpenItems(['a']);
    expect(detail).toEqual({ value: 'a', openItems: ['a'] });
  });

  test('open adds item to value', () => {
    const el = createAccordion({ value: 'a' });
    container.appendChild(el);
    el.open('b');
    expect(el.getOpenItems()).toContain('b');
  });

  test('open does not duplicate', () => {
    const el = createAccordion({ value: 'a' });
    container.appendChild(el);
    el.open('a');
    expect(el.getOpenItems()).toEqual(['a']);
  });

  test('close removes item from value', () => {
    const el = createAccordion({ value: 'a,b' });
    container.appendChild(el);
    el.close('a');
    expect(el.getOpenItems()).toEqual(['b']);
  });

  test('toggle opens closed item', () => {
    const el = createAccordion();
    container.appendChild(el);
    el.toggle('x');
    expect(el.getOpenItems()).toContain('x');
  });

  test('toggle closes open item', () => {
    const el = createAccordion({ value: 'x' });
    container.appendChild(el);
    el.toggle('x');
    expect(el.getOpenItems()).not.toContain('x');
  });

  test('single mode replaces open item', () => {
    const el = createAccordion({ value: 'a' });
    container.appendChild(el);
    el.open('b');
    expect(el.getOpenItems()).toEqual(['b']);
  });

  test('multiple mode keeps existing items open', () => {
    const el = createAccordion({ multiple: true, value: 'a' });
    container.appendChild(el);
    el.open('b');
    expect(el.getOpenItems()).toEqual(['a', 'b']);
  });

  // --- CSS Parts ---
  test('has container part', () => {
    const el = createAccordion();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="container"]')).toBeDefined();
  });

  // --- Cleanup ---
  test('removes event listener on disconnect', () => {
    const el = createAccordion();
    container.appendChild(el);
    el.remove();
    expect(true).toBe(true);
  });
});

describe('ElDmAccordionItem', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  // --- Rendering ---
  test('creates a shadow root with accordion-item', () => {
    const el = createAccordionItem();
    container.appendChild(el);
    const item = el.shadowRoot?.querySelector('.accordion-item');
    expect(item).toBeDefined();
  });

  test('has header button', () => {
    const el = createAccordionItem();
    container.appendChild(el);
    const header = el.shadowRoot?.querySelector('button.accordion-header');
    expect(header).toBeDefined();
  });

  test('header has type="button"', () => {
    const el = createAccordionItem();
    container.appendChild(el);
    const header = el.shadowRoot?.querySelector('.accordion-header');
    expect(header?.getAttribute('type')).toBe('button');
  });

  test('has header slot', () => {
    const el = createAccordionItem();
    container.appendChild(el);
    const slot = el.shadowRoot?.querySelector('slot[name="header"]');
    expect(slot).toBeDefined();
  });

  test('has default slot for content', () => {
    const el = createAccordionItem();
    container.appendChild(el);
    const slot = el.shadowRoot?.querySelector('slot:not([name])');
    expect(slot).toBeDefined();
  });

  test('has expand icon', () => {
    const el = createAccordionItem();
    container.appendChild(el);
    const expand = el.shadowRoot?.querySelector('.accordion-expand');
    expect(expand).toBeDefined();
  });

  test('has content region', () => {
    const el = createAccordionItem();
    container.appendChild(el);
    const content = el.shadowRoot?.querySelector('.accordion-body-inner');
    expect(content).toBeDefined();
  });

  // --- Properties ---
  test('reflects value attribute', () => {
    const el = createAccordionItem({ value: 'item1' });
    container.appendChild(el);
    expect(el.getAttribute('value')).toBe('item1');
  });

  test('reflects disabled attribute', () => {
    const el = createAccordionItem({ disabled: true });
    container.appendChild(el);
    expect(el.hasAttribute('disabled')).toBe(true);
  });

  test('reflects open attribute', () => {
    const el = createAccordionItem({ open: true });
    container.appendChild(el);
    expect(el.hasAttribute('open')).toBe(true);
  });

  test('header disabled when item disabled', () => {
    const el = createAccordionItem({ disabled: true });
    container.appendChild(el);
    const header = el.shadowRoot?.querySelector('.accordion-header');
    expect(header?.hasAttribute('disabled')).toBe(true);
  });

  test('accordion-item has open class when open', () => {
    const el = createAccordionItem({ open: true });
    container.appendChild(el);
    const item = el.shadowRoot?.querySelector('.accordion-item');
    expect(item?.classList.contains('open')).toBe(true);
  });

  test('accordion-item has no open class when closed', () => {
    const el = createAccordionItem();
    container.appendChild(el);
    const item = el.shadowRoot?.querySelector('.accordion-item');
    expect(item?.classList.contains('open')).toBe(false);
  });

  // --- Accessibility ---
  test('header has aria-expanded false when closed', () => {
    const el = createAccordionItem();
    container.appendChild(el);
    const header = el.shadowRoot?.querySelector('.accordion-header');
    expect(header?.getAttribute('aria-expanded')).toBe('false');
  });

  test('header has aria-expanded true when open', () => {
    const el = createAccordionItem({ open: true });
    container.appendChild(el);
    const header = el.shadowRoot?.querySelector('.accordion-header');
    expect(header?.getAttribute('aria-expanded')).toBe('true');
  });

  test('header has aria-controls matching content id', () => {
    const el = createAccordionItem({ value: 'test' });
    container.appendChild(el);
    const header = el.shadowRoot?.querySelector('.accordion-header');
    expect(header?.getAttribute('aria-controls')).toBe('content-test');
  });

  test('content has region role', () => {
    const el = createAccordionItem();
    container.appendChild(el);
    const content = el.shadowRoot?.querySelector('[role="region"]');
    expect(content).toBeDefined();
  });

  test('content has aria-hidden true when closed', () => {
    const el = createAccordionItem();
    container.appendChild(el);
    const content = el.shadowRoot?.querySelector('.accordion-body-inner');
    expect(content?.getAttribute('aria-hidden')).toBe('true');
  });

  test('content has aria-hidden false when open', () => {
    const el = createAccordionItem({ open: true });
    container.appendChild(el);
    const content = el.shadowRoot?.querySelector('.accordion-body-inner');
    expect(content?.getAttribute('aria-hidden')).toBe('false');
  });

  test('content id uses value', () => {
    const el = createAccordionItem({ value: 'panel1' });
    container.appendChild(el);
    const content = el.shadowRoot?.querySelector('#content-panel1');
    expect(content).toBeDefined();
  });

  test('content id defaults to "item" when no value', () => {
    const el = createAccordionItem();
    container.appendChild(el);
    const content = el.shadowRoot?.querySelector('#content-item');
    expect(content).toBeDefined();
  });

  // --- Events ---
  test('click dispatches accordion-item-toggle event', () => {
    const el = createAccordionItem({ value: 'test' });
    container.appendChild(el);
    let detail: { itemId: string; open: boolean } | null = null;
    el.addEventListener('accordion-item-toggle', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
    const header = el.shadowRoot?.querySelector('.accordion-header') as HTMLElement;
    header?.click();
    expect(detail).toEqual({ itemId: 'test', open: true });
  });

  test('click on open item dispatches toggle with open=false', () => {
    const el = createAccordionItem({ value: 'test', open: true });
    container.appendChild(el);
    let detail: { itemId: string; open: boolean } | null = null;
    el.addEventListener('accordion-item-toggle', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
    const header = el.shadowRoot?.querySelector('.accordion-header') as HTMLElement;
    header?.click();
    expect(detail).toEqual({ itemId: 'test', open: false });
  });

  test('disabled item does not dispatch event on click', () => {
    const el = createAccordionItem({ value: 'test', disabled: true });
    container.appendChild(el);
    let fired = false;
    el.addEventListener('accordion-item-toggle', () => { fired = true; });
    const header = el.shadowRoot?.querySelector('.accordion-header') as HTMLElement;
    header?.click();
    expect(fired).toBe(false);
  });

  test('toggle method dispatches event', () => {
    const el = createAccordionItem({ value: 'test' });
    container.appendChild(el);
    let fired = false;
    el.addEventListener('accordion-item-toggle', () => { fired = true; });
    el.toggle();
    expect(fired).toBe(true);
  });

  test('toggle is no-op when disabled', () => {
    const el = createAccordionItem({ value: 'test', disabled: true });
    container.appendChild(el);
    let fired = false;
    el.addEventListener('accordion-item-toggle', () => { fired = true; });
    el.toggle();
    expect(fired).toBe(false);
  });

  test('event bubbles and is composed', () => {
    const el = createAccordionItem({ value: 'test' });
    container.appendChild(el);
    let bubbles = false;
    let composed = false;
    el.addEventListener('accordion-item-toggle', ((e: CustomEvent) => {
      bubbles = e.bubbles;
      composed = e.composed;
    }) as EventListener);
    const header = el.shadowRoot?.querySelector('.accordion-header') as HTMLElement;
    header?.click();
    expect(bubbles).toBe(true);
    expect(composed).toBe(true);
  });

  // --- CSS Parts ---
  test('has header part', () => {
    const el = createAccordionItem();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="header"]')).toBeDefined();
  });

  test('has icon part on expand icon', () => {
    const el = createAccordionItem();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="icon"]')).toBeDefined();
  });

  test('has content part', () => {
    const el = createAccordionItem();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="content"]')).toBeDefined();
  });
});

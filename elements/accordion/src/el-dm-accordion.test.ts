import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmAccordion, register } from './index';

register();

describe('ElDmAccordion', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('is defined', () => {
    expect(customElements.get('el-dm-accordion')).toBe(ElDmAccordion);
  });

  test('creates a shadow root with accordion', () => {
    const el = document.createElement('el-dm-accordion') as ElDmAccordion;
    container.appendChild(el);

    const accordion = el.shadowRoot?.querySelector('.accordion');
    expect(accordion).toBeDefined();
  });

  test('has presentation role', () => {
    const el = document.createElement('el-dm-accordion') as ElDmAccordion;
    container.appendChild(el);

    const accordion = el.shadowRoot?.querySelector('[role="presentation"]');
    expect(accordion).toBeDefined();
  });

  test('has default slot', () => {
    const el = document.createElement('el-dm-accordion') as ElDmAccordion;
    container.appendChild(el);

    const slot = el.shadowRoot?.querySelector('slot');
    expect(slot).toBeDefined();
  });

  test('reflects multiple attribute', () => {
    const el = document.createElement('el-dm-accordion') as ElDmAccordion;
    el.multiple = true;
    container.appendChild(el);

    expect(el.hasAttribute('multiple')).toBe(true);
  });

  test('has public methods', () => {
    const el = document.createElement('el-dm-accordion') as ElDmAccordion;
    container.appendChild(el);

    expect(typeof el.getOpenItems).toBe('function');
    expect(typeof el.setOpenItems).toBe('function');
    expect(typeof el.open).toBe('function');
    expect(typeof el.close).toBe('function');
    expect(typeof el.toggle).toBe('function');
  });
});

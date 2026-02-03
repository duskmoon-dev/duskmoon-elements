import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmPopover, register } from './index';

register();

describe('ElDmPopover', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('is defined', () => {
    expect(customElements.get('el-dm-popover')).toBe(ElDmPopover);
  });

  test('creates a shadow root with popover elements', () => {
    const el = document.createElement('el-dm-popover') as ElDmPopover;
    container.appendChild(el);

    const trigger = el.shadowRoot?.querySelector('.popover-trigger');
    const panel = el.shadowRoot?.querySelector('.popover-panel');
    expect(trigger).toBeDefined();
    expect(panel).toBeDefined();
  });

  test('has dialog role on panel', () => {
    const el = document.createElement('el-dm-popover') as ElDmPopover;
    container.appendChild(el);

    const panel = el.shadowRoot?.querySelector('[role="dialog"]');
    expect(panel).toBeDefined();
  });

  test('reflects open attribute', () => {
    const el = document.createElement('el-dm-popover') as ElDmPopover;
    el.open = true;
    container.appendChild(el);

    expect(el.hasAttribute('open')).toBe(true);
  });

  test('has trigger and default slots', () => {
    const el = document.createElement('el-dm-popover') as ElDmPopover;
    container.appendChild(el);

    const triggerSlot = el.shadowRoot?.querySelector('slot[name="trigger"]');
    const defaultSlot = el.shadowRoot?.querySelector('slot:not([name])');
    expect(triggerSlot).toBeDefined();
    expect(defaultSlot).toBeDefined();
  });

  test('has public show/hide/toggle methods', () => {
    const el = document.createElement('el-dm-popover') as ElDmPopover;
    container.appendChild(el);

    expect(typeof el.show).toBe('function');
    expect(typeof el.hide).toBe('function');
    expect(typeof el.toggle).toBe('function');
  });

  test('shows arrow by default', () => {
    const el = document.createElement('el-dm-popover') as ElDmPopover;
    container.appendChild(el);

    const arrow = el.shadowRoot?.querySelector('.popover-arrow');
    expect(arrow).toBeDefined();
  });

  test('hides arrow when arrow is false', () => {
    const el = document.createElement('el-dm-popover') as ElDmPopover;
    el.arrow = false;
    container.appendChild(el);

    const arrow = el.shadowRoot?.querySelector('.popover-arrow');
    expect(arrow).toBeNull();
  });
});

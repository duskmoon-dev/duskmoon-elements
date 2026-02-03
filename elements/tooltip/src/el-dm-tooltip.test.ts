import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmTooltip, register } from './index';

register();

describe('ElDmTooltip', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('is defined', () => {
    expect(customElements.get('el-dm-tooltip')).toBe(ElDmTooltip);
  });

  test('creates a shadow root with tooltip wrapper', () => {
    const el = document.createElement('el-dm-tooltip') as ElDmTooltip;
    container.appendChild(el);

    const wrapper = el.shadowRoot?.querySelector('.tooltip-wrapper');
    expect(wrapper).toBeDefined();
  });

  test('renders tooltip content', () => {
    const el = document.createElement('el-dm-tooltip') as ElDmTooltip;
    el.content = 'Hello tooltip';
    container.appendChild(el);

    const content = el.shadowRoot?.querySelector('.tooltip-content');
    expect(content?.textContent).toContain('Hello tooltip');
  });

  test('has role tooltip', () => {
    const el = document.createElement('el-dm-tooltip') as ElDmTooltip;
    container.appendChild(el);

    const content = el.shadowRoot?.querySelector('[role="tooltip"]');
    expect(content).toBeDefined();
  });

  test('default position is top', () => {
    const el = document.createElement('el-dm-tooltip') as ElDmTooltip;
    container.appendChild(el);

    const content = el.shadowRoot?.querySelector('.tooltip-content');
    expect(content?.classList.contains('tooltip-top')).toBe(true);
  });

  test('applies position classes', () => {
    for (const pos of ['top', 'bottom', 'left', 'right'] as const) {
      const el = document.createElement('el-dm-tooltip') as ElDmTooltip;
      el.position = pos;
      container.appendChild(el);

      const content = el.shadowRoot?.querySelector('.tooltip-content');
      expect(content?.classList.contains(`tooltip-${pos}`)).toBe(true);
      el.remove();
    }
  });

  test('shows arrow by default', () => {
    const el = document.createElement('el-dm-tooltip') as ElDmTooltip;
    el.content = 'test';
    container.appendChild(el);

    const arrow = el.shadowRoot?.querySelector('.tooltip-arrow');
    expect(arrow).toBeDefined();
  });

  test('hides arrow when arrow is false', () => {
    const el = document.createElement('el-dm-tooltip') as ElDmTooltip;
    el.content = 'test';
    el.arrow = false;
    container.appendChild(el);

    const arrow = el.shadowRoot?.querySelector('.tooltip-arrow');
    expect(arrow).toBeNull();
  });

  test('reflects disabled attribute', () => {
    const el = document.createElement('el-dm-tooltip') as ElDmTooltip;
    el.disabled = true;
    container.appendChild(el);

    expect(el.hasAttribute('disabled')).toBe(true);
  });

  test('has default slot for trigger content', () => {
    const el = document.createElement('el-dm-tooltip') as ElDmTooltip;
    container.appendChild(el);

    const slot = el.shadowRoot?.querySelector('slot:not([name])');
    expect(slot).toBeDefined();
  });
});

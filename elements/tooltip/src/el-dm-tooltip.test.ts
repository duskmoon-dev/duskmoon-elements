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

  function createTooltip(attrs: Record<string, unknown> = {}): ElDmTooltip {
    const el = document.createElement('el-dm-tooltip') as ElDmTooltip;
    for (const [key, val] of Object.entries(attrs)) {
      (el as unknown as Record<string, unknown>)[key] = val;
    }
    container.appendChild(el);
    return el;
  }

  // ──────────────── Registration ────────────────
  test('is defined', () => {
    expect(customElements.get('el-dm-tooltip')).toBe(ElDmTooltip);
  });

  // ──────────────── Rendering ────────────────
  describe('rendering', () => {
    test('creates a shadow root with tooltip wrapper', () => {
      const el = createTooltip();
      expect(
        el.shadowRoot?.querySelector('.tooltip-wrapper'),
      ).toBeDefined();
    });

    test('has role tooltip', () => {
      const el = createTooltip();
      expect(
        el.shadowRoot?.querySelector('[role="tooltip"]'),
      ).toBeDefined();
    });

    test('renders tooltip content text', () => {
      const el = createTooltip({ content: 'Hello tooltip' });
      const content = el.shadowRoot?.querySelector('.tooltip-content');
      expect(content?.textContent).toContain('Hello tooltip');
    });

    test('has default slot for trigger content', () => {
      const el = createTooltip();
      expect(
        el.shadowRoot?.querySelector('slot:not([name])'),
      ).toBeDefined();
    });
  });

  // ──────────────── Properties & Defaults ────────────────
  describe('properties', () => {
    test('default position is top', () => {
      const el = createTooltip();
      expect(el.position).toBe('top');
    });

    test('default trigger is hover', () => {
      const el = createTooltip();
      expect(el.trigger).toBe('hover');
    });

    test('default delay is 0', () => {
      const el = createTooltip();
      expect(el.delay).toBe(0);
    });

    test('default arrow is true', () => {
      const el = createTooltip();
      expect(el.arrow).toBe(true);
    });

    test('reflects content to attribute', () => {
      const el = createTooltip({ content: 'test' });
      expect(el.getAttribute('content')).toBe('test');
    });

    test('reflects position to attribute', () => {
      const el = createTooltip({ position: 'bottom' });
      expect(el.getAttribute('position')).toBe('bottom');
    });

    test('reflects trigger to attribute', () => {
      const el = createTooltip({ trigger: 'click' });
      expect(el.getAttribute('trigger')).toBe('click');
    });

    test('reflects disabled to attribute', () => {
      const el = createTooltip({ disabled: true });
      expect(el.hasAttribute('disabled')).toBe(true);
    });
  });

  // ──────────────── Position Classes ────────────────
  describe('positions', () => {
    for (const pos of ['top', 'bottom', 'left', 'right'] as const) {
      test(`applies ${pos} position class`, () => {
        const el = createTooltip({ position: pos });
        const content = el.shadowRoot?.querySelector('.tooltip-content');
        expect(content?.classList.contains(`tooltip-${pos}`)).toBe(true);
      });
    }

    test('defaults to top position class', () => {
      const el = createTooltip();
      const content = el.shadowRoot?.querySelector('.tooltip-content');
      expect(content?.classList.contains('tooltip-top')).toBe(true);
    });
  });

  // ──────────────── Arrow ────────────────
  describe('arrow', () => {
    test('shows arrow by default', () => {
      const el = createTooltip({ content: 'test' });
      expect(
        el.shadowRoot?.querySelector('.tooltip-arrow'),
      ).toBeDefined();
    });

    test('hides arrow when arrow is false', () => {
      const el = createTooltip({ content: 'test', arrow: false });
      expect(el.shadowRoot?.querySelector('.tooltip-arrow')).toBeNull();
    });
  });

  // ──────────────── Hover Trigger ────────────────
  describe('hover trigger', () => {
    test('shows tooltip on mouseenter', () => {
      const el = createTooltip({ content: 'test', trigger: 'hover' });
      el.dispatchEvent(new Event('mouseenter'));
      const content = el.shadowRoot?.querySelector('.tooltip-content');
      expect(content?.classList.contains('visible')).toBe(true);
    });

    test('hides tooltip on mouseleave', () => {
      const el = createTooltip({ content: 'test', trigger: 'hover' });
      el.dispatchEvent(new Event('mouseenter'));
      el.dispatchEvent(new Event('mouseleave'));
      const content = el.shadowRoot?.querySelector('.tooltip-content');
      expect(content?.classList.contains('visible')).toBe(false);
    });

    test('shows on focusin with hover trigger', () => {
      const el = createTooltip({ content: 'test', trigger: 'hover' });
      el.dispatchEvent(new Event('focusin'));
      const content = el.shadowRoot?.querySelector('.tooltip-content');
      expect(content?.classList.contains('visible')).toBe(true);
    });

    test('hides on focusout with hover trigger', () => {
      const el = createTooltip({ content: 'test', trigger: 'hover' });
      el.dispatchEvent(new Event('focusin'));
      el.dispatchEvent(new Event('focusout'));
      const content = el.shadowRoot?.querySelector('.tooltip-content');
      expect(content?.classList.contains('visible')).toBe(false);
    });
  });

  // ──────────────── Click Trigger ────────────────
  describe('click trigger', () => {
    test('toggles visibility on click', () => {
      const el = createTooltip({ content: 'test', trigger: 'click' });
      el.dispatchEvent(new Event('click'));
      const content = el.shadowRoot?.querySelector('.tooltip-content');
      expect(content?.classList.contains('visible')).toBe(true);
    });

    test('toggles off on second click', () => {
      const el = createTooltip({ content: 'test', trigger: 'click' });
      el.dispatchEvent(new Event('click'));
      el.dispatchEvent(new Event('click'));
      const content = el.shadowRoot?.querySelector('.tooltip-content');
      expect(content?.classList.contains('visible')).toBe(false);
    });
  });

  // ──────────────── Focus Trigger ────────────────
  describe('focus trigger', () => {
    test('shows on focusin', () => {
      const el = createTooltip({ content: 'test', trigger: 'focus' });
      el.dispatchEvent(new Event('focusin'));
      const content = el.shadowRoot?.querySelector('.tooltip-content');
      expect(content?.classList.contains('visible')).toBe(true);
    });

    test('hides on focusout', () => {
      const el = createTooltip({ content: 'test', trigger: 'focus' });
      el.dispatchEvent(new Event('focusin'));
      el.dispatchEvent(new Event('focusout'));
      const content = el.shadowRoot?.querySelector('.tooltip-content');
      expect(content?.classList.contains('visible')).toBe(false);
    });
  });

  // ──────────────── Disabled ────────────────
  describe('disabled', () => {
    test('does not show when disabled', () => {
      const el = createTooltip({
        content: 'test',
        trigger: 'hover',
        disabled: true,
      });
      el.dispatchEvent(new Event('mouseenter'));
      const content = el.shadowRoot?.querySelector('.tooltip-content');
      expect(content?.classList.contains('visible')).toBe(false);
    });
  });

  // ──────────────── No Content ────────────────
  describe('no content', () => {
    test('does not show when content is empty', () => {
      const el = createTooltip({ trigger: 'hover' });
      el.dispatchEvent(new Event('mouseenter'));
      const content = el.shadowRoot?.querySelector('.tooltip-content');
      expect(content?.classList.contains('visible')).toBe(false);
    });
  });

  // ──────────────── CSS Parts ────────────────
  describe('CSS parts', () => {
    test('exposes tooltip part', () => {
      const el = createTooltip();
      expect(el.shadowRoot?.querySelector('[part="tooltip"]')).toBeDefined();
    });

    test('exposes content part', () => {
      const el = createTooltip();
      expect(el.shadowRoot?.querySelector('[part="content"]')).toBeDefined();
    });

    test('exposes arrow part when arrow enabled', () => {
      const el = createTooltip({ content: 'test' });
      expect(el.shadowRoot?.querySelector('[part="arrow"]')).toBeDefined();
    });
  });
});

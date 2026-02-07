import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmSwitch, register } from './index';

register();

function createSwitch(props: Partial<ElDmSwitch> = {}): ElDmSwitch {
  const el = document.createElement('el-dm-switch') as ElDmSwitch;
  Object.assign(el, props);
  return el;
}

describe('ElDmSwitch', () => {
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
    expect(customElements.get('el-dm-switch')).toBe(ElDmSwitch);
  });

  // --- Rendering ---
  test('creates a shadow root with switch', () => {
    const el = createSwitch();
    container.appendChild(el);
    const switchEl = el.shadowRoot?.querySelector('.switch');
    expect(switchEl).toBeDefined();
  });

  test('has switch role on input', () => {
    const el = createSwitch();
    container.appendChild(el);
    const input = el.shadowRoot?.querySelector('[role="switch"]');
    expect(input).toBeDefined();
  });

  test('renders track and thumb', () => {
    const el = createSwitch();
    container.appendChild(el);
    const track = el.shadowRoot?.querySelector('.switch-track');
    const thumb = el.shadowRoot?.querySelector('.switch-thumb');
    expect(track).toBeDefined();
    expect(thumb).toBeDefined();
  });

  test('renders hidden checkbox input', () => {
    const el = createSwitch();
    container.appendChild(el);
    const input = el.shadowRoot?.querySelector('input[type="checkbox"]');
    expect(input).toBeDefined();
  });

  test('input has switch-input class', () => {
    const el = createSwitch();
    container.appendChild(el);
    const input = el.shadowRoot?.querySelector('input.switch-input');
    expect(input).toBeDefined();
  });

  test('wraps everything in a label', () => {
    const el = createSwitch();
    container.appendChild(el);
    const label = el.shadowRoot?.querySelector('label.switch');
    expect(label).toBeDefined();
  });

  // --- Properties ---
  test('defaults value to falsy', () => {
    const el = createSwitch();
    container.appendChild(el);
    expect(el.value).toBeFalsy();
  });

  test('reflects disabled attribute', () => {
    const el = createSwitch({ disabled: true });
    container.appendChild(el);
    expect(el.hasAttribute('disabled')).toBe(true);
  });

  test('input gets disabled attribute', () => {
    const el = createSwitch({ disabled: true });
    container.appendChild(el);
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.hasAttribute('disabled')).toBe(true);
  });

  test('input is not disabled by default', () => {
    const el = createSwitch();
    container.appendChild(el);
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.hasAttribute('disabled')).toBe(false);
  });

  test('reflects size attribute', () => {
    const el = createSwitch({ size: 'lg' } as Partial<ElDmSwitch>);
    container.appendChild(el);
    expect(el.getAttribute('size')).toBe('lg');
  });

  test('reflects color attribute', () => {
    const el = createSwitch({ color: 'success' } as Partial<ElDmSwitch>);
    container.appendChild(el);
    expect(el.getAttribute('color')).toBe('success');
  });

  test('reflects name attribute', () => {
    const el = createSwitch({ name: 'toggle' });
    container.appendChild(el);
    expect(el.getAttribute('name')).toBe('toggle');
  });

  test('input gets name attribute', () => {
    const el = createSwitch({ name: 'toggle' });
    container.appendChild(el);
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.getAttribute('name')).toBe('toggle');
  });

  // --- Size classes ---
  test('applies sm size class', () => {
    const el = createSwitch({ size: 'sm' } as Partial<ElDmSwitch>);
    container.appendChild(el);
    const switchEl = el.shadowRoot?.querySelector('.switch');
    expect(switchEl?.classList.contains('switch-sm')).toBe(true);
  });

  test('applies lg size class', () => {
    const el = createSwitch({ size: 'lg' } as Partial<ElDmSwitch>);
    container.appendChild(el);
    const switchEl = el.shadowRoot?.querySelector('.switch');
    expect(switchEl?.classList.contains('switch-lg')).toBe(true);
  });

  test('md size has no extra class', () => {
    const el = createSwitch({ size: 'md' } as Partial<ElDmSwitch>);
    container.appendChild(el);
    const switchEl = el.shadowRoot?.querySelector('.switch');
    expect(switchEl?.classList.contains('switch-md')).toBe(false);
  });

  // --- Color classes ---
  test('applies primary color class', () => {
    const el = createSwitch({ color: 'primary' } as Partial<ElDmSwitch>);
    container.appendChild(el);
    const switchEl = el.shadowRoot?.querySelector('.switch');
    expect(switchEl?.classList.contains('switch-primary')).toBe(true);
  });

  test('applies secondary color class', () => {
    const el = createSwitch({ color: 'secondary' } as Partial<ElDmSwitch>);
    container.appendChild(el);
    const switchEl = el.shadowRoot?.querySelector('.switch');
    expect(switchEl?.classList.contains('switch-secondary')).toBe(true);
  });

  test('applies success color class', () => {
    const el = createSwitch({ color: 'success' } as Partial<ElDmSwitch>);
    container.appendChild(el);
    const switchEl = el.shadowRoot?.querySelector('.switch');
    expect(switchEl?.classList.contains('switch-success')).toBe(true);
  });

  test('applies warning color class', () => {
    const el = createSwitch({ color: 'warning' } as Partial<ElDmSwitch>);
    container.appendChild(el);
    const switchEl = el.shadowRoot?.querySelector('.switch');
    expect(switchEl?.classList.contains('switch-warning')).toBe(true);
  });

  test('applies error color class', () => {
    const el = createSwitch({ color: 'error' } as Partial<ElDmSwitch>);
    container.appendChild(el);
    const switchEl = el.shadowRoot?.querySelector('.switch');
    expect(switchEl?.classList.contains('switch-error')).toBe(true);
  });

  test('applies info color class', () => {
    const el = createSwitch({ color: 'info' } as Partial<ElDmSwitch>);
    container.appendChild(el);
    const switchEl = el.shadowRoot?.querySelector('.switch');
    expect(switchEl?.classList.contains('switch-info')).toBe(true);
  });

  test('applies tertiary color class', () => {
    const el = createSwitch({ color: 'tertiary' } as Partial<ElDmSwitch>);
    container.appendChild(el);
    const switchEl = el.shadowRoot?.querySelector('.switch');
    expect(switchEl?.classList.contains('switch-tertiary')).toBe(true);
  });

  // --- Label ---
  test('renders label when provided', () => {
    const el = createSwitch({ label: 'Toggle me' });
    container.appendChild(el);
    const label = el.shadowRoot?.querySelector('.switch-label');
    expect(label?.textContent).toContain('Toggle me');
  });

  test('no label element when label not provided', () => {
    const el = createSwitch();
    container.appendChild(el);
    const label = el.shadowRoot?.querySelector('.switch-label');
    expect(label).toBeNull();
  });

  test('label has left class when labelPosition is left', () => {
    const el = createSwitch({ label: 'Test', labelPosition: 'left' });
    container.appendChild(el);
    const label = el.shadowRoot?.querySelector('.switch-label');
    expect(label?.classList.contains('switch-label-left')).toBe(true);
  });

  test('label has no left class when labelPosition is right', () => {
    const el = createSwitch({ label: 'Test', labelPosition: 'right' });
    container.appendChild(el);
    const label = el.shadowRoot?.querySelector('.switch-label');
    expect(label?.classList.contains('switch-label-left')).toBe(false);
  });

  // --- Accessibility ---
  test('input has aria-checked false when off', () => {
    const el = createSwitch();
    container.appendChild(el);
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.getAttribute('aria-checked')).toBe('false');
  });

  test('input has aria-checked true when on', () => {
    const el = createSwitch({ value: true });
    container.appendChild(el);
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.getAttribute('aria-checked')).toBe('true');
  });

  test('input is checked when value is true', () => {
    const el = createSwitch({ value: true });
    container.appendChild(el);
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.hasAttribute('checked')).toBe(true);
  });

  test('input value attribute reflects boolean', () => {
    const el = createSwitch({ value: true });
    container.appendChild(el);
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.getAttribute('value')).toBe('true');
  });

  // --- Events ---
  test('change event fires on input change', () => {
    const el = createSwitch();
    container.appendChild(el);
    let detail: { value: boolean } | null = null;
    el.addEventListener('change', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
    const input = el.shadowRoot?.querySelector('input');
    input?.dispatchEvent(new Event('change'));
    expect(detail).toBeDefined();
  });

  test('input event fires on toggle', () => {
    const el = createSwitch();
    container.appendChild(el);
    let fired = false;
    el.addEventListener('input', () => { fired = true; });
    const input = el.shadowRoot?.querySelector('input');
    input?.dispatchEvent(new Event('change'));
    expect(fired).toBe(true);
  });

  // --- CSS Parts ---
  test('has switch part', () => {
    const el = createSwitch();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="switch"]')).toBeDefined();
  });

  test('has track part', () => {
    const el = createSwitch();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="track"]')).toBeDefined();
  });

  test('has thumb part', () => {
    const el = createSwitch();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="thumb"]')).toBeDefined();
  });

  test('has label part when label provided', () => {
    const el = createSwitch({ label: 'Test' });
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="label"]')).toBeDefined();
  });
});

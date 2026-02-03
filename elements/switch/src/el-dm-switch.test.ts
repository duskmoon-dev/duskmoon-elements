import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmSwitch, register } from './index';

register();

describe('ElDmSwitch', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('is defined', () => {
    expect(customElements.get('el-dm-switch')).toBe(ElDmSwitch);
  });

  test('creates a shadow root with switch', () => {
    const el = document.createElement('el-dm-switch') as ElDmSwitch;
    container.appendChild(el);

    const switchEl = el.shadowRoot?.querySelector('.switch');
    expect(switchEl).toBeDefined();
  });

  test('has switch role on input', () => {
    const el = document.createElement('el-dm-switch') as ElDmSwitch;
    container.appendChild(el);

    const input = el.shadowRoot?.querySelector('[role="switch"]');
    expect(input).toBeDefined();
  });

  test('renders track and thumb', () => {
    const el = document.createElement('el-dm-switch') as ElDmSwitch;
    container.appendChild(el);

    const track = el.shadowRoot?.querySelector('.switch-track');
    const thumb = el.shadowRoot?.querySelector('.switch-thumb');
    expect(track).toBeDefined();
    expect(thumb).toBeDefined();
  });

  test('applies disabled attribute', () => {
    const el = document.createElement('el-dm-switch') as ElDmSwitch;
    el.disabled = true;
    container.appendChild(el);

    expect(el.hasAttribute('disabled')).toBe(true);
  });

  test('applies size classes', () => {
    const el = document.createElement('el-dm-switch') as ElDmSwitch;
    el.size = 'lg';
    container.appendChild(el);

    const switchEl = el.shadowRoot?.querySelector('.switch');
    expect(switchEl?.classList.contains('switch-lg')).toBe(true);
  });

  test('applies color classes', () => {
    const el = document.createElement('el-dm-switch') as ElDmSwitch;
    el.color = 'success';
    container.appendChild(el);

    const switchEl = el.shadowRoot?.querySelector('.switch');
    expect(switchEl?.classList.contains('switch-success')).toBe(true);
  });

  test('renders label when provided', () => {
    const el = document.createElement('el-dm-switch') as ElDmSwitch;
    el.label = 'Toggle me';
    container.appendChild(el);

    const label = el.shadowRoot?.querySelector('.switch-label');
    expect(label?.textContent).toContain('Toggle me');
  });
});

import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmAlert, register } from './index';

register();

describe('ElDmAlert', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('is defined', () => {
    expect(customElements.get('el-dm-alert')).toBe(ElDmAlert);
  });

  test('creates a shadow root with alert role', () => {
    const el = document.createElement('el-dm-alert') as ElDmAlert;
    container.appendChild(el);

    const alert = el.shadowRoot?.querySelector('[role="alert"]');
    expect(alert).toBeDefined();
  });

  test('default type is info', () => {
    const el = document.createElement('el-dm-alert') as ElDmAlert;
    container.appendChild(el);

    const alert = el.shadowRoot?.querySelector('.alert');
    expect(alert?.classList.contains('alert-info')).toBe(true);
  });

  test('applies type attribute', () => {
    const el = document.createElement('el-dm-alert') as ElDmAlert;
    el.type = 'error';
    container.appendChild(el);

    expect(el.getAttribute('type')).toBe('error');
    const alert = el.shadowRoot?.querySelector('.alert');
    expect(alert?.classList.contains('alert-error')).toBe(true);
  });

  test('applies variant attribute', () => {
    const el = document.createElement('el-dm-alert') as ElDmAlert;
    el.variant = 'outlined';
    container.appendChild(el);

    expect(el.getAttribute('variant')).toBe('outlined');
    const alert = el.shadowRoot?.querySelector('.alert');
    expect(alert?.classList.contains('alert-outlined')).toBe(true);
  });

  test('renders title when provided', () => {
    const el = document.createElement('el-dm-alert') as ElDmAlert;
    el.title = 'Alert Title';
    container.appendChild(el);

    const title = el.shadowRoot?.querySelector('.alert-title');
    expect(title?.textContent).toContain('Alert Title');
  });

  test('does not render title when not provided', () => {
    const el = document.createElement('el-dm-alert') as ElDmAlert;
    container.appendChild(el);

    const title = el.shadowRoot?.querySelector('.alert-title');
    expect(title).toBeNull();
  });

  test('shows close button when dismissible', () => {
    const el = document.createElement('el-dm-alert') as ElDmAlert;
    el.dismissible = true;
    container.appendChild(el);

    const closeBtn = el.shadowRoot?.querySelector('.alert-close');
    expect(closeBtn).toBeDefined();
  });

  test('does not show close button when not dismissible', () => {
    const el = document.createElement('el-dm-alert') as ElDmAlert;
    container.appendChild(el);

    const closeBtn = el.shadowRoot?.querySelector('.alert-close');
    expect(closeBtn).toBeNull();
  });

  test('applies compact class', () => {
    const el = document.createElement('el-dm-alert') as ElDmAlert;
    el.compact = true;
    container.appendChild(el);

    const alert = el.shadowRoot?.querySelector('.alert');
    expect(alert?.classList.contains('alert-compact')).toBe(true);
  });

  test('has icon, content, and actions slots', () => {
    const el = document.createElement('el-dm-alert') as ElDmAlert;
    container.appendChild(el);

    const iconSlot = el.shadowRoot?.querySelector('slot[name="icon"]');
    const defaultSlot = el.shadowRoot?.querySelector('slot:not([name])');
    const actionsSlot = el.shadowRoot?.querySelector('slot[name="actions"]');

    expect(iconSlot).toBeDefined();
    expect(defaultSlot).toBeDefined();
    expect(actionsSlot).toBeDefined();
  });

  test('renders default icon for each type', () => {
    for (const type of ['info', 'success', 'warning', 'error'] as const) {
      const el = document.createElement('el-dm-alert') as ElDmAlert;
      el.type = type;
      container.appendChild(el);

      const icon = el.shadowRoot?.querySelector('.alert-icon');
      expect(icon?.textContent?.trim()).toBeTruthy();
      el.remove();
    }
  });
});

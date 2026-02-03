import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmDialog, register } from './index';

register();

describe('ElDmDialog', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('is defined', () => {
    expect(customElements.get('el-dm-dialog')).toBe(ElDmDialog);
  });

  test('creates a shadow root with dialog role', () => {
    const el = document.createElement('el-dm-dialog') as ElDmDialog;
    container.appendChild(el);

    const dialog = el.shadowRoot?.querySelector('[role="dialog"]');
    expect(dialog).toBeDefined();
  });

  test('has aria-modal attribute', () => {
    const el = document.createElement('el-dm-dialog') as ElDmDialog;
    container.appendChild(el);

    const dialog = el.shadowRoot?.querySelector('[role="dialog"]');
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
  });

  test('applies size classes', () => {
    const el = document.createElement('el-dm-dialog') as ElDmDialog;
    el.size = 'lg';
    container.appendChild(el);

    const dialog = el.shadowRoot?.querySelector('.dialog');
    expect(dialog?.classList.contains('dialog-lg')).toBe(true);
  });

  test('shows backdrop by default', () => {
    const el = document.createElement('el-dm-dialog') as ElDmDialog;
    container.appendChild(el);

    const backdrop = el.shadowRoot?.querySelector('.dialog-backdrop');
    expect(backdrop).toBeDefined();
  });

  test('hides backdrop when no-backdrop is set', () => {
    const el = document.createElement('el-dm-dialog') as ElDmDialog;
    el.noBackdrop = true;
    container.appendChild(el);

    const backdrop = el.shadowRoot?.querySelector('.dialog-backdrop');
    expect(backdrop).toBeNull();
  });

  test('shows close button when dismissible', () => {
    const el = document.createElement('el-dm-dialog') as ElDmDialog;
    el.dismissible = true;
    container.appendChild(el);

    const closeBtn = el.shadowRoot?.querySelector('.dialog-close');
    expect(closeBtn).toBeDefined();
  });

  test('show() sets open attribute', () => {
    const el = document.createElement('el-dm-dialog') as ElDmDialog;
    container.appendChild(el);

    el.show();
    expect(el.open).toBe(true);
    expect(el.hasAttribute('open')).toBe(true);
    el.close();
  });

  test('close() removes open attribute', () => {
    const el = document.createElement('el-dm-dialog') as ElDmDialog;
    container.appendChild(el);

    el.show();
    el.close();
    expect(el.open).toBe(false);
  });

  test('toggle() switches open state', () => {
    const el = document.createElement('el-dm-dialog') as ElDmDialog;
    container.appendChild(el);

    el.toggle();
    expect(el.open).toBe(true);
    el.toggle();
    expect(el.open).toBe(false);
  });

  test('has header, body, and footer slots', () => {
    const el = document.createElement('el-dm-dialog') as ElDmDialog;
    container.appendChild(el);

    const headerSlot = el.shadowRoot?.querySelector('slot[name="header"]');
    const defaultSlot = el.shadowRoot?.querySelector('slot:not([name])');
    const footerSlot = el.shadowRoot?.querySelector('slot[name="footer"]');

    expect(headerSlot).toBeDefined();
    expect(defaultSlot).toBeDefined();
    expect(footerSlot).toBeDefined();
  });

  test('wrapper has open class when dialog is open', () => {
    const el = document.createElement('el-dm-dialog') as ElDmDialog;
    el.open = true;
    container.appendChild(el);

    const wrapper = el.shadowRoot?.querySelector('.dialog-wrapper');
    expect(wrapper?.classList.contains('open')).toBe(true);
    el.close();
  });
});

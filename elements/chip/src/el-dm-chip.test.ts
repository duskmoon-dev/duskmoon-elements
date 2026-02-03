import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmChip, register } from './index';

register();

describe('ElDmChip', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('is defined', () => {
    expect(customElements.get('el-dm-chip')).toBe(ElDmChip);
  });

  test('creates a shadow root with chip', () => {
    const el = document.createElement('el-dm-chip') as ElDmChip;
    container.appendChild(el);

    const chip = el.shadowRoot?.querySelector('.chip');
    expect(chip).toBeDefined();
  });

  test('has button role and tabindex', () => {
    const el = document.createElement('el-dm-chip') as ElDmChip;
    container.appendChild(el);

    const chip = el.shadowRoot?.querySelector('.chip');
    expect(chip?.getAttribute('role')).toBe('button');
    expect(chip?.getAttribute('tabindex')).toBe('0');
  });

  test('applies variant classes', () => {
    const el = document.createElement('el-dm-chip') as ElDmChip;
    el.variant = 'outlined';
    container.appendChild(el);

    const chip = el.shadowRoot?.querySelector('.chip');
    expect(chip?.classList.contains('chip-outlined')).toBe(true);
  });

  test('applies color classes', () => {
    const el = document.createElement('el-dm-chip') as ElDmChip;
    el.color = 'error';
    container.appendChild(el);

    const chip = el.shadowRoot?.querySelector('.chip');
    expect(chip?.classList.contains('chip-error')).toBe(true);
  });

  test('applies size classes', () => {
    const el = document.createElement('el-dm-chip') as ElDmChip;
    el.size = 'lg';
    container.appendChild(el);

    const chip = el.shadowRoot?.querySelector('.chip');
    expect(chip?.classList.contains('chip-lg')).toBe(true);
  });

  test('shows delete button when deletable', () => {
    const el = document.createElement('el-dm-chip') as ElDmChip;
    el.deletable = true;
    container.appendChild(el);

    const deleteBtn = el.shadowRoot?.querySelector('.chip-delete');
    expect(deleteBtn).toBeDefined();
  });

  test('does not show delete button when not deletable', () => {
    const el = document.createElement('el-dm-chip') as ElDmChip;
    container.appendChild(el);

    const deleteBtn = el.shadowRoot?.querySelector('.chip-delete');
    expect(deleteBtn).toBeNull();
  });

  test('applies selected class', () => {
    const el = document.createElement('el-dm-chip') as ElDmChip;
    el.selected = true;
    container.appendChild(el);

    const chip = el.shadowRoot?.querySelector('.chip');
    expect(chip?.classList.contains('chip-selected')).toBe(true);
  });

  test('reflects disabled attribute', () => {
    const el = document.createElement('el-dm-chip') as ElDmChip;
    el.disabled = true;
    container.appendChild(el);

    expect(el.hasAttribute('disabled')).toBe(true);
  });

  test('has icon and default slots', () => {
    const el = document.createElement('el-dm-chip') as ElDmChip;
    container.appendChild(el);

    const iconSlot = el.shadowRoot?.querySelector('slot[name="icon"]');
    const defaultSlot = el.shadowRoot?.querySelector('slot:not([name])');

    expect(iconSlot).toBeDefined();
    expect(defaultSlot).toBeDefined();
  });
});

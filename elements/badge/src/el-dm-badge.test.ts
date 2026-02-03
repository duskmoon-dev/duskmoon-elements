import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmBadge, register } from './index';

register();

describe('ElDmBadge', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('is defined', () => {
    expect(customElements.get('el-dm-badge')).toBe(ElDmBadge);
  });

  test('creates a shadow root with badge', () => {
    const el = document.createElement('el-dm-badge') as ElDmBadge;
    container.appendChild(el);

    const badge = el.shadowRoot?.querySelector('.badge');
    expect(badge).toBeDefined();
  });

  test('applies variant classes', () => {
    const el = document.createElement('el-dm-badge') as ElDmBadge;
    el.variant = 'outlined';
    container.appendChild(el);

    const badge = el.shadowRoot?.querySelector('.badge');
    expect(badge?.classList.contains('badge-outlined')).toBe(true);
  });

  test('applies color classes', () => {
    const el = document.createElement('el-dm-badge') as ElDmBadge;
    el.color = 'success';
    container.appendChild(el);

    const badge = el.shadowRoot?.querySelector('.badge');
    expect(badge?.classList.contains('badge-success')).toBe(true);
  });

  test('applies size classes', () => {
    const el = document.createElement('el-dm-badge') as ElDmBadge;
    el.size = 'sm';
    container.appendChild(el);

    const badge = el.shadowRoot?.querySelector('.badge');
    expect(badge?.classList.contains('badge-sm')).toBe(true);
  });

  test('applies pill class', () => {
    const el = document.createElement('el-dm-badge') as ElDmBadge;
    el.pill = true;
    container.appendChild(el);

    const badge = el.shadowRoot?.querySelector('.badge');
    expect(badge?.classList.contains('badge-pill')).toBe(true);
  });

  test('applies dot class and hides content', () => {
    const el = document.createElement('el-dm-badge') as ElDmBadge;
    el.dot = true;
    container.appendChild(el);

    const badge = el.shadowRoot?.querySelector('.badge');
    expect(badge?.classList.contains('badge-dot')).toBe(true);
    const slot = el.shadowRoot?.querySelector('slot');
    expect(slot).toBeNull();
  });

  test('has default slot when not dot', () => {
    const el = document.createElement('el-dm-badge') as ElDmBadge;
    container.appendChild(el);

    const slot = el.shadowRoot?.querySelector('slot');
    expect(slot).toBeDefined();
  });

  test('exposes badge part', () => {
    const el = document.createElement('el-dm-badge') as ElDmBadge;
    container.appendChild(el);

    const badge = el.shadowRoot?.querySelector('[part="badge"]');
    expect(badge).toBeDefined();
  });
});

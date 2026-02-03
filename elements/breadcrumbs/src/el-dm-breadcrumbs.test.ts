import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmBreadcrumbs, register } from './index';

register();

describe('ElDmBreadcrumbs', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('is defined', () => {
    expect(customElements.get('el-dm-breadcrumbs')).toBe(ElDmBreadcrumbs);
  });

  test('creates a shadow root with nav element', () => {
    const el = document.createElement('el-dm-breadcrumbs') as ElDmBreadcrumbs;
    container.appendChild(el);

    const nav = el.shadowRoot?.querySelector('.breadcrumbs-nav');
    expect(nav).toBeDefined();
  });

  test('renders breadcrumb items from data', () => {
    const el = document.createElement('el-dm-breadcrumbs') as ElDmBreadcrumbs;
    el.items = [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Current' },
    ] as any;
    container.appendChild(el);

    const items = el.shadowRoot?.querySelectorAll('.breadcrumbs-item');
    expect(items?.length).toBeGreaterThanOrEqual(1);
  });

  test('default separator is /', () => {
    const el = document.createElement('el-dm-breadcrumbs') as ElDmBreadcrumbs;
    container.appendChild(el);

    expect(el.separator).toBe('/');
  });

  test('applies custom separator', () => {
    const el = document.createElement('el-dm-breadcrumbs') as ElDmBreadcrumbs;
    el.separator = '>';
    container.appendChild(el);

    expect(el.getAttribute('separator')).toBe('>');
  });

  test('has separator slot', () => {
    const el = document.createElement('el-dm-breadcrumbs') as ElDmBreadcrumbs;
    container.appendChild(el);

    const separatorSlot = el.shadowRoot?.querySelector('slot[name="separator"]');
    expect(separatorSlot).toBeDefined();
  });
});

import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmBreadcrumbs, register } from './index';
import type { BreadcrumbItem } from './index';

register();

function createBreadcrumbs(props: Partial<ElDmBreadcrumbs> = {}): ElDmBreadcrumbs {
  const el = document.createElement('el-dm-breadcrumbs') as ElDmBreadcrumbs;
  Object.assign(el, props);
  return el;
}

const sampleItems: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Current' },
];

describe('ElDmBreadcrumbs', () => {
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
    expect(customElements.get('el-dm-breadcrumbs')).toBe(ElDmBreadcrumbs);
  });

  // --- Rendering ---
  test('creates a shadow root with nav element', () => {
    const el = createBreadcrumbs();
    container.appendChild(el);
    const nav = el.shadowRoot?.querySelector('.breadcrumbs-nav');
    expect(nav).toBeDefined();
  });

  test('has ordered list', () => {
    const el = createBreadcrumbs();
    container.appendChild(el);
    const ol = el.shadowRoot?.querySelector('ol.breadcrumbs');
    expect(ol).toBeDefined();
  });

  test('has separator slot', () => {
    const el = createBreadcrumbs();
    container.appendChild(el);
    const separatorSlot = el.shadowRoot?.querySelector('slot[name="separator"]');
    expect(separatorSlot).toBeDefined();
  });

  test('renders breadcrumb items from data', () => {
    const el = createBreadcrumbs({ items: sampleItems });
    container.appendChild(el);
    const items = el.shadowRoot?.querySelectorAll('.breadcrumb-item');
    expect(items?.length).toBe(3);
  });

  test('renders nothing when items is empty', () => {
    const el = createBreadcrumbs({ items: [] });
    container.appendChild(el);
    const items = el.shadowRoot?.querySelectorAll('.breadcrumb-item');
    expect(items?.length).toBe(0);
  });

  // --- Item rendering ---
  test('non-last items are rendered as links', () => {
    const el = createBreadcrumbs({ items: sampleItems });
    container.appendChild(el);
    const links = el.shadowRoot?.querySelectorAll('.breadcrumb-link');
    expect(links?.length).toBe(2);
  });

  test('last item is rendered as current', () => {
    const el = createBreadcrumbs({ items: sampleItems });
    container.appendChild(el);
    const current = el.shadowRoot?.querySelector('.breadcrumb-item-active');
    expect(current).toBeDefined();
    expect(current?.textContent).toBe('Current');
  });

  test('last item has aria-current="page"', () => {
    const el = createBreadcrumbs({ items: sampleItems });
    container.appendChild(el);
    const current = el.shadowRoot?.querySelector('.breadcrumb-item-active');
    expect(current?.getAttribute('aria-current')).toBe('page');
  });

  test('links have correct href', () => {
    const el = createBreadcrumbs({ items: sampleItems });
    container.appendChild(el);
    const links = el.shadowRoot?.querySelectorAll('.breadcrumb-link');
    expect(links?.[0]?.getAttribute('href')).toBe('/');
    expect(links?.[1]?.getAttribute('href')).toBe('/products');
  });

  test('links have data-index attribute', () => {
    const el = createBreadcrumbs({ items: sampleItems });
    container.appendChild(el);
    const links = el.shadowRoot?.querySelectorAll('.breadcrumb-link');
    expect(links?.[0]?.getAttribute('data-index')).toBe('0');
    expect(links?.[1]?.getAttribute('data-index')).toBe('1');
  });

  test('items without href default to #', () => {
    const el = createBreadcrumbs({ items: [{ label: 'No href' }, { label: 'Last' }] });
    container.appendChild(el);
    const link = el.shadowRoot?.querySelector('.breadcrumb-link');
    expect(link?.getAttribute('href')).toBe('#');
  });

  // --- Separator ---
  test('default separator is /', () => {
    const el = createBreadcrumbs();
    container.appendChild(el);
    expect(el.separator).toBe('/');
  });

  test('applies custom separator', () => {
    const el = createBreadcrumbs({ separator: '>' });
    container.appendChild(el);
    expect(el.getAttribute('separator')).toBe('>');
  });

  test('separator is rendered between items', () => {
    const el = createBreadcrumbs({ items: sampleItems });
    container.appendChild(el);
    const separators = el.shadowRoot?.querySelectorAll('.breadcrumb-separator');
    expect(separators?.length).toBe(2);
  });

  test('separator has aria-hidden', () => {
    const el = createBreadcrumbs({ items: sampleItems });
    container.appendChild(el);
    const separator = el.shadowRoot?.querySelector('.breadcrumb-separator');
    expect(separator?.getAttribute('aria-hidden')).toBe('true');
  });

  test('custom separator text is rendered', () => {
    const el = createBreadcrumbs({ items: sampleItems, separator: '>' });
    container.appendChild(el);
    const separator = el.shadowRoot?.querySelector('.breadcrumb-separator');
    expect(separator?.textContent).toContain('>');
  });

  // --- Accessibility ---
  test('nav has aria-label', () => {
    const el = createBreadcrumbs();
    container.appendChild(el);
    const nav = el.shadowRoot?.querySelector('.breadcrumbs-nav');
    expect(nav?.getAttribute('aria-label')).toBe('Breadcrumb');
  });

  // --- Single item ---
  test('single item is rendered as current', () => {
    const el = createBreadcrumbs({ items: [{ label: 'Only' }] });
    container.appendChild(el);
    const current = el.shadowRoot?.querySelector('.breadcrumb-item-active');
    expect(current).toBeDefined();
    expect(current?.textContent).toBe('Only');
    const links = el.shadowRoot?.querySelectorAll('.breadcrumb-link');
    expect(links?.length).toBe(0);
  });

  // --- CSS Parts ---
  test('has nav part', () => {
    const el = createBreadcrumbs();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="nav"]')).toBeDefined();
  });

  test('has list part', () => {
    const el = createBreadcrumbs();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="list"]')).toBeDefined();
  });

  test('has item part on items', () => {
    const el = createBreadcrumbs({ items: sampleItems });
    container.appendChild(el);
    const items = el.shadowRoot?.querySelectorAll('[part="item"]');
    expect(items?.length).toBe(3);
  });

  test('has link part', () => {
    const el = createBreadcrumbs({ items: sampleItems });
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="link"]')).toBeDefined();
  });

  test('has current part', () => {
    const el = createBreadcrumbs({ items: sampleItems });
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="current"]')).toBeDefined();
  });

  test('has separator part', () => {
    const el = createBreadcrumbs({ items: sampleItems });
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="separator"]')).toBeDefined();
  });
});

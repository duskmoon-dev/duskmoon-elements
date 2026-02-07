import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmPagination, register } from './index';

register();

function createPagination(props: Partial<ElDmPagination> = {}): ElDmPagination {
  const el = document.createElement('el-dm-pagination') as ElDmPagination;
  Object.assign(el, props);
  return el;
}

describe('ElDmPagination', () => {
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
    expect(customElements.get('el-dm-pagination')).toBe(ElDmPagination);
  });

  // --- Rendering ---
  test('creates a shadow root with navigation role', () => {
    const el = createPagination();
    container.appendChild(el);
    const nav = el.shadowRoot?.querySelector('[role="navigation"]');
    expect(nav).toBeDefined();
  });

  test('has aria-label', () => {
    const el = createPagination();
    container.appendChild(el);
    const nav = el.shadowRoot?.querySelector('.pagination');
    expect(nav?.getAttribute('aria-label')).toBe('Pagination');
  });

  test('renders page buttons', () => {
    const el = createPagination({ total: 10, current: 1 });
    container.appendChild(el);
    const buttons = el.shadowRoot?.querySelectorAll('.pagination-btn');
    expect(buttons?.length).toBeGreaterThan(0);
  });

  test('has 4 navigation buttons (first, prev, next, last)', () => {
    const el = createPagination({ total: 10 });
    container.appendChild(el);
    const navBtns = el.shadowRoot?.querySelectorAll('.nav-btn');
    expect(navBtns?.length).toBe(4);
  });

  // --- Properties ---
  test('defaults total to 1', () => {
    const el = createPagination();
    container.appendChild(el);
    expect(el.total).toBe(1);
  });

  test('defaults current to 1', () => {
    const el = createPagination();
    container.appendChild(el);
    expect(el.current).toBe(1);
  });

  test('defaults siblings to 1', () => {
    const el = createPagination();
    container.appendChild(el);
    expect(el.siblings).toBe(1);
  });

  test('defaults boundaries to 1', () => {
    const el = createPagination();
    container.appendChild(el);
    expect(el.boundaries).toBe(1);
  });

  test('reflects total attribute', () => {
    const el = createPagination({ total: 20 });
    container.appendChild(el);
    expect(el.getAttribute('total')).toBe('20');
  });

  test('reflects current attribute', () => {
    const el = createPagination({ current: 5 });
    container.appendChild(el);
    expect(el.getAttribute('current')).toBe('5');
  });

  // --- Active page ---
  test('marks current page as active', () => {
    const el = createPagination({ total: 5, current: 3 });
    container.appendChild(el);
    const active = el.shadowRoot?.querySelector('.active');
    expect(active).toBeDefined();
    expect(active?.textContent?.trim()).toBe('3');
  });

  test('active page has aria-current="page"', () => {
    const el = createPagination({ total: 5, current: 2 });
    container.appendChild(el);
    const active = el.shadowRoot?.querySelector('.active');
    expect(active?.getAttribute('aria-current')).toBe('page');
  });

  test('non-active page has aria-current="false"', () => {
    const el = createPagination({ total: 5, current: 1 });
    container.appendChild(el);
    const pages = el.shadowRoot?.querySelectorAll('[data-page]');
    const nonActive = Array.from(pages || []).find(p => p.getAttribute('data-page') !== '1');
    expect(nonActive?.getAttribute('aria-current')).toBe('false');
  });

  // --- Page range rendering ---
  test('renders all pages when total is small', () => {
    const el = createPagination({ total: 5, current: 1 });
    container.appendChild(el);
    const pages = el.shadowRoot?.querySelectorAll('[data-page]');
    expect(pages?.length).toBe(5);
  });

  test('renders ellipsis for large total', () => {
    const el = createPagination({ total: 20, current: 10 });
    container.appendChild(el);
    const ellipses = el.shadowRoot?.querySelectorAll('.ellipsis');
    expect(ellipses?.length).toBeGreaterThan(0);
  });

  test('ellipsis has aria-hidden', () => {
    const el = createPagination({ total: 20, current: 10 });
    container.appendChild(el);
    const ellipsis = el.shadowRoot?.querySelector('.ellipsis');
    expect(ellipsis?.getAttribute('aria-hidden')).toBe('true');
  });

  test('page buttons have data-page attribute', () => {
    const el = createPagination({ total: 5, current: 1 });
    container.appendChild(el);
    const page1 = el.shadowRoot?.querySelector('[data-page="1"]');
    expect(page1).toBeDefined();
  });

  test('page buttons have aria-label', () => {
    const el = createPagination({ total: 5, current: 1 });
    container.appendChild(el);
    const page = el.shadowRoot?.querySelector('[data-page="1"]');
    expect(page?.getAttribute('aria-label')).toBe('Page 1');
  });

  // --- Navigation buttons ---
  test('nav buttons have data-action attributes', () => {
    const el = createPagination({ total: 10 });
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[data-action="first"]')).toBeDefined();
    expect(el.shadowRoot?.querySelector('[data-action="prev"]')).toBeDefined();
    expect(el.shadowRoot?.querySelector('[data-action="next"]')).toBeDefined();
    expect(el.shadowRoot?.querySelector('[data-action="last"]')).toBeDefined();
  });

  test('first/prev disabled on first page', () => {
    const el = createPagination({ total: 10, current: 1 });
    container.appendChild(el);
    const first = el.shadowRoot?.querySelector('[data-action="first"]') as HTMLButtonElement;
    const prev = el.shadowRoot?.querySelector('[data-action="prev"]') as HTMLButtonElement;
    expect(first?.disabled).toBe(true);
    expect(prev?.disabled).toBe(true);
  });

  test('next/last disabled on last page', () => {
    const el = createPagination({ total: 10, current: 10 });
    container.appendChild(el);
    const next = el.shadowRoot?.querySelector('[data-action="next"]') as HTMLButtonElement;
    const last = el.shadowRoot?.querySelector('[data-action="last"]') as HTMLButtonElement;
    expect(next?.disabled).toBe(true);
    expect(last?.disabled).toBe(true);
  });

  test('all nav buttons enabled on middle page', () => {
    const el = createPagination({ total: 10, current: 5 });
    container.appendChild(el);
    const first = el.shadowRoot?.querySelector('[data-action="first"]') as HTMLButtonElement;
    const prev = el.shadowRoot?.querySelector('[data-action="prev"]') as HTMLButtonElement;
    const next = el.shadowRoot?.querySelector('[data-action="next"]') as HTMLButtonElement;
    const last = el.shadowRoot?.querySelector('[data-action="last"]') as HTMLButtonElement;
    expect(first?.disabled).toBe(false);
    expect(prev?.disabled).toBe(false);
    expect(next?.disabled).toBe(false);
    expect(last?.disabled).toBe(false);
  });

  test('nav buttons have aria-labels', () => {
    const el = createPagination({ total: 10 });
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[data-action="first"]')?.getAttribute('aria-label')).toBe('Go to first page');
    expect(el.shadowRoot?.querySelector('[data-action="prev"]')?.getAttribute('aria-label')).toBe('Go to previous page');
    expect(el.shadowRoot?.querySelector('[data-action="next"]')?.getAttribute('aria-label')).toBe('Go to next page');
    expect(el.shadowRoot?.querySelector('[data-action="last"]')?.getAttribute('aria-label')).toBe('Go to last page');
  });

  test('nav buttons contain SVG icons', () => {
    const el = createPagination({ total: 10 });
    container.appendChild(el);
    const navBtns = el.shadowRoot?.querySelectorAll('.nav-btn');
    navBtns?.forEach(btn => {
      const svg = btn.querySelector('svg');
      expect(svg).toBeDefined();
    });
  });

  // --- Single page ---
  test('single page total renders one page button', () => {
    const el = createPagination({ total: 1, current: 1 });
    container.appendChild(el);
    const pages = el.shadowRoot?.querySelectorAll('[data-page]');
    expect(pages?.length).toBe(1);
  });

  test('single page disables all nav buttons', () => {
    const el = createPagination({ total: 1, current: 1 });
    container.appendChild(el);
    const first = el.shadowRoot?.querySelector('[data-action="first"]') as HTMLButtonElement;
    const last = el.shadowRoot?.querySelector('[data-action="last"]') as HTMLButtonElement;
    expect(first?.disabled).toBe(true);
    expect(last?.disabled).toBe(true);
  });

  // --- Edge cases ---
  test('handles total < 1 as 1', () => {
    const el = createPagination({ total: 0, current: 1 });
    container.appendChild(el);
    const pages = el.shadowRoot?.querySelectorAll('[data-page]');
    expect(pages?.length).toBe(1);
  });

  test('clamps current to total', () => {
    const el = createPagination({ total: 5, current: 10 });
    container.appendChild(el);
    const active = el.shadowRoot?.querySelector('.active');
    expect(active?.textContent?.trim()).toBe('5');
  });

  test('clamps current to 1 minimum', () => {
    const el = createPagination({ total: 5, current: 0 });
    container.appendChild(el);
    const active = el.shadowRoot?.querySelector('.active');
    expect(active?.textContent?.trim()).toBe('1');
  });

  // --- CSS Parts ---
  test('has container part', () => {
    const el = createPagination();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="container"]')).toBeDefined();
  });

  test('has button parts on nav buttons', () => {
    const el = createPagination({ total: 10 });
    container.appendChild(el);
    const parts = el.shadowRoot?.querySelectorAll('[part="button"]');
    expect(parts?.length).toBe(4);
  });

  test('has page parts', () => {
    const el = createPagination({ total: 5, current: 1 });
    container.appendChild(el);
    const parts = el.shadowRoot?.querySelectorAll('[part="page"]');
    expect(parts?.length).toBe(5);
  });

  test('has ellipsis part', () => {
    const el = createPagination({ total: 20, current: 10 });
    container.appendChild(el);
    const parts = el.shadowRoot?.querySelectorAll('[part="ellipsis"]');
    expect(parts?.length).toBeGreaterThan(0);
  });
});

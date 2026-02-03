import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmPagination, register } from './index';

register();

describe('ElDmPagination', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('is defined', () => {
    expect(customElements.get('el-dm-pagination')).toBe(ElDmPagination);
  });

  test('creates a shadow root with navigation role', () => {
    const el = document.createElement('el-dm-pagination') as ElDmPagination;
    container.appendChild(el);

    const nav = el.shadowRoot?.querySelector('[role="navigation"]');
    expect(nav).toBeDefined();
  });

  test('renders page buttons', () => {
    const el = document.createElement('el-dm-pagination') as ElDmPagination;
    el.total = 10;
    el.current = 1;
    container.appendChild(el);

    const buttons = el.shadowRoot?.querySelectorAll('.pagination-btn');
    expect(buttons?.length).toBeGreaterThan(0);
  });

  test('marks current page as active', () => {
    const el = document.createElement('el-dm-pagination') as ElDmPagination;
    el.total = 5;
    el.current = 3;
    container.appendChild(el);

    const active = el.shadowRoot?.querySelector('.active');
    expect(active).toBeDefined();
  });

  test('reflects total attribute', () => {
    const el = document.createElement('el-dm-pagination') as ElDmPagination;
    el.total = 20;
    container.appendChild(el);

    expect(el.getAttribute('total')).toBe('20');
  });

  test('reflects current attribute', () => {
    const el = document.createElement('el-dm-pagination') as ElDmPagination;
    el.current = 5;
    container.appendChild(el);

    expect(el.getAttribute('current')).toBe('5');
  });

  test('has navigation buttons', () => {
    const el = document.createElement('el-dm-pagination') as ElDmPagination;
    el.total = 10;
    container.appendChild(el);

    const navBtns = el.shadowRoot?.querySelectorAll('.nav-btn');
    expect(navBtns?.length).toBeGreaterThan(0);
  });
});

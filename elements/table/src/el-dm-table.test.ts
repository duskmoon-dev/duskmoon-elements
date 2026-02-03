import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmTable, register } from './index';
import type { TableColumn, TableRow } from './index';

register();

describe('ElDmTable', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('is defined', () => {
    expect(customElements.get('el-dm-table')).toBe(ElDmTable);
  });

  test('creates a shadow root with table', () => {
    const el = document.createElement('el-dm-table') as ElDmTable;
    container.appendChild(el);

    const table = el.shadowRoot?.querySelector('.table');
    expect(table).toBeDefined();
  });

  test('has grid role', () => {
    const el = document.createElement('el-dm-table') as ElDmTable;
    container.appendChild(el);

    const table = el.shadowRoot?.querySelector('[role="grid"]');
    expect(table).toBeDefined();
  });

  test('renders columns and data', () => {
    const el = document.createElement('el-dm-table') as ElDmTable;
    el.columns = [
      { key: 'name', label: 'Name' },
      { key: 'age', label: 'Age' },
    ] as TableColumn[];
    el.data = [
      { id: 1, name: 'Alice', age: 30 },
      { id: 2, name: 'Bob', age: 25 },
    ] as TableRow[];
    container.appendChild(el);

    const headers = el.shadowRoot?.querySelectorAll('.table-th');
    const rows = el.shadowRoot?.querySelectorAll('.table-row');
    expect(headers?.length).toBeGreaterThanOrEqual(2);
    expect(rows?.length).toBe(2);
  });

  test('shows empty message when no data', () => {
    const el = document.createElement('el-dm-table') as ElDmTable;
    el.columns = [{ key: 'name', label: 'Name' }] as TableColumn[];
    el.data = [] as TableRow[];
    container.appendChild(el);

    const empty = el.shadowRoot?.querySelector('.empty-row');
    expect(empty).toBeDefined();
  });

  test('has public sort method', () => {
    const el = document.createElement('el-dm-table') as ElDmTable;
    container.appendChild(el);

    expect(typeof el.sort).toBe('function');
  });

  test('has public goToPage method', () => {
    const el = document.createElement('el-dm-table') as ElDmTable;
    container.appendChild(el);

    expect(typeof el.goToPage).toBe('function');
  });

  test('has header-actions and footer-actions slots', () => {
    const el = document.createElement('el-dm-table') as ElDmTable;
    container.appendChild(el);

    const headerSlot = el.shadowRoot?.querySelector('slot[name="header-actions"]');
    const footerSlot = el.shadowRoot?.querySelector('slot[name="footer-actions"]');
    expect(headerSlot).toBeDefined();
    expect(footerSlot).toBeDefined();
  });

  test('applies striped attribute', () => {
    const el = document.createElement('el-dm-table') as ElDmTable;
    el.striped = true;
    container.appendChild(el);

    expect(el.hasAttribute('striped')).toBe(true);
  });
});

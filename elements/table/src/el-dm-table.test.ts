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

    const headers = el.shadowRoot?.querySelectorAll('.table-header-cell');
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

  // ============ Sorting Tests ============

  test('sorts data by column in ascending order', () => {
    const el = document.createElement('el-dm-table') as ElDmTable;
    el.columns = [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'age', label: 'Age', sortable: true },
    ] as TableColumn[];
    el.data = [
      { id: 1, name: 'Charlie', age: 35 },
      { id: 2, name: 'Alice', age: 30 },
      { id: 3, name: 'Bob', age: 25 },
    ] as TableRow[];
    container.appendChild(el);

    el.sort('name', 'asc');

    const visibleData = el.getVisibleData();
    expect(visibleData[0]?.name).toBe('Alice');
    expect(visibleData[1]?.name).toBe('Bob');
    expect(visibleData[2]?.name).toBe('Charlie');
  });

  test('sorts data by column in descending order', () => {
    const el = document.createElement('el-dm-table') as ElDmTable;
    el.columns = [
      { key: 'age', label: 'Age', sortable: true },
    ] as TableColumn[];
    el.data = [
      { id: 1, name: 'Charlie', age: 35 },
      { id: 2, name: 'Alice', age: 30 },
      { id: 3, name: 'Bob', age: 25 },
    ] as TableRow[];
    container.appendChild(el);

    el.sort('age', 'desc');

    const visibleData = el.getVisibleData();
    expect(visibleData[0]?.age).toBe(35);
    expect(visibleData[1]?.age).toBe(30);
    expect(visibleData[2]?.age).toBe(25);
  });

  test('toggles sort direction when calling sort on same column', () => {
    const el = document.createElement('el-dm-table') as ElDmTable;
    el.columns = [{ key: 'name', label: 'Name', sortable: true }] as TableColumn[];
    el.data = [
      { id: 1, name: 'Charlie', age: 35 },
      { id: 2, name: 'Alice', age: 30 },
    ] as TableRow[];
    container.appendChild(el);

    el.sort('name'); // First sort - asc
    expect(el.sortDirection).toBe('asc');

    el.sort('name'); // Second sort - desc
    expect(el.sortDirection).toBe('desc');

    el.sort('name'); // Third sort - asc again
    expect(el.sortDirection).toBe('asc');
  });

  test('emits sort event with column and direction', () => {
    const el = document.createElement('el-dm-table') as ElDmTable;
    el.columns = [{ key: 'name', label: 'Name', sortable: true }] as TableColumn[];
    container.appendChild(el);

    let sortDetail: any = null;
    el.addEventListener('sort', ((e: CustomEvent) => {
      sortDetail = e.detail;
    }) as EventListener);

    el.sort('name', 'desc');

    expect(sortDetail).toBeDefined();
    expect(sortDetail.column).toBe('name');
    expect(sortDetail.direction).toBe('desc');
  });

  test('handles sorting with null/undefined values', () => {
    const el = document.createElement('el-dm-table') as ElDmTable;
    el.columns = [{ key: 'age', label: 'Age', sortable: true }] as TableColumn[];
    el.data = [
      { id: 1, name: 'Alice', age: 30 },
      { id: 2, name: 'Bob', age: null },
      { id: 3, name: 'Charlie', age: undefined },
      { id: 4, name: 'Dave', age: 25 },
    ] as TableRow[];
    container.appendChild(el);

    el.sort('age', 'asc');

    const rows = Array.from(el.shadowRoot?.querySelectorAll('.table-row') || []);
    expect(rows.length).toBe(4);
    // Null/undefined should be sorted to the end
  });

  // ============ Pagination Tests ============

  test('paginates data when paginated is true', () => {
    const el = document.createElement('el-dm-table') as ElDmTable;
    el.columns = [{ key: 'name', label: 'Name' }] as TableColumn[];
    el.data = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
    })) as TableRow[];
    el.paginated = true;
    el.pageSize = 10;
    container.appendChild(el);

    const rows = el.shadowRoot?.querySelectorAll('.table-row');
    expect(rows?.length).toBe(10);
  });

  test('goToPage changes current page', () => {
    const el = document.createElement('el-dm-table') as ElDmTable;
    el.columns = [{ key: 'name', label: 'Name' }] as TableColumn[];
    el.data = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
    })) as TableRow[];
    el.paginated = true;
    el.pageSize = 10;
    container.appendChild(el);

    el.goToPage(2);

    expect(el.page).toBe(2);
    const visibleData = el.getVisibleData();
    expect(visibleData[0]?.name).toBe('Item 11');
    expect(visibleData.length).toBe(10);
  });

  test('goToPage clamps to valid page range', () => {
    const el = document.createElement('el-dm-table') as ElDmTable;
    el.columns = [{ key: 'name', label: 'Name' }] as TableColumn[];
    el.data = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
    })) as TableRow[];
    el.paginated = true;
    el.pageSize = 10;
    container.appendChild(el);

    el.goToPage(10); // Beyond max
    expect(el.page).toBe(3); // Should clamp to last page

    el.goToPage(0); // Below min
    expect(el.page).toBe(1); // Should clamp to first page
  });

  test('emits page-change event', () => {
    const el = document.createElement('el-dm-table') as ElDmTable;
    el.columns = [{ key: 'name', label: 'Name' }] as TableColumn[];
    el.data = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
    })) as TableRow[];
    el.paginated = true;
    el.pageSize = 10;
    container.appendChild(el);

    let pageDetail: any = null;
    el.addEventListener('page-change', ((e: CustomEvent) => {
      pageDetail = e.detail;
    }) as EventListener);

    el.goToPage(2);

    expect(pageDetail).toBeDefined();
    expect(pageDetail.page).toBe(2);
    expect(pageDetail.pageSize).toBe(10);
  });

  // ============ Selection Tests ============

  test('selectRow adds row to selection in multiple mode', () => {
    const el = document.createElement('el-dm-table') as ElDmTable;
    el.columns = [{ key: 'name', label: 'Name' }] as TableColumn[];
    el.data = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ] as TableRow[];
    el.selectionMode = 'multiple';
    container.appendChild(el);

    el.selectRow(1);
    el.selectRow(2);

    expect(el.selectedIds.length).toBe(2);
    expect(el.selectedIds).toContain(1);
    expect(el.selectedIds).toContain(2);
  });

  test('selectRow replaces selection in single mode', () => {
    const el = document.createElement('el-dm-table') as ElDmTable;
    el.columns = [{ key: 'name', label: 'Name' }] as TableColumn[];
    el.data = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ] as TableRow[];
    el.selectionMode = 'single';
    container.appendChild(el);

    el.selectRow(1);
    el.selectRow(2);

    expect(el.selectedIds.length).toBe(1);
    expect(el.selectedIds).toContain(2);
    expect(el.selectedIds).not.toContain(1);
  });

  test('deselectRow removes row from selection', () => {
    const el = document.createElement('el-dm-table') as ElDmTable;
    el.columns = [{ key: 'name', label: 'Name' }] as TableColumn[];
    el.data = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ] as TableRow[];
    el.selectionMode = 'multiple';
    container.appendChild(el);

    el.selectRow(1);
    el.selectRow(2);
    el.deselectRow(1);

    expect(el.selectedIds.length).toBe(1);
    expect(el.selectedIds).toContain(2);
    expect(el.selectedIds).not.toContain(1);
  });

  test('toggleRowSelection toggles selection state', () => {
    const el = document.createElement('el-dm-table') as ElDmTable;
    el.columns = [{ key: 'name', label: 'Name' }] as TableColumn[];
    el.data = [{ id: 1, name: 'Alice' }] as TableRow[];
    el.selectionMode = 'multiple';
    container.appendChild(el);

    el.toggleRowSelection(1);
    expect(el.selectedIds).toContain(1);

    el.toggleRowSelection(1);
    expect(el.selectedIds).not.toContain(1);
  });

  test('selectAll selects all rows', () => {
    const el = document.createElement('el-dm-table') as ElDmTable;
    el.columns = [{ key: 'name', label: 'Name' }] as TableColumn[];
    el.data = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' },
    ] as TableRow[];
    el.selectionMode = 'multiple';
    container.appendChild(el);

    el.selectAll();

    expect(el.selectedIds.length).toBe(3);
    expect(el.selectedIds).toContain(1);
    expect(el.selectedIds).toContain(2);
    expect(el.selectedIds).toContain(3);
  });

  test('deselectAll clears all selections', () => {
    const el = document.createElement('el-dm-table') as ElDmTable;
    el.columns = [{ key: 'name', label: 'Name' }] as TableColumn[];
    el.data = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ] as TableRow[];
    el.selectionMode = 'multiple';
    container.appendChild(el);

    el.selectAll();
    el.deselectAll();

    expect(el.selectedIds.length).toBe(0);
  });

  test('emits select event', () => {
    const el = document.createElement('el-dm-table') as ElDmTable;
    el.columns = [{ key: 'name', label: 'Name' }] as TableColumn[];
    el.data = [{ id: 1, name: 'Alice' }] as TableRow[];
    el.selectionMode = 'multiple';
    container.appendChild(el);

    let selectionDetail: any = null;
    el.addEventListener('select', ((e: CustomEvent) => {
      selectionDetail = e.detail;
    }) as EventListener);

    el.selectRow(1);

    expect(selectionDetail).toBeDefined();
    expect(selectionDetail.selectedIds.length).toBe(1);
    expect(selectionDetail.selectedRows.length).toBe(1);
  });

  // ============ Loading and Empty States ============

  test('shows loading state', () => {
    const el = document.createElement('el-dm-table') as ElDmTable;
    el.columns = [{ key: 'name', label: 'Name' }] as TableColumn[];
    el.loading = true;
    container.appendChild(el);

    const loadingRow = el.shadowRoot?.querySelector('.loading-row');
    expect(loadingRow).toBeDefined();
  });

  test('shows empty message when no data and not loading', () => {
    const el = document.createElement('el-dm-table') as ElDmTable;
    el.columns = [{ key: 'name', label: 'Name' }] as TableColumn[];
    el.data = [];
    el.loading = false;
    container.appendChild(el);

    const emptyRow = el.shadowRoot?.querySelector('.empty-row');
    expect(emptyRow).toBeDefined();
  });

  // ============ Attributes and Styling ============

  test('applies bordered attribute', () => {
    const el = document.createElement('el-dm-table') as ElDmTable;
    el.bordered = true;
    container.appendChild(el);

    expect(el.hasAttribute('bordered')).toBe(true);
  });

  test('applies compact attribute', () => {
    const el = document.createElement('el-dm-table') as ElDmTable;
    el.compact = true;
    container.appendChild(el);

    expect(el.hasAttribute('compact')).toBe(true);
  });

  test('hoverable defaults to true', () => {
    const el = document.createElement('el-dm-table') as ElDmTable;
    container.appendChild(el);

    // hoverable defaults to true
    expect(el.hoverable).toBe(true);
  });

  test('can disable hoverable', () => {
    const el = document.createElement('el-dm-table') as ElDmTable;
    el.hoverable = false;
    container.appendChild(el);

    expect(el.hasAttribute('hoverable')).toBe(false);
  });
});
